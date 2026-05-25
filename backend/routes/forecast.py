from fastapi import APIRouter
from supabase import create_client
from prophet import Prophet
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@router.get("/api/forecast/revenue")
async def get_revenue_forecast():

    # Step 1 — Fetch ALL transactions in batches
    all_txns, page = [], 0
    while True:
        batch = supabase.table("transactions")\
            .select("date, amount, type")\
            .range(page * 1000, (page + 1) * 1000 - 1)\
            .execute().data
        if not batch:
            break
        all_txns.extend(batch)
        if len(batch) < 1000:
            break
        page += 1

    # Step 2 — Filter income only + aggregate by month
    income = [t for t in all_txns if t["type"] == "income"]

    df = pd.DataFrame(income)
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M").dt.to_timestamp()

    monthly = df.groupby("month")["amount"].sum().reset_index()
    monthly.columns = ["ds", "y"]
    monthly = monthly.sort_values("ds")

    # Step 3 — Train Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        interval_width=0.80
    )
    model.fit(monthly)

    # Step 4 — Forecast next 6 months
    future   = model.make_future_dataframe(periods=6, freq="ME")
    forecast = model.predict(future)

    # Step 5 — Combine historical + forecast
    result = []

    # Historical data
    for _, row in monthly.iterrows():
        result.append({
            "month":    row["ds"].strftime("%Y-%m"),
            "actual":   round(float(row["y"]), 2),
            "forecast": None,
            "upper":    None,
            "lower":    None,
            "type":     "historical"
        })

    # Forecast data (future months only)
    forecast_only = forecast[forecast["ds"] > monthly["ds"].max()]
    for _, row in forecast_only.iterrows():
        result.append({
            "month":    row["ds"].strftime("%Y-%m"),
            "actual":   None,
            "forecast": round(max(0, float(row["yhat"])), 2),
            "upper":    round(max(0, float(row["yhat_upper"])), 2),
            "lower":    round(max(0, float(row["yhat_lower"])), 2),
            "type":     "forecast"
        })

    # Step 6 — Calculate forecast summary
    last_actual   = float(monthly["y"].iloc[-1])
    next_month    = float(forecast_only["yhat"].iloc[0]) if len(forecast_only) > 0 else 0
    growth_pct    = ((next_month - last_actual) / last_actual * 100) if last_actual > 0 else 0
    total_forecast = float(forecast_only["yhat"].sum())

    return {
        "data":     result,
        "summary": {
            "last_actual_month":   monthly["ds"].max().strftime("%B %Y"),
            "last_actual_revenue": round(last_actual, 2),
            "next_month_forecast": round(next_month, 2),
            "growth_pct":          round(growth_pct, 1),
            "total_6month_forecast": round(total_forecast, 2),
            "model":               "Facebook Prophet",
            "accuracy_note":       "Based on 38 months of historical data"
        }
    }
