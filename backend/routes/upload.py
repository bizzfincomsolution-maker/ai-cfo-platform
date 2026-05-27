from fastapi import APIRouter, UploadFile, File, HTTPException
from supabase import create_client
from groq import Groq
import pytesseract
from pdf2image import convert_from_bytes
import pandas as pd
import json
import os
import io
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

router = APIRouter()

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase    = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

CATEGORIES = [
    "Office Supplies", "Software", "Travel", "Salaries",
    "Marketing", "Utilities", "GST Payment", "Revenue",
    "Loan Repayment", "Professional Fees", "Miscellaneous"
]

GST_RATES = {
    "Office Supplies":   18,
    "Software":          18,
    "Travel":            5,
    "Salaries":          0,
    "Marketing":         18,
    "Utilities":         18,
    "GST Payment":       0,
    "Revenue":           18,
    "Loan Repayment":    0,
    "Professional Fees": 18,
    "Miscellaneous":     18,
}

# ─── Helper: Groq AI Auto-Categorization ─────────────────────
def auto_categorize_with_groq(descriptions: list) -> list:
    """Use Groq LLaMA 3 to auto-categorize transactions"""
    prompt = f"""You are a financial transaction categorizer for an Indian SME.
Categorize each transaction description into EXACTLY one of these categories:
{', '.join(CATEGORIES)}

Transactions to categorize:
{json.dumps(descriptions, indent=2)}

Rules:
- Return ONLY a JSON array of category strings
- Array length must match input length exactly
- Use ONLY categories from the list above
- No explanations, no extra text

Example output: ["Software", "Travel", "Office Supplies"]"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.1
    )

    raw = response.choices[0].message.content.strip()

    # Clean response — remove markdown if present
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    categories = json.loads(raw.strip())

    # Validate length
    if len(categories) != len(descriptions):
        categories = ["Miscellaneous"] * len(descriptions)

    return categories


# ─── Endpoint 1: CSV Upload ───────────────────────────────────
@router.post("/api/upload/csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV bank statement.
    Expected columns: date, vendor, description, amount, type
    Groq AI auto-categorizes each transaction.
    Saves to Supabase → triggers real-time dashboard update.
    """

    # Step 1 — Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    contents = await file.read()

    # Step 2 — Read CSV
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {str(e)}")

    # Step 3 — Validate required columns
    df.columns = df.columns.str.lower().str.strip()
    required = ['date', 'vendor', 'description', 'amount', 'type']
    missing  = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns: {missing}. Required: {required}"
        )

    # Step 4 — Clean data
    df['date']   = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['type']   = df['type'].str.lower().str.strip()
    df = df.dropna(subset=['date', 'amount'])
    df = df[df['type'].isin(['income', 'expense'])]

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="No valid rows found in CSV")

    # Step 5 — Auto-categorize with Groq AI (in batches of 20)
    all_categories = []
    descriptions   = df['description'].fillna('Unknown').tolist()
    batch_size     = 20

    for i in range(0, len(descriptions), batch_size):
        batch = descriptions[i:i+batch_size]
        try:
            cats = auto_categorize_with_groq(batch)
            all_categories.extend(cats)
        except Exception:
            all_categories.extend(["Miscellaneous"] * len(batch))

    df['category'] = all_categories

    # Step 6 — Calculate GST amounts
    def calc_gst(row):
        rate = GST_RATES.get(row['category'], 18)
        if rate == 0:
            return 0
        return round(row['amount'] * rate / (100 + rate), 2)

    df['gst_amount'] = df.apply(calc_gst, axis=1)
    df['source']     = 'csv_upload'

    # Step 7 — Generate unique transaction IDs
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    df['transaction_id'] = [
        f"TXN_CSV_{timestamp}_{i:04d}" for i in range(len(df))
    ]

    # Step 8 — Save to Supabase (triggers real-time dashboard update!)
    records = []
    for _, row in df.iterrows():
        records.append({
            "transaction_id": row['transaction_id'],
            "date":           row['date'],
            "vendor":         str(row.get('vendor', 'Unknown'))[:100],
            "description":    str(row.get('description', ''))[:200],
            "amount":         float(row['amount']),
            "type":           row['type'],
            "category":       row['category'],
            "gst_amount":     float(row['gst_amount']),
            "payment_method": str(row.get('payment_method', 'Bank Transfer')),
            "source":         "csv_upload"
        })

    # Insert in batches of 100
    inserted = 0
    for i in range(0, len(records), 100):
        batch = records[i:i+100]
        supabase.table("transactions").insert(batch).execute()
        inserted += len(batch)

    # Step 9 — Return summary
    category_counts = df['category'].value_counts().to_dict()
    income_total    = float(df[df['type']=='income']['amount'].sum())
    expense_total   = float(df[df['type']=='expense']['amount'].sum())

    return {
        "success":        True,
        "message":        f"Successfully processed {inserted} transactions",
        "rows_processed": inserted,
        "income_total":   round(income_total, 2),
        "expense_total":  round(expense_total, 2),
        "categories":     category_counts,
        "ai_model":       "Groq LLaMA 3.3 70B",
        "note":           "Dashboard updated via Supabase real-time WebSocket"
    }


# ─── Endpoint 2: PDF Invoice Upload ──────────────────────────
@router.post("/api/upload/invoice")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Upload a PDF invoice.
    Tesseract OCR extracts text from PDF.
    Groq AI parses vendor, amount, GST details.
    Saves to Supabase → triggers real-time dashboard update.
    """

    # Step 1 — Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()

    # Step 2 — Convert PDF to images using pdf2image
    try:
        images = convert_from_bytes(contents, dpi=200)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read PDF: {str(e)}"
        )

    # Step 3 — OCR each page with Tesseract
    extracted_text = ""
    for i, image in enumerate(images):
        text = pytesseract.image_to_string(image, lang='eng')
        extracted_text += f"\n--- Page {i+1} ---\n{text}"

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. Try a clearer scan."
        )

    # Step 4 — Parse invoice with Groq AI
    parse_prompt = f"""You are an expert Indian invoice parser.
Extract details from this invoice text and return ONLY valid JSON.

Invoice Text:
{extracted_text[:3000]}

Return this exact JSON structure:
{{
    "vendor_name": "company name or Unknown",
    "invoice_no": "invoice number or AUTO",
    "invoice_date": "YYYY-MM-DD format",
    "description": "brief description of goods/services",
    "subtotal": 0.0,
    "cgst": 0.0,
    "sgst": 0.0,
    "igst": 0.0,
    "total_amount": 0.0,
    "gstin": "vendor GSTIN or Unknown",
    "transaction_type": "expense"
}}

Rules:
- Return ONLY the JSON object, no other text
- All amounts must be numbers not strings
- Date must be YYYY-MM-DD format
- If any field is unclear use sensible defaults"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": parse_prompt}],
            max_tokens=500,
            temperature=0.1
        )

        raw = response.choices[0].message.content.strip()

        # Clean markdown if present
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        parsed = json.loads(raw.strip())

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI parsing failed: {str(e)}"
        )

    # Step 5 — Calculate GST totals
    total_gst    = parsed.get("cgst", 0) + parsed.get("sgst", 0) + parsed.get("igst", 0)
    total_amount = parsed.get("total_amount", 0)

    # Step 6 — Generate IDs
    timestamp      = datetime.now().strftime('%Y%m%d%H%M%S')
    transaction_id = f"TXN_PDF_{timestamp}_001"

    # Validate date format
    invoice_date = parsed.get("invoice_date", datetime.now().strftime('%Y-%m-%d'))
    try:
        datetime.strptime(invoice_date, '%Y-%m-%d')
    except:
        invoice_date = datetime.now().strftime('%Y-%m-%d')

    # Step 7 — Save transaction to Supabase
    transaction = {
        "transaction_id": transaction_id,
        "date":           invoice_date,
        "vendor":         str(parsed.get("vendor_name", "Unknown"))[:100],
        "description":    str(parsed.get("description", "Invoice payment"))[:200],
        "amount":         float(total_amount),
        "type":           "expense",
        "category":       "Professional Fees",
        "gst_amount":     float(total_gst),
        "payment_method": "Bank Transfer",
        "source":         "invoice_upload"
    }

    supabase.table("transactions").insert(transaction).execute()

    # Step 8 — Save GST entry
    gst_entry = {
        "gst_record_id":  f"GST_PDF_{timestamp}_001",
        "transaction_id": transaction_id,
        "vendor":         str(parsed.get("vendor_name", "Unknown"))[:100],
        "gstin":          str(parsed.get("gstin", "Unknown"))[:20],
        "invoice_no":     str(parsed.get("invoice_no", "AUTO"))[:50],
        "invoice_date":   invoice_date,
        "place_of_supply": "Intrastate" if parsed.get("cgst", 0) > 0 else "Interstate",
        "taxable_amt":    float(parsed.get("subtotal", total_amount)),
        "cgst":           float(parsed.get("cgst", 0)),
        "sgst":           float(parsed.get("sgst", 0)),
        "igst":           float(parsed.get("igst", 0)),
        "total":          float(total_amount),
        "itc_claimed":    "Pending",
        "match_status":   "Pending",
        "risk_flag":      None,
        "status":         "auto_captured"
    }

    supabase.table("gst_entries").insert(gst_entry).execute()

    # Step 9 — Return parsed results
    return {
        "success":      True,
        "message":      "Invoice parsed and saved successfully",
        "vendor_name":  parsed.get("vendor_name"),
        "invoice_no":   parsed.get("invoice_no"),
        "invoice_date": invoice_date,
        "total_amount": total_amount,
        "gst_breakdown": {
            "subtotal":  parsed.get("subtotal", 0),
            "cgst":      parsed.get("cgst", 0),
            "sgst":      parsed.get("sgst", 0),
            "igst":      parsed.get("igst", 0),
            "total_gst": total_gst
        },
        "gstin":           parsed.get("gstin"),
        "ocr_text_length": len(extracted_text),
        "ai_model":        "Groq LLaMA 3.3 70B",
        "note":            "Dashboard updated via Supabase real-time WebSocket"
    }
