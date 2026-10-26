"""
CinePredict AI - Analytics & Model Insights Router
Provides endpoints for high-level KPIs, distributions, genre economics, and model scorecards.
"""

from fastapi import APIRouter
from app.services.analytics_service import (
    get_kpis, get_revenue_distribution, get_budget_vs_revenue,
    get_genre_performance, get_release_trends, get_franchise_comparison,
    get_decade_analysis, get_model_insights
)

router = APIRouter(prefix="/api", tags=["Analytics & Model Insights"])

@router.get("/analytics/kpis")
def get_dashboard_kpis():
    """Returns high-level box office and profitability KPIs."""
    return get_kpis()

@router.get("/analytics/distribution")
def get_distribution_data():
    """Returns binned revenue distribution histogram data."""
    return get_revenue_distribution()

@router.get("/analytics/budget-vs-revenue")
def get_scatter_data():
    """Returns scatter plot data of Budget vs Theatrical Revenue."""
    return get_budget_vs_revenue()

@router.get("/analytics/genres")
def get_genres_data():
    """Returns median budget, revenue, and ROI aggregated by primary genre."""
    return get_genre_performance()

@router.get("/analytics/trends")
def get_trends_data():
    """Returns yearly financial volume and monthly calendar seasonality."""
    return get_release_trends()

@router.get("/analytics/franchise")
def get_franchise_data():
    """Returns comparative metrics between Franchise and Standalone releases."""
    return get_franchise_comparison()

@router.get("/analytics/decades")
def get_decades_data():
    """Returns historical comparisons across decades (1980s to 2020s)."""
    return get_decade_analysis()

@router.get("/model/metrics")
def get_metrics_scorecard():
    """Returns full model evaluation metrics, holdout comparison, and feature importance."""
    return get_model_insights()
