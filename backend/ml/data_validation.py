"""
CinePredict AI - Data Validation & Quality Assurance Module
Performs schema checks, missing value diagnosis, range assertions, and synthetic segregation.
"""

import os
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

REQUIRED_COLUMNS = [
    "id", "title", "budget", "revenue", "genres", 
    "release_date", "runtime", "original_language"
]

def validate_dataframe(df: pd.DataFrame, is_training: bool = True) -> Tuple[bool, Dict[str, Any]]:
    """
    Validates movie dataframe for data integrity, correct schemas, and anti-leakage rules.
    """
    issues = []
    
    # 1. Check required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        issues.append(f"Missing required columns: {missing_cols}")
        return False, {"valid": False, "issues": issues}

    # 2. Check for synthetic contamination in real evaluation
    if is_training:
        if "is_synthetic" in df.columns and (df["is_synthetic"] == 1).any():
            issues.append("CRITICAL: Synthetic records detected in training/evaluation set! Segregating...")
            df = df[df["is_synthetic"] == 0].copy()

    # 3. Numeric range assertions
    if (df["budget"] < 0).any():
        issues.append("Negative budgets found; clamping to 0.")
        df["budget"] = df["budget"].clip(lower=0)

    if (df["revenue"] < 0).any():
        issues.append("Negative revenue found; clamping to 0.")
        df["revenue"] = df["revenue"].clip(lower=0)

    if (df["runtime"] <= 0).any():
        issues.append("Non-positive runtimes found; imputing with median.")
        median_runtime = df[df["runtime"] > 0]["runtime"].median() or 110.0
        df.loc[df["runtime"] <= 0, "runtime"] = median_runtime

    # 4. Release date parsing
    try:
        df["release_date"] = pd.to_datetime(df["release_date"])
    except Exception as e:
        issues.append(f"Date parsing error: {e}")

    # Summary statistics
    stats = {
        "record_count": len(df),
        "mean_budget": float(df["budget"].mean()),
        "median_budget": float(df["budget"].median()),
        "mean_revenue": float(df["revenue"].mean()),
        "median_revenue": float(df["revenue"].median()),
        "min_release_year": int(df["release_date"].dt.year.min()) if not df.empty else None,
        "max_release_year": int(df["release_date"].dt.year.max()) if not df.empty else None,
        "valid": len(issues) == 0 or all("clamping" in i or "imputing" in i for i in issues),
        "issues": issues
    }

    return stats["valid"], stats

def clean_movie_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans raw dataframe and handles missing values according to strict rules."""
    df = df.copy()
    
    # Exclude invalid/unreleased zero-revenue entries for supervised training
    df = df[(df["budget"] > 0) & (df["revenue"] > 0)].copy()
    
    # Fill missing genres
    df["genres"] = df["genres"].fillna("Unknown")
    
    # Fill missing production companies
    if "production_companies" in df.columns:
        df["production_companies"] = df["production_companies"].fillna("Independent")
    else:
        df["production_companies"] = "Independent"
        
    # Franchise flag
    if "is_franchise" not in df.columns:
        df["is_franchise"] = 0
    df["is_franchise"] = df["is_franchise"].fillna(0).astype(int)
    
    # Fill language
    df["original_language"] = df["original_language"].fillna("en")
    
    # Runtime imputation
    median_rt = df["runtime"].median()
    df["runtime"] = df["runtime"].fillna(median_rt)
    
    return df.reset_index(drop=True)
