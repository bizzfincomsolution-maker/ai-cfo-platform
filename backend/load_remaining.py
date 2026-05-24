from supabase import create_client
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

print("Loading remaining 247 transactions...")

df = pd.read_csv("data/transactions_demo_upload.csv")
df.columns = df.columns.str.lower()
df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')
df = df.where(pd.notnull(df), None)

records = df.to_dict("records")

cleaned = []
for r in records:
    clean = {}
    for k, v in r.items():
        if isinstance(v, float) and np.isnan(v):
            clean[k] = None
        elif isinstance(v, (np.integer,)):
            clean[k] = int(v)
        elif isinstance(v, (np.floating,)):
            clean[k] = float(v)
        else:
            clean[k] = v
    cleaned.append(clean)

supabase.table("transactions").insert(cleaned).execute()
print(f"Done! Loaded {len(cleaned)} remaining transactions!")
print("Total transactions in Supabase: 2,647")