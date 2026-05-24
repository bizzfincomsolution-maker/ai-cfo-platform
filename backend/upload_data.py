from supabase import create_client
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Date columns for each table — will be explicitly formatted
DATE_COLUMNS = {
    "gst_entries":        ["invoice_date"],
    "gst_returns":        ["period_start", "period_end", "due_date", "filed_date"],
    "accounts_receivable":["invoice_date", "due_date"],
    "tds_records":        ["date"],
    "ai_risk_alerts":     ["detected_on"],
    "documents":          ["upload_date"],
    "transactions":       ["date"],
}

files = [
    # Already loaded — uncomment to reload if needed
    # ("transactions_initial_load.csv", "transactions"),
    # ("vendors.csv",                   "vendors"),
    # ("clients.csv",                   "clients"),
    ("gst_entries.csv",               "gst_entries"),
    ("gst_returns.csv",               "gst_returns"),
    ("ai_risk_alerts.csv",            "ai_risk_alerts"),
    ("accounts_receivable.csv",       "accounts_receivable"),
    ("tds_records.csv",               "tds_records"),
    ("financial_kpis.csv",            "financial_kpis"),
    ("documents.csv",                 "documents"),
]

data_dir = os.path.join(os.path.dirname(__file__), "data")

def clean_dataframe(df, table_name):
    # Step 1: Normalize column names to lowercase
    df.columns = df.columns.str.lower()
    
    # Step 2: Fix date columns — ensure YYYY-MM-DD string format
    date_cols = DATE_COLUMNS.get(table_name, [])
    for col in date_cols:
        if col in df.columns:
            # Parse and reformat all dates to YYYY-MM-DD string
            df[col] = pd.to_datetime(df[col], errors='coerce')
            df[col] = df[col].dt.strftime('%Y-%m-%d')
            # Replace NaT (failed parses) with None
            df[col] = df[col].where(pd.notnull(df[col]), None)
    
    # Step 3: Fix text columns with NaN
    text_cols = df.select_dtypes(include=['object']).columns
    for col in text_cols:
        df[col] = df[col].where(pd.notnull(df[col]), None)
    
    return df

def clean_record(record):
    """Convert numpy types to Python native types for JSON serialization"""
    cleaned = {}
    for key, value in record.items():
        if value is None:
            cleaned[key] = None
        elif isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
            cleaned[key] = None
        elif isinstance(value, (np.integer,)):
            cleaned[key] = int(value)
        elif isinstance(value, (np.floating,)):
            if np.isnan(value) or np.isinf(value):
                cleaned[key] = None
            else:
                cleaned[key] = float(value)
        elif hasattr(value, 'item'):
            cleaned[key] = value.item()
        else:
            cleaned[key] = value
    return cleaned

print("=" * 55)
print("  AI CFO Platform — Supabase Data Upload")
print("=" * 55)
print()

for csv_file, table in files:
    path = os.path.join(data_dir, csv_file)

    if not os.path.exists(path):
        print(f"⚠️  Skipping {csv_file} — file not found")
        continue

    print(f"📤 Loading {csv_file} → {table}...")

    df = pd.read_csv(path)
    df = clean_dataframe(df, table)
    records = df.to_dict("records")
    records = [clean_record(r) for r in records]

    batch_size = 200
    total = len(records)

    for i in range(0, total, batch_size):
        batch = records[i:i+batch_size]
        supabase.table(table).insert(batch).execute()
        print(f"   ✅ Rows {i+1}–{min(i+batch_size, total)} of {total}")

    print(f"   🎉 {table} — {total} rows loaded!\n")

print("=" * 55)
print("✅ ALL DATA LOADED INTO SUPABASE SUCCESSFULLY!")
print("=" * 55)