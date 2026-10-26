"""
Tests for Data Preprocessing and Feature Engineering
"""

import pytest
import pandas as pd
import numpy as np

from ml.data_validation import validate_dataframe, clean_movie_data
from ml.feature_engineering import extract_features, get_feature_column_names, LEAKAGE_COLUMNS

def test_feature_extraction_structure():
    raw_df = pd.DataFrame([{
        "id": 1,
        "title": "Quantum Horizon",
        "budget": 75000000,
        "genres": "Action, Sci-Fi",
        "runtime": 125,
        "release_date": "2025-06-20",
        "original_language": "en",
        "production_companies": "Warner Bros.",
        "is_franchise": 1
    }])
    
    feat_df = extract_features(raw_df, is_training=False)
    
    # Check temporal features
    assert feat_df["release_year"].iloc[0] == 2025
    assert feat_df["release_month"].iloc[0] == 6
    assert feat_df["is_summer"].iloc[0] == 1
    assert feat_df["is_holiday"].iloc[0] == 0
    
    # Check studio and franchise
    assert feat_df["is_major_studio"].iloc[0] == 1
    assert feat_df["is_franchise"].iloc[0] == 1
    
    # Check genres
    assert feat_df["genre_action"].iloc[0] == 1
    assert feat_df["genre_sci_fi"].iloc[0] == 1
    assert feat_df["genre_romance"].iloc[0] == 0
    
    # Check log budget
    assert np.isclose(feat_df["log_budget"].iloc[0], np.log1p(75000000))

def test_anti_leakage_enforcement():
    raw_df = pd.DataFrame([{
        "id": 2,
        "title": "Leaked Record",
        "budget": 50000000,
        "revenue": 300000000,
        "profit": 250000000,
        "roi": 500.0,
        "vote_count": 8500,
        "popularity": 92.5,
        "genres": "Comedy",
        "runtime": 95,
        "release_date": "2024-04-12",
        "original_language": "en"
    }])
    
    feat_df = extract_features(raw_df, is_training=False)
    
    for leak in LEAKAGE_COLUMNS:
        assert leak not in feat_df.columns, f"Target leakage column {leak} was not excluded!"

def test_data_validation_and_cleaning():
    dirty_df = pd.DataFrame([
        {"id": 1, "title": "A", "budget": -5000, "revenue": 10000, "genres": "Action", "runtime": -10, "release_date": "2022-01-01", "original_language": "en"},
        {"id": 2, "title": "B", "budget": 20000, "revenue": -4000, "genres": None, "runtime": 100, "release_date": "2022-02-01", "original_language": None}
    ])
    
    cleaned = clean_movie_data(dirty_df)
    assert (cleaned["budget"] >= 0).all()
    assert (cleaned["runtime"] > 0).all()
    assert (cleaned["genres"].notna()).all()
    assert (cleaned["original_language"].notna()).all()
