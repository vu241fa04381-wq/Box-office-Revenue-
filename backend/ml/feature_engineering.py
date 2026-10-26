"""
CinePredict AI - Feature Engineering & Transformation Module
Extracts robust pre-release predictors and enforces strict anti-leakage guards.
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd

# Canonical genre vocabulary
CANONICAL_GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", 
    "Drama", "Family", "Fantasy", "History", "Horror", 
    "Mystery", "Romance", "Sci-Fi", "Thriller", "War"
]

MAJOR_STUDIO_KEYWORDS = [
    "warner bros", "universal pictures", "walt disney", "paramount", 
    "columbia pictures", "20th century fox", "20th century studios", 
    "marvel studios", "pixar", "sony pictures", "new line cinema"
]

LEAKAGE_COLUMNS = [
    "revenue", "profit", "profit_ratio", "roi", "vote_count", 
    "vote_average", "popularity", "revenue_tier"
]

def extract_features(df: pd.DataFrame, is_training: bool = False) -> pd.DataFrame:
    """
    Transforms raw movie metadata into an engineered feature dataframe.
    Guarantees no post-release target leakage.
    """
    df = df.copy()
    
    # 1. Parse Temporal Attributes
    release_date = pd.to_datetime(df["release_date"])
    df["release_year"] = release_date.dt.year.fillna(2020).astype(int)
    df["release_month"] = release_date.dt.month.fillna(6).astype(int)
    df["release_day_of_week"] = release_date.dt.dayofweek.fillna(4).astype(int) # Friday default
    df["release_quarter"] = release_date.dt.quarter.fillna(2).astype(int)
    
    # Seasonality indicators
    df["is_summer"] = df["release_month"].isin([5, 6, 7]).astype(int)
    df["is_holiday"] = df["release_month"].isin([11, 12]).astype(int)
    
    # 2. Budget Features
    budget = df["budget"].clip(lower=0).fillna(0)
    df["log_budget"] = np.log1p(budget)
    df["budget_raw"] = budget
    
    # 3. Runtime Features
    df["runtime"] = df["runtime"].fillna(110.0).clip(lower=45.0, upper=240.0)
    
    # 4. Studio Classification
    if "production_companies" in df.columns:
        companies = df["production_companies"].fillna("").astype(str).str.lower()
    else:
        companies = pd.Series([""] * len(df), index=df.index)
    df["is_major_studio"] = companies.apply(
        lambda s: 1 if any(kw in s for kw in MAJOR_STUDIO_KEYWORDS) else 0
    )
    
    # 5. Franchise Status
    if "is_franchise" in df.columns:
        df["is_franchise"] = df["is_franchise"].fillna(0).astype(int)
    else:
        df["is_franchise"] = 0
        
    # 6. Multi-Hot Genre Encoding
    genres_str = df["genres"].fillna("").astype(str) if "genres" in df.columns else pd.Series([""] * len(df), index=df.index)
    for g in CANONICAL_GENRES:
        # Match case-insensitively
        df[f"genre_{g.lower().replace('-', '_')}"] = genres_str.apply(
            lambda s: 1 if g.lower() in s.lower() else 0
        )
    df["genre_count"] = df[[f"genre_{g.lower().replace('-', '_')}" for g in CANONICAL_GENRES]].sum(axis=1)
    
    # 7. Language Encoding
    if "original_language" in df.columns:
        lang = df["original_language"].fillna("en").astype(str).str.lower()
    else:
        lang = pd.Series(["en"] * len(df), index=df.index)
    df["lang_en"] = (lang == "en").astype(int)
    df["lang_hi"] = (lang == "hi").astype(int)
    df["lang_ja"] = (lang == "ja").astype(int)
    df["lang_ko"] = (lang == "ko").astype(int)
    df["lang_other"] = (~lang.isin(["en", "hi", "ja", "ko"])).astype(int)
    
    # 8. Strict Anti-Leakage Guard
    if not is_training:
        for leak in LEAKAGE_COLUMNS:
            if leak in df.columns:
                df = df.drop(columns=[leak])
                
    return df

def get_feature_column_names() -> List[str]:
    """Returns the ordered list of model input feature names."""
    numeric_features = [
        "log_budget", "budget_raw", "runtime", 
        "release_year", "release_month", "release_day_of_week", "release_quarter"
    ]
    binary_features = [
        "is_summer", "is_holiday", "is_major_studio", "is_franchise", "genre_count",
        "lang_en", "lang_hi", "lang_ja", "lang_ko", "lang_other"
    ]
    genre_features = [f"genre_{g.lower().replace('-', '_')}" for g in CANONICAL_GENRES]
    return numeric_features + binary_features + genre_features
