"""
Tests for ML Pipeline, Inference, Inverse Transforms, and Uncertainty Bounds
"""

import pytest
import numpy as np

from ml.inference import get_pipeline, predict_box_office

def test_pipeline_loading():
    pipeline = get_pipeline()
    assert "model" in pipeline
    assert "scaler" in pipeline
    assert "feature_names" in pipeline
    assert len(pipeline["feature_names"]) > 10
    assert pipeline["target_transform"] == "log1p"

def test_inference_output_and_inversion():
    movie = {
        "title": "Cosmic Voyage",
        "budget": 120000000,
        "genres": "Adventure, Sci-Fi",
        "runtime": 135,
        "release_date": "2026-06-15",
        "original_language": "en",
        "production_companies": "Universal Pictures",
        "is_franchise": 1
    }
    
    res = predict_box_office(movie)
    
    assert res["predicted_revenue"] > 0
    assert res["currency"] == "USD"
    assert "uncertainty_range_80" in res
    
    # Assert lower bound < prediction < upper bound
    low_80 = res["uncertainty_range_80"]["lower_bound"]
    high_80 = res["uncertainty_range_80"]["upper_bound"]
    assert low_80 <= res["predicted_revenue"] <= high_80
    
    # Financial metrics assertions
    fin = res["financial_analysis"]
    assert fin["budget"] == 120000000
    assert fin["total_investment"] > fin["budget"]
    assert fin["studio_rental_rate"] == 0.50
    assert fin["break_even_gross"] > 0

def test_zero_budget_handling():
    zero_movie = {
        "title": "Student Micro Short",
        "budget": 0,
        "genres": "Drama",
        "runtime": 80,
        "release_date": "2025-09-01",
        "original_language": "en",
        "production_companies": "Independent",
        "is_franchise": 0
    }
    
    res = predict_box_office(zero_movie)
    assert res["predicted_revenue"] >= 0
    assert any("zero budget" in w.lower() for w in res["warnings"])
    assert res["financial_analysis"]["budget"] == 0.0

def test_extreme_runtime_clamping():
    short_movie = {
        "title": "Ultra Short",
        "budget": 1000000,
        "genres": "Comedy",
        "runtime": 15, # Below 45 min threshold
        "release_date": "2025-01-01"
    }
    
    res = predict_box_office(short_movie)
    assert res["predicted_revenue"] > 0
    assert any("clamped" in w.lower() for w in res["warnings"])
