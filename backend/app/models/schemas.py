"""
CinePredict AI - Pydantic Request & Response Data Contracts
Strict type validation and serialization schemas for FastAPI routes.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class MoviePredictionRequest(BaseModel):
    title: str = Field(default="Untitled Film Project", description="Proposed movie title")
    budget: float = Field(default=50000000.0, ge=0, description="Total production budget in USD")
    genres: str = Field(default="Action, Sci-Fi", description="Comma-separated genres")
    runtime: float = Field(default=115.0, ge=30, le=300, description="Feature runtime in minutes")
    release_date: str = Field(default="2026-07-03", description="Planned theatrical premiere date (YYYY-MM-DD)")
    original_language: str = Field(default="en", description="Primary spoken language ISO code")
    production_companies: str = Field(default="Warner Bros.", description="Studio / distribution partners")
    is_franchise: int = Field(default=0, ge=0, le=1, description="Franchise or sequel indicator (1 or 0)")
    studio_rental_rate: Optional[float] = Field(default=0.50, ge=0.2, le=0.8, description="Studio rental percentage")
    pa_budget_multiplier: Optional[float] = Field(default=0.65, ge=0.0, le=2.0, description="P&A marketing multiplier")
    notes: Optional[str] = Field(default="", description="Optional analyst notes")
    save_to_history: Optional[bool] = Field(default=True, description="Whether to store prediction in SQLite")

class UncertaintyBounds(BaseModel):
    lower_bound: float
    upper_bound: float
    lower_formatted: str
    upper_formatted: str
    confidence_level: str

class FinancialAnalysis(BaseModel):
    budget: float
    budget_formatted: str
    estimated_pa: float
    estimated_pa_formatted: str
    total_investment: float
    total_investment_formatted: str
    studio_rental_rate: float
    studio_rental_rate_percent: str
    estimated_studio_gross: float
    estimated_studio_gross_formatted: str
    estimated_net_profit: float
    estimated_net_profit_formatted: str
    estimated_roi_percent: float
    break_even_gross: float
    break_even_formatted: str
    commercial_verdict: str

class FeatureDriver(BaseModel):
    factor: str
    effect: str
    desc: str

class MoviePredictionResponse(BaseModel):
    title: str
    currency: str
    predicted_revenue: float
    prediction_formatted: str
    uncertainty_range_80: UncertaintyBounds
    uncertainty_range_95: UncertaintyBounds
    financial_analysis: FinancialAnalysis
    feature_drivers: List[FeatureDriver]
    warnings: List[str]
    model_used: str
    assumptions: List[str]
    saved_id: Optional[int] = None

class MovieComparisonRequest(BaseModel):
    profiles: List[MoviePredictionRequest] = Field(..., max_length=5, description="Up to 5 candidate movie profiles to compare")

class MovieComparisonResponse(BaseModel):
    profiles: List[MoviePredictionResponse]
    comparative_summary: Dict[str, Any]

class SimilarMovieItem(BaseModel):
    id: int
    title: str
    release_year: int
    genres: str
    budget: float
    budget_formatted: str
    revenue: float
    revenue_formatted: str
    actual_roi_percent: float
    similarity_score: float
    is_franchise: bool
    overview: str

class SimilarMoviesResponse(BaseModel):
    query_summary: Dict[str, Any]
    matches: List[SimilarMovieItem]

class HistoryItemResponse(BaseModel):
    id: int
    created_at: str
    title: str
    budget: float
    genres: str
    runtime: float
    release_date: str
    predicted_revenue: float
    lower_bound_80: float
    upper_bound_80: float
    estimated_net_profit: float
    estimated_roi_percent: float
    commercial_verdict: str
    notes: Optional[str] = ""
