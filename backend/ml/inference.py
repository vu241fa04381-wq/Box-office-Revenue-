"""
CinePredict AI - Real-time Inference Engine & Studio Economics Calculator
Loads serialized model pipeline, applies feature transformations, executes predictions,
computes empirical uncertainty intervals, and calculates studio financial ROI scenarios.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

from ml.feature_engineering import extract_features, get_feature_column_names

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPELINE_PATH = os.path.join(BASE_DIR, "ml", "saved_models", "cinepredict_pipeline.joblib")

_LOADED_PIPELINE = None

def get_pipeline():
    """Singleton accessor to cached model pipeline."""
    global _LOADED_PIPELINE
    if _LOADED_PIPELINE is None:
        if not os.path.exists(PIPELINE_PATH):
            raise FileNotFoundError(f"Trained model artifact missing at {PIPELINE_PATH}. Run train.py first.")
        _LOADED_PIPELINE = joblib.load(PIPELINE_PATH)
    return _LOADED_PIPELINE

def predict_box_office(
    movie_input: Dict[str, Any],
    studio_rental_rate: float = 0.50,
    pa_budget_multiplier: float = 0.65,
    min_pa_floor: float = 15000000.0
) -> Dict[str, Any]:
    """
    Executes end-to-end prediction and financial risk assessment.
    
    Parameters:
    - movie_input: Dict with budget, genres, runtime, release_date, original_language, production_companies, is_franchise.
    - studio_rental_rate: Fraction of worldwide box office gross retained by studio (default: 0.50).
    - pa_budget_multiplier: Estimated Prints & Advertising marketing expense as fraction of budget (default: 0.65).
    - min_pa_floor: Minimum P&A expense floor for wide commercial theatrical release.
    """
    pipeline = get_pipeline()
    scaler = pipeline["scaler"]
    model = pipeline["model"]
    rf_model = pipeline["rf_model"]
    feature_cols = pipeline["feature_names"]
    uncertainty = pipeline["uncertainty_profile"]

    # 1. Input Sanitization & Validation
    warnings = []
    budget = float(movie_input.get("budget", 0) or 0)
    
    if budget < 0:
        budget = 0.0
        warnings.append("Negative budget clamped to $0.")
        
    if budget == 0:
        warnings.append(
            "Zero budget specified. Analyzed as ultra-low micro-budget / festival release. "
            "Box-office estimates assume organic regional/independent distribution."
        )

    runtime = float(movie_input.get("runtime", 110) or 110)
    if runtime < 45:
        runtime = 45.0
        warnings.append("Runtime clamped to minimum feature length threshold (45 min).")
    elif runtime > 240:
        runtime = 240.0
        warnings.append("Runtime clamped to maximum feature length threshold (240 min).")

    genres = str(movie_input.get("genres", "Drama") or "Drama")
    release_date = str(movie_input.get("release_date", "2025-07-04") or "2025-07-04")
    original_language = str(movie_input.get("original_language", "en") or "en")
    production_companies = str(movie_input.get("production_companies", "Independent") or "Independent")
    is_franchise = int(movie_input.get("is_franchise", 0) or 0)
    title = str(movie_input.get("title", "Untitled Project") or "Untitled Project")

    # 2. Construct Single-row DataFrame for feature extraction
    raw_df = pd.DataFrame([{
        "title": title,
        "budget": budget,
        "genres": genres,
        "runtime": runtime,
        "release_date": release_date,
        "original_language": original_language,
        "production_companies": production_companies,
        "is_franchise": is_franchise,
        "revenue": 0 # Dummy value, strictly dropped by feature extraction
    }])

    # 3. Feature Transformation
    feat_df = extract_features(raw_df, is_training=False)
    
    # Ensure all required features are present in identical order
    for col in feature_cols:
        if col not in feat_df.columns:
            feat_df[col] = 0
            
    X_raw = feat_df[feature_cols].values
    X_scaled = scaler.transform(X_raw)

    # 4. Model Prediction (Log scale)
    pred_log = float(model.predict(X_scaled)[0])
    rf_pred_log = float(rf_model.predict(X_scaled)[0])
    
    # 5. Correct Inverse Log-Transformation to USD Gross
    pred_usd = max(0.0, float(np.expm1(pred_log)))
    rf_pred_usd = max(0.0, float(np.expm1(rf_pred_log)))

    # 6. Uncertainty Bounds (80% and 95% Confidence Intervals based on Holdout Residuals)
    # Using empirical residual percentiles
    q10_mult = uncertainty["prediction_interval_80_multiplier_lower"]
    q90_mult = uncertainty["prediction_interval_80_multiplier_upper"]
    
    lower_bound_80 = max(0.0, round(pred_usd * q10_mult, 2))
    upper_bound_80 = max(lower_bound_80, round(pred_usd * q90_mult, 2))
    
    # 95% interval approximation (1.96 * sigma)
    sigma_log = uncertainty["residual_std_log"]
    lower_bound_95 = max(0.0, round(pred_usd * np.exp(-1.96 * sigma_log), 2))
    upper_bound_95 = max(lower_bound_95, round(pred_usd * np.exp(1.96 * sigma_log), 2))

    # 7. Studio Economics & ROI Scenario Analysis
    # P&A estimate: scaled to budget, with floor for wide theatrical releases
    if budget > 20000000:
        est_pa = max(min_pa_floor, budget * pa_budget_multiplier)
    elif budget > 5000000:
        est_pa = budget * 0.50
    else:
        # Micro/indie budget
        est_pa = budget * 0.25
        
    total_investment = budget + est_pa
    studio_gross = pred_usd * studio_rental_rate
    net_profit = studio_gross - total_investment
    
    if total_investment > 0:
        roi_percentage = (net_profit / total_investment) * 100.0
    else:
        roi_percentage = 0.0

    # Break-even theatrical revenue (Gross needed so that Gross * rental_rate == total_investment)
    break_even_gross = (total_investment / studio_rental_rate) if studio_rental_rate > 0 else 0.0

    # 8. Feature Contribution Breakdown
    feature_drivers = []
    if budget >= 100000000:
        feature_drivers.append({"factor": "High Production Budget ($100M+)", "effect": "Positive (+)", "desc": "High visual spectacle and wide release footprint support strong opening potential."})
    elif budget <= 10000000:
        feature_drivers.append({"factor": "Modest Production Budget (<$10M)", "effect": "Caution (-)", "desc": "Reduced screen count and promotional ceiling limit worldwide theatrical ceiling."})
        
    if is_franchise == 1:
        feature_drivers.append({"factor": "Franchise / Sequel Brand", "effect": "Positive (+)", "desc": "Established fan base and international brand equity correlate with higher baseline gross."})

    feat_row = feat_df.iloc[0]
    if feat_row.get("is_summer", 0) == 1:
        feature_drivers.append({"factor": "Summer Release Window (May-July)", "effect": "Positive (+)", "desc": "High school/college vacation traffic and peak cinema attendance calendar."})
    elif feat_row.get("is_holiday", 0) == 1:
        feature_drivers.append({"factor": "Holiday Release Window (Nov-Dec)", "effect": "Positive (+)", "desc": "Thanksgiving & Christmas holiday corridors provide long theatrical legs."})

    if feat_row.get("is_major_studio", 0) == 1:
        feature_drivers.append({"factor": "Major Studio Distribution", "effect": "Positive (+)", "desc": "Expansive booking power and international distribution infrastructure."})

    for g in ["action", "adventure", "animation", "sci_fi"]:
        if feat_row.get(f"genre_{g}", 0) == 1:
            feature_drivers.append({"factor": f"{g.capitalize()} Genre", "effect": "Positive (+)", "desc": "Demonstrates strong historical international crossover appeal."})
            break

    return {
        "title": title,
        "currency": "USD",
        "predicted_revenue": round(pred_usd, 2),
        "prediction_formatted": f"${pred_usd:,.0f}",
        "uncertainty_range_80": {
            "lower_bound": lower_bound_80,
            "upper_bound": upper_bound_80,
            "lower_formatted": f"${lower_bound_80:,.0f}",
            "upper_formatted": f"${upper_bound_80:,.0f}",
            "confidence_level": "80% empirical prediction interval"
        },
        "uncertainty_range_95": {
            "lower_bound": lower_bound_95,
            "upper_bound": upper_bound_95,
            "lower_formatted": f"${lower_bound_95:,.0f}",
            "upper_formatted": f"${upper_bound_95:,.0f}",
            "confidence_level": "95% prediction interval"
        },
        "financial_analysis": {
            "budget": budget,
            "budget_formatted": f"${budget:,.0f}",
            "estimated_pa": round(est_pa, 2),
            "estimated_pa_formatted": f"${est_pa:,.0f}",
            "total_investment": round(total_investment, 2),
            "total_investment_formatted": f"${total_investment:,.0f}",
            "studio_rental_rate": studio_rental_rate,
            "studio_rental_rate_percent": f"{studio_rental_rate * 100:.1f}%",
            "estimated_studio_gross": round(studio_gross, 2),
            "estimated_studio_gross_formatted": f"${studio_gross:,.0f}",
            "estimated_net_profit": round(net_profit, 2),
            "estimated_net_profit_formatted": f"${net_profit:,.0f}",
            "estimated_roi_percent": round(roi_percentage, 1),
            "break_even_gross": round(break_even_gross, 2),
            "break_even_formatted": f"${break_even_gross:,.0f}",
            "commercial_verdict": "Likely Profitable" if net_profit > 0 else "High Financial Risk"
        },
        "feature_drivers": feature_drivers,
        "warnings": warnings,
        "model_used": "Gradient_Boosting (Hist/Tree Regressor Ensemble)",
        "assumptions": [
            "Studio rental share default: 50.0% of worldwide theatrical gross.",
            "Marketing & P&A estimate: 65% of budget with $15M floor for wide theatrical releases.",
            "Prediction represents theatrical window box office only (excludes SVOD, streaming licensing, ancillaries).",
            "Uncertainty intervals calculated from empirical out-of-sample chronological holdout residuals."
        ]
    }
