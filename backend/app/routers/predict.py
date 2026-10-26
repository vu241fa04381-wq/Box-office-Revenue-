"""
CinePredict AI - Prediction & Comparison Router
Handles real-time movie box-office predictions and multi-profile comparative sensitivity analyses.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.models.schemas import (
    MoviePredictionRequest, MoviePredictionResponse,
    MovieComparisonRequest, MovieComparisonResponse
)
from ml.inference import predict_box_office
from app.models.database import save_prediction

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict", response_model=MoviePredictionResponse)
def create_prediction(request: MoviePredictionRequest):
    """
    Predicts worldwide theatrical box-office revenue, uncertainty intervals,
    and studio economic ROI scenarios for a proposed film profile.
    """
    try:
        input_dict = request.model_dump()
        result = predict_box_office(
            movie_input=input_dict,
            studio_rental_rate=request.studio_rental_rate or 0.50,
            pa_budget_multiplier=request.pa_budget_multiplier or 0.65
        )
        
        saved_id = None
        if request.save_to_history:
            db_record = {
                "title": result["title"],
                "budget": result["financial_analysis"]["budget"],
                "genres": request.genres,
                "runtime": request.runtime,
                "release_date": request.release_date,
                "original_language": request.original_language,
                "production_companies": request.production_companies,
                "is_franchise": request.is_franchise,
                "predicted_revenue": result["predicted_revenue"],
                "lower_bound_80": result["uncertainty_range_80"]["lower_bound"],
                "upper_bound_80": result["uncertainty_range_80"]["upper_bound"],
                "estimated_net_profit": result["financial_analysis"]["estimated_net_profit"],
                "estimated_roi_percent": result["financial_analysis"]["estimated_roi_percent"],
                "commercial_verdict": result["financial_analysis"]["commercial_verdict"],
                "notes": request.notes or ""
            }
            saved_id = save_prediction(db_record)
            
        result["saved_id"] = saved_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/compare", response_model=MovieComparisonResponse)
def compare_movie_profiles(request: MovieComparisonRequest):
    """
    Compares 2 to 5 hypothetical movie scenarios side-by-side to evaluate
    budget elasticity, franchise premiums, release timing sensitivity, and ROI variance.
    """
    if len(request.profiles) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 profiles to compare.")
        
    try:
        predicted_profiles = []
        for p in request.profiles:
            input_dict = p.model_dump()
            res = predict_box_office(
                movie_input=input_dict,
                studio_rental_rate=p.studio_rental_rate or 0.50,
                pa_budget_multiplier=p.pa_budget_multiplier or 0.65
            )
            predicted_profiles.append(res)
            
        # Summary delta insights
        highest_rev = max(predicted_profiles, key=lambda x: x["predicted_revenue"])
        highest_roi = max(predicted_profiles, key=lambda x: x["financial_analysis"]["estimated_roi_percent"])
        
        summary = {
            "profile_count": len(predicted_profiles),
            "highest_grossing_profile": highest_rev["title"],
            "highest_gross_value": highest_rev["predicted_revenue"],
            "highest_roi_profile": highest_roi["title"],
            "highest_roi_percent": highest_roi["financial_analysis"]["estimated_roi_percent"]
        }
        
        return {
            "profiles": predicted_profiles,
            "comparative_summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison execution failed: {str(e)}")
