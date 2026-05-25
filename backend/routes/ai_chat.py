from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from supabase import create_client
from datetime import datetime, date
import re
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase    = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class ChatRequest(BaseModel):
    question: str

# ─── Date Extraction ──────────────────────────────────────────
def extract_period(question: str):
    """
    Extract time period from natural language question.
    Returns (year, month_or_list_or_None, period_label)
    """
    q = question.lower()
    today = date.today()

    MONTHS = {
        'january':1,'february':2,'march':3,'april':4,'may':5,'june':6,
        'july':7,'august':8,'september':9,'october':10,'november':11,'december':12,
        'jan':1,'feb':2,'mar':3,'apr':4,'jun':6,'jul':7,'aug':8,
        'sep':9,'oct':10,'nov':11,'dec':12
    }

    # "this month"
    if 'this month' in q:
        return today.year, today.month, today.strftime('%B %Y')

    # "last month"
    if 'last month' in q:
        if today.month == 1:
            y, m = today.year - 1, 12
        else:
            y, m = today.year, today.month - 1
        return y, m, datetime(y, m, 1).strftime('%B %Y')

    # "this year" / "current year"
    if 'this year' in q or 'current year' in q:
        return today.year, None, str(today.year)

    # "last year"
    if 'last year' in q:
        return today.year - 1, None, str(today.year - 1)

    # "Month YYYY" e.g. "March 2025"
    for name, num in MONTHS.items():
        m = re.search(rf'\b{name}\s+(\d{{4}})\b', q)
        if m:
            y = int(m.group(1))
            return y, num, datetime(y, num, 1).strftime('%B %Y')

    # "YYYY Month" e.g. "2025 March"
    for name, num in MONTHS.items():
        m = re.search(rf'\b(\d{{4}})\s+{name}\b', q)
        if m:
            y = int(m.group(1))
            return y, num, datetime(y, num, 1).strftime('%B %Y')

    # Quarter "Q1 2025" or "Q1" (Indian fiscal: Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
    qm = re.search(r'\bq([1-4])\s*(\d{4})?\b', q)
    if qm:
        quarter = int(qm.group(1))
        y = int(qm.group(2)) if qm.group(2) else today.year
        quarter_months = {1:[4,5,6], 2:[7,8,9], 3:[10,11,12], 4:[1,2,3]}
        return y, quarter_months[quarter], f"Q{quarter} FY{y}"

    # Specific year "2024" or "2025"
    ym = re.search(r'\b(202[3-6])\b', q)
    if ym:
        return int(ym.group(1)), None, str(ym.group(1))

    # No period found → all time
    return None, None, "all time (April 2023 – May 2026)"


# ─── Period Metrics Calculator ────────────────────────────────
def calc_metrics(txns, year, month):
    """
    Filter transactions by period and calculate metrics.
    month can be: int (single month), list (quarter), or None (full year/all)
    """
    if year is None:
        filtered = txns
    elif isinstance(month, list):
        # Quarter — handle fiscal year rollover
        filtered = [
            t for t in txns
            if (
                datetime.strptime(t["date"], "%Y-%m-%d").year == year
                and datetime.strptime(t["date"], "%Y-%m-%d").month in month
            ) or (
                # Q4 spans Jan-Mar of next calendar year
                month == [1,2,3]
                and datetime.strptime(t["date"], "%Y-%m-%d").year == year + 1
                and datetime.strptime(t["date"], "%Y-%m-%d").month in month
            )
        ]
    elif month is not None:
        filtered = [
            t for t in txns
            if (datetime.strptime(t["date"], "%Y-%m-%d").year == year
                and datetime.strptime(t["date"], "%Y-%m-%d").month == month)
        ]
    else:
        # Full year
        filtered = [
            t for t in txns
            if datetime.strptime(t["date"], "%Y-%m-%d").year == year
        ]

    income   = [t for t in filtered if t["type"] == "income"]
    expense  = [t for t in filtered if t["type"] == "expense"]
    revenue  = sum(t["amount"] for t in income)
    expenses = sum(t["amount"] for t in expense)
    profit   = revenue - expenses
    margin   = (profit / revenue * 100) if revenue > 0 else 0

    # Category breakdown
    cat_map = {}
    for t in expense:
        c = t.get("category", "Other")
        cat_map[c] = cat_map.get(c, 0) + t["amount"]
    top_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)[:5]
    cat_str  = ", ".join([f"{k}: Rs.{v/100000:.1f}L" for k, v in top_cats])

    return {
        "txn_count": len(filtered),
        "revenue":   revenue,
        "expenses":  expenses,
        "profit":    profit,
        "margin":    margin,
        "top_cats":  cat_str,
    }


# ─── Main Chat Endpoint ───────────────────────────────────────
@router.post("/api/ai/chat")
async def ai_chat(request: ChatRequest):

    # Step 1 — Fetch ALL transactions in batches
    all_txns, page = [], 0
    while True:
        batch = supabase.table("transactions")\
            .select("*")\
            .range(page * 1000, (page + 1) * 1000 - 1)\
            .execute().data
        if not batch:
            break
        all_txns.extend(batch)
        if len(batch) < 1000:
            break
        page += 1
    txns = all_txns

    # Step 2 — Extract period from question
    year, month, period_label = extract_period(request.question)

    # Step 3 — Calculate metrics for requested period
    pm = calc_metrics(txns, year, month)

    # Step 4 — Calculate all-time totals for context
    at = calc_metrics(txns, None, None)

    # Step 5 — Fetch alerts and AR
    alerts    = supabase.table("ai_risk_alerts")\
        .select("*").eq("status", "Open").execute().data
    open_alerts = len(alerts)
    critical    = [a for a in alerts if a["severity"] == "Critical"]

    ar = supabase.table("accounts_receivable").select("*").execute().data
    outstanding = sum(r["balance_due"] for r in ar if r["balance_due"])

    # Step 6 — Build dynamic system prompt
    system_prompt = f"""
You are an expert AI CFO Assistant for Nexus TechServe Pvt Ltd,
an Indian IT Services SME in Pune, Maharashtra (GSTIN: 27AAACN4521R1ZP).

The user asked about: "{period_label}"

PERIOD-SPECIFIC DATA ({period_label}):
- Transactions:  {pm['txn_count']:,}
- Revenue:       Rs.{pm['revenue']/10000000:.2f} Cr
- Expenses:      Rs.{pm['expenses']/10000000:.2f} Cr
- Net Profit:    Rs.{pm['profit']/10000000:.2f} Cr
- Profit Margin: {pm['margin']:.1f}%
- Top Expenses:  {pm['top_cats'] if pm['top_cats'] else 'No data'}

ALL-TIME TOTALS (Apr 2023 – May 2026):
- Revenue:       Rs.{at['revenue']/10000000:.2f} Cr
- Expenses:      Rs.{at['expenses']/10000000:.2f} Cr
- Net Profit:    Rs.{at['profit']/10000000:.2f} Cr
- Margin:        {at['margin']:.1f}%
- Transactions:  {at['txn_count']:,}

COMPLIANCE STATUS:
- Open Risk Alerts:  {open_alerts}
- Critical Alerts:   {len(critical)}
- AR Outstanding:    Rs.{outstanding/100000:.1f}L
- Next GSTR-1:       11th of every month
- Next GSTR-3B:      20th of every month

STRICT RESPONSE RULES:
1. Answer the EXACT question DIRECTLY in the FIRST sentence
2. Use period-specific data when a period is mentioned
3. Use specific Rs. amounts from the data above
4. Maximum 4 sentences — be concise
5. End with ONE actionable recommendation
6. Use Rs.X.XCr for crores, Rs.XXL for lakhs
7. If period has 0 transactions, say "No data found for {period_label}"
8. Never make up numbers — only use data provided above
"""

    # Step 7 — Call Groq LLaMA 3
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": request.question}
        ],
        max_tokens=300,
        temperature=0.2
    )

    return {
        "answer": response.choices[0].message.content,
        "period": period_label,
        "data_context": {
            "period":       period_label,
            "revenue":      round(pm["revenue"], 2),
            "expenses":     round(pm["expenses"], 2),
            "profit":       round(pm["profit"], 2),
            "margin":       round(pm["margin"], 1),
            "txn_count":    pm["txn_count"],
            "open_alerts":  open_alerts,
            "ar_outstanding": round(outstanding, 2),
        }
    }