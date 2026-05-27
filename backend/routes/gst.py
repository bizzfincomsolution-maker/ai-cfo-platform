from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
from datetime import datetime, date
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ─── GST Rate Slabs ───────────────────────────────────────────
GST_RATES = {
    "essential_goods":  0,   # Milk, vegetables, eggs
    "basic_goods":      5,   # Packaged food, medicines
    "standard_goods":  12,   # Computers, phones
    "general_goods":   18,   # Software, services, most goods
    "luxury_goods":    28,   # Cars, luxury items, tobacco
}

GST_CATEGORY_LABELS = {
    "essential_goods":  "Essential Goods (Milk, Vegetables, Eggs)",
    "basic_goods":      "Basic Goods (Packaged Food, Medicines)",
    "standard_goods":   "Standard Goods (Computers, Phones)",
    "general_goods":    "General Goods & Services (Software, Most Services)",
    "luxury_goods":     "Luxury Goods (Cars, Tobacco, Premium Items)",
}

# ─── Income Tax Slabs FY 2025-26 (New Regime) ────────────────
TAX_SLABS_NEW = [
    (400000,   0.00),   # Up to 4L — 0%
    (800000,   0.05),   # 4L to 8L — 5%
    (1200000,  0.10),   # 8L to 12L — 10%
    (1600000,  0.15),   # 12L to 16L — 15%
    (2000000,  0.20),   # 16L to 20L — 20%
    (2400000,  0.25),   # 20L to 24L — 25%
    (float('inf'), 0.30)  # Above 24L — 30%
]

# ─── GST Deadlines ────────────────────────────────────────────
def get_gst_deadlines():
    today = date.today()
    current_month = today.month
    current_year  = today.year

    # Next month calculation
    if current_month == 12:
        next_month, next_year = 1, current_year + 1
    else:
        next_month, next_year = current_month + 1, current_year

    deadlines = [
        {
            "form":        "GSTR-1",
            "description": "Monthly sales return (outward supplies)",
            "due_date":    f"{next_year}-{next_month:02d}-11",
            "frequency":   "Monthly",
            "applicable":  "All regular taxpayers",
            "penalty":     "Rs.50/day (Rs.20/day for nil return)",
        },
        {
            "form":        "GSTR-3B",
            "description": "Monthly summary return + tax payment",
            "due_date":    f"{next_year}-{next_month:02d}-20",
            "frequency":   "Monthly",
            "applicable":  "All regular taxpayers",
            "penalty":     "Rs.50/day + 18% interest on tax due",
        },
        {
            "form":        "GSTR-9",
            "description": "Annual GST return",
            "due_date":    f"{current_year}-12-31",
            "frequency":   "Annual",
            "applicable":  "All regular taxpayers",
            "penalty":     "Rs.200/day (max 0.25% of turnover)",
        },
        {
            "form":        "TDS Return",
            "description": "Quarterly TDS return (Form 26Q/24Q)",
            "due_date":    f"{next_year}-{next_month:02d}-31",
            "frequency":   "Quarterly",
            "applicable":  "TDS deductors",
            "penalty":     "Rs.200/day under section 234E",
        },
        {
            "form":        "Advance Tax",
            "description": "Q1 advance tax installment (15% of annual tax)",
            "due_date":    f"{current_year}-06-15",
            "frequency":   "Quarterly",
            "applicable":  "Companies & individuals with tax > Rs.10,000",
            "penalty":     "1% per month interest u/s 234B & 234C",
        },
    ]

    # Calculate days remaining and urgency for each deadline
    for d in deadlines:
        try:
            due = datetime.strptime(d["due_date"], "%Y-%m-%d").date()
            days_remaining = (due - today).days
            d["days_remaining"] = days_remaining
            if days_remaining < 0:
                d["status"] = "Overdue"
                d["urgency"] = "critical"
            elif days_remaining <= 7:
                d["status"] = "Due Soon"
                d["urgency"] = "urgent"
            elif days_remaining <= 30:
                d["status"] = "Upcoming"
                d["urgency"] = "warning"
            else:
                d["status"] = "On Track"
                d["urgency"] = "safe"
        except:
            d["days_remaining"] = 0
            d["status"] = "Check Date"
            d["urgency"] = "warning"

    return sorted(deadlines, key=lambda x: x["days_remaining"])


# ─── Request Models ───────────────────────────────────────────
class GSTRequest(BaseModel):
    amount:           float
    category:         str
    transaction_type: str  # "intrastate" or "interstate"
    save_to_db:       bool = False
    vendor_name:      str  = "Manual Entry"
    description:      str  = "GST Calculation"

class TaxRequest(BaseModel):
    annual_income: float
    regime:        str = "new"  # "new" or "old"


# ─── Endpoint 1: Calculate GST ────────────────────────────────
@router.post("/api/gst/calculate")
async def calculate_gst(req: GSTRequest):
    """
    Calculate GST for a transaction.
    Supports intrastate (CGST+SGST) and interstate (IGST).
    Optionally saves to Supabase transactions + gst_entries tables.
    """

    # Validate category
    if req.category not in GST_RATES:
        # Default to general goods if unknown
        req.category = "general_goods"

    rate = GST_RATES[req.category]
    gst_amount = round(req.amount * rate / 100, 2)

    if req.transaction_type == "intrastate":
        cgst = round(gst_amount / 2, 2)
        sgst = round(gst_amount / 2, 2)
        igst = 0.0
    else:
        cgst = 0.0
        sgst = 0.0
        igst = gst_amount

    final_amount = round(req.amount + gst_amount, 2)

    result = {
        "base_amount":        round(req.amount, 2),
        "gst_rate_pct":       rate,
        "gst_category":       GST_CATEGORY_LABELS.get(req.category, req.category),
        "transaction_type":   req.transaction_type,
        "cgst":               cgst,
        "sgst":               sgst,
        "igst":               igst,
        "total_gst":          gst_amount,
        "final_amount":       final_amount,
        "saved_to_db":        False,
    }

    # Optionally save to Supabase
    if req.save_to_db:
        timestamp      = datetime.now().strftime('%Y%m%d%H%M%S')
        transaction_id = f"TXN_GST_{timestamp}_001"
        today_str      = date.today().strftime('%Y-%m-%d')

        # Save transaction
        supabase.table("transactions").insert({
            "transaction_id": transaction_id,
            "date":           today_str,
            "vendor":         req.vendor_name[:100],
            "description":    req.description[:200],
            "amount":         req.amount,
            "type":           "expense",
            "category":       "GST Payment",
            "gst_amount":     gst_amount,
            "payment_method": "Bank Transfer",
            "source":         "gst_calculator"
        }).execute()

        # Save GST entry
        supabase.table("gst_entries").insert({
            "gst_record_id":  f"GST_CALC_{timestamp}_001",
            "transaction_id": transaction_id,
            "vendor":         req.vendor_name[:100],
            "gstin":          "Manual",
            "invoice_no":     f"GST-CALC-{timestamp}",
            "invoice_date":   today_str,
            "place_of_supply": "Intrastate" if req.transaction_type == "intrastate" else "Interstate",
            "taxable_amt":    req.amount,
            "cgst":           cgst,
            "sgst":           sgst,
            "igst":           igst,
            "total":          final_amount,
            "itc_claimed":    "Pending",
            "match_status":   "Pending",
            "risk_flag":      None,
            "status":         "manual_calculation"
        }).execute()

        result["saved_to_db"]    = True
        result["transaction_id"] = transaction_id
        result["note"]           = "Saved to Supabase — dashboard updated!"

    return result


# ─── Endpoint 2: Get GST Deadlines ───────────────────────────
@router.get("/api/gst/deadlines")
async def get_deadlines():
    """Get all GST compliance deadlines with urgency status"""
    deadlines = get_gst_deadlines()
    return {
        "deadlines":    deadlines,
        "total":        len(deadlines),
        "urgent_count": sum(1 for d in deadlines if d["urgency"] == "urgent"),
        "overdue_count": sum(1 for d in deadlines if d["urgency"] == "critical"),
        "as_of_date":   date.today().strftime("%Y-%m-%d")
    }


# ─── Endpoint 3: Income Tax Calculator ───────────────────────
@router.get("/api/gst/tax-slabs")
async def get_tax_slabs():
    """Get income tax slabs for FY 2025-26"""
    return {
        "new_regime": [
            {"range": "Up to Rs.4,00,000",          "rate": "0%",  "note": "Nil"},
            {"range": "Rs.4,00,001 to Rs.8,00,000", "rate": "5%",  "note": ""},
            {"range": "Rs.8,00,001 to Rs.12,00,000","rate": "10%", "note": ""},
            {"range": "Rs.12,00,001 to Rs.16,00,000","rate":"15%", "note": ""},
            {"range": "Rs.16,00,001 to Rs.20,00,000","rate":"20%", "note": ""},
            {"range": "Rs.20,00,001 to Rs.24,00,000","rate":"25%", "note": ""},
            {"range": "Above Rs.24,00,000",           "rate":"30%", "note": ""},
        ],
        "rebate_87a": "Tax rebate up to Rs.60,000 for income up to Rs.12,00,000",
        "fy":         "2025-26",
        "surcharge":  "10% for income above Rs.50L, 15% above Rs.1Cr"
    }


@router.post("/api/gst/calculate-tax")
async def calculate_income_tax(req: TaxRequest):
    """
    Calculate income tax for FY 2025-26
    Supports new tax regime
    """
    income = req.annual_income
    tax    = 0.0
    breakdown = []

    prev_limit = 0
    for limit, rate in TAX_SLABS_NEW:
        if income <= prev_limit:
            break
        taxable = min(income, limit) - prev_limit
        slab_tax = round(taxable * rate, 2)
        if rate > 0:
            breakdown.append({
                "slab":     f"Rs.{prev_limit:,.0f} to Rs.{limit:,.0f}" if limit != float('inf') else f"Above Rs.{prev_limit:,.0f}",
                "rate":     f"{int(rate*100)}%",
                "amount":   taxable,
                "tax":      slab_tax
            })
        tax += slab_tax
        prev_limit = limit

    tax = round(tax, 2)

    # Rebate u/s 87A — if income <= 12L, full tax rebate
    rebate = 0.0
    if income <= 1200000:
        rebate = min(tax, 60000)
        tax_after_rebate = max(0, tax - rebate)
    else:
        tax_after_rebate = tax

    # Health & Education Cess @ 4%
    cess = round(tax_after_rebate * 0.04, 2)
    total_tax = round(tax_after_rebate + cess, 2)

    # Effective rate
    effective_rate = round((total_tax / income * 100), 2) if income > 0 else 0

    return {
        "annual_income":    income,
        "regime":           "New Tax Regime FY 2025-26",
        "gross_tax":        tax,
        "rebate_87a":       rebate,
        "tax_after_rebate": tax_after_rebate,
        "cess_4pct":        cess,
        "total_tax":        total_tax,
        "effective_rate":   f"{effective_rate}%",
        "monthly_tds":      round(total_tax / 12, 2),
        "take_home_annual": round(income - total_tax, 2),
        "breakdown":        breakdown,
        "note": "Rebate u/s 87A: Full rebate up to Rs.60,000 for income <= Rs.12L"
    }
