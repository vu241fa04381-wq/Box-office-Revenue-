"""
CinePredict AI - Analytics & Financial Insights Service
Aggregates historical data and ML evaluation metrics for interactive charts and dashboards.
"""

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from ml.similarity import get_movies_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
METRICS_PATH = os.path.join(BASE_DIR, "ml", "saved_models", "model_metrics.json")

def get_kpis() -> Dict[str, Any]:
    """Computes high-level financial KPIs from historical catalog."""
    df = get_movies_data()
    total_movies = len(df)
    total_box_office = float(df["revenue"].sum())
    median_budget = float(df["budget"].median())
    median_revenue = float(df["revenue"].median())
    avg_roi = float(df["actual_roi"].mean())
    profitable_count = int((df["actual_roi"] > 0).sum())
    profitable_ratio = round((profitable_count / total_movies) * 100, 1)
    
    top_movie = df.sort_values("revenue", ascending=False).iloc[0]
    
    return {
        "total_historical_movies": total_movies,
        "total_box_office_usd": total_box_office,
        "total_box_office_formatted": f"${total_box_office:,.0f}",
        "median_budget_usd": median_budget,
        "median_budget_formatted": f"${median_budget:,.0f}",
        "median_revenue_usd": median_revenue,
        "median_revenue_formatted": f"${median_revenue:,.0f}",
        "average_studio_roi_percent": round(avg_roi, 1),
        "theatrical_profitability_rate": profitable_ratio,
        "top_grossing_movie": {
            "title": str(top_movie["title"]),
            "revenue": float(top_movie["revenue"]),
            "revenue_formatted": f"${float(top_movie['revenue']):,.0f}",
            "release_year": int(top_movie["release_year"])
        }
    }

def get_revenue_distribution() -> List[Dict[str, Any]]:
    """Binned revenue distribution histogram data."""
    df = get_movies_data()
    bins = [0, 50e6, 150e6, 300e6, 600e6, 1e9, 3e9]
    labels = ["<$50M", "$50M-$150M", "$150M-$300M", "$300M-$600M", "$600M-$1B", ">$1B"]
    
    cats = pd.cut(df["revenue"], bins=bins, labels=labels, right=False)
    counts = cats.value_counts()[labels]
    
    results = []
    for label, count in counts.items():
        results.append({
            "tier": label,
            "count": int(count),
            "percentage": round(float(count / len(df) * 100), 1)
        })
    return results

def get_budget_vs_revenue() -> List[Dict[str, Any]]:
    """Scatter dataset for Budget vs Theatrical Revenue."""
    df = get_movies_data()
    results = []
    for _, row in df.iterrows():
        results.append({
            "id": int(row["id"]),
            "title": str(row["title"]),
            "budget": float(row["budget"]),
            "budget_m": round(float(row["budget"]) / 1e6, 1),
            "revenue": float(row["revenue"]),
            "revenue_m": round(float(row["revenue"]) / 1e6, 1),
            "roi_percent": round(float(row["actual_roi"]), 1),
            "is_franchise": bool(row["is_franchise"]),
            "release_year": int(row["release_year"]),
            "primary_genre": str(row["genres"]).split(",")[0].strip()
        })
    return results

def get_genre_performance() -> List[Dict[str, Any]]:
    """Computes median revenue, budget, and ROI grouped by primary genre."""
    df = get_movies_data().copy()
    df["primary_genre"] = df["genres"].apply(lambda s: str(s).split(",")[0].strip() if s else "Other")
    
    grouped = df.groupby("primary_genre").agg(
        count=("id", "count"),
        median_budget=("budget", "median"),
        median_revenue=("revenue", "median"),
        mean_revenue=("revenue", "mean"),
        median_roi=("actual_roi", "median"),
        mean_roi=("actual_roi", "mean")
    ).reset_index()
    
    # Filter genres with at least 2 entries
    grouped = grouped[grouped["count"] >= 2].sort_values("median_revenue", ascending=False)
    
    results = []
    for _, row in grouped.iterrows():
        results.append({
            "genre": str(row["primary_genre"]),
            "movie_count": int(row["count"]),
            "median_budget_m": round(float(row["median_budget"]) / 1e6, 1),
            "median_revenue_m": round(float(row["median_revenue"]) / 1e6, 1),
            "mean_revenue_m": round(float(row["mean_revenue"]) / 1e6, 1),
            "median_roi_percent": round(float(row["median_roi"]), 1)
        })
    return results

def get_release_trends() -> Dict[str, Any]:
    """Computes yearly trends and monthly seasonality."""
    df = get_movies_data().copy()
    df["month"] = df["release_date"].dt.month
    
    # Yearly trend
    yearly = df.groupby("release_year").agg(
        count=("id", "count"),
        median_revenue=("revenue", "median"),
        mean_revenue=("revenue", "mean"),
        total_revenue=("revenue", "sum")
    ).reset_index().sort_values("release_year")
    
    yearly_list = []
    for _, row in yearly.iterrows():
        yearly_list.append({
            "year": int(row["release_year"]),
            "count": int(row["count"]),
            "median_revenue_m": round(float(row["median_revenue"]) / 1e6, 1),
            "mean_revenue_m": round(float(row["mean_revenue"]) / 1e6, 1)
        })
        
    # Month seasonality
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly = df.groupby("month").agg(
        count=("id", "count"),
        median_revenue=("revenue", "median"),
        mean_revenue=("revenue", "mean")
    ).reset_index().sort_values("month")
    
    monthly_list = []
    for _, row in monthly.iterrows():
        m_idx = int(row["month"]) - 1
        monthly_list.append({
            "month": month_names[m_idx],
            "month_num": int(row["month"]),
            "count": int(row["count"]),
            "median_revenue_m": round(float(row["median_revenue"]) / 1e6, 1),
            "mean_revenue_m": round(float(row["mean_revenue"]) / 1e6, 1)
        })
        
    return {
        "yearly_trends": yearly_list,
        "monthly_seasonality": monthly_list
    }

def get_franchise_comparison() -> Dict[str, Any]:
    """Compares financial metrics for Franchise vs Standalone films."""
    df = get_movies_data().copy()
    grouped = df.groupby("is_franchise").agg(
        count=("id", "count"),
        median_budget=("budget", "median"),
        median_revenue=("revenue", "median"),
        median_roi=("actual_roi", "median"),
        mean_revenue=("revenue", "mean")
    ).to_dict("index")
    
    standalone = grouped.get(0, {})
    franchise = grouped.get(1, {})
    
    return {
        "standalone": {
            "count": int(standalone.get("count", 0)),
            "median_budget_m": round(float(standalone.get("median_budget", 0)) / 1e6, 1),
            "median_revenue_m": round(float(standalone.get("median_revenue", 0)) / 1e6, 1),
            "median_roi_percent": round(float(standalone.get("median_roi", 0)), 1)
        },
        "franchise": {
            "count": int(franchise.get("count", 0)),
            "median_budget_m": round(float(franchise.get("median_budget", 0)) / 1e6, 1),
            "median_revenue_m": round(float(franchise.get("median_revenue", 0)) / 1e6, 1),
            "median_roi_percent": round(float(franchise.get("median_roi", 0)), 1)
        }
    }

def get_decade_analysis() -> List[Dict[str, Any]]:
    """Compares box-office economics across historical decades (1980s to 2020s)."""
    df = get_movies_data().copy()
    
    def get_decade(year):
        if year < 1990: return "1980s"
        elif year < 2000: return "1990s"
        elif year < 2010: return "2000s"
        elif year < 2020: return "2010s"
        else: return "2020s"
        
    df["decade"] = df["release_year"].apply(get_decade)
    
    grouped = df.groupby("decade").agg(
        count=("id", "count"),
        median_budget=("budget", "median"),
        median_revenue=("revenue", "median"),
        median_roi=("actual_roi", "median")
    ).reset_index()
    
    decade_order = ["1980s", "1990s", "2000s", "2010s", "2020s"]
    grouped["order"] = grouped["decade"].apply(lambda d: decade_order.index(d) if d in decade_order else 99)
    grouped = grouped.sort_values("order")
    
    results = []
    for _, row in grouped.iterrows():
        results.append({
            "decade": str(row["decade"]),
            "count": int(row["count"]),
            "median_budget_m": round(float(row["median_budget"]) / 1e6, 1),
            "median_revenue_m": round(float(row["median_revenue"]) / 1e6, 1),
            "median_roi_percent": round(float(row["median_roi"]), 1)
        })
    return results

def get_model_insights() -> Dict[str, Any]:
    """Loads and formats model performance metrics, feature importances, and residual scorecard."""
    if not os.path.exists(METRICS_PATH):
        return {"status": "error", "message": "Model metrics not yet generated. Run train.py first."}
    with open(METRICS_PATH, "r") as f:
        data = json.load(f)
    return data
