"""
CinePredict AI - Metadata Similarity Search Engine
Finds the most comparable historical movies using multi-dimensional metadata distance.
"""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "tmdb_movies_curated.csv")

_MOVIES_DF = None

def get_movies_data() -> pd.DataFrame:
    """Singleton cached historical movie catalog."""
    global _MOVIES_DF
    if _MOVIES_DF is None:
        if not os.path.exists(RAW_DATA_PATH):
            raise FileNotFoundError("Historical movie database not found.")
        df = pd.read_csv(RAW_DATA_PATH)
        df["release_date"] = pd.to_datetime(df["release_date"])
        df["release_year"] = df["release_date"].dt.year
        # Compute actual ROI for historical records
        df["actual_roi"] = ((df["revenue"] * 0.50 - df["budget"]) / np.maximum(df["budget"], 1.0)) * 100.0
        _MOVIES_DF = df
    return _MOVIES_DF

def find_similar_movies(
    target_genres: str,
    target_budget: float,
    target_runtime: float = 115.0,
    is_franchise: int = 0,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Computes normalized metadata similarity between candidate movie profile and historical movies.
    Weights:
    - Genre overlap (Jaccard): 45%
    - Budget proximity (Log ratio): 35%
    - Runtime proximity: 10%
    - Franchise match: 10%
    """
    df = get_movies_data().copy()
    
    target_genre_set = set([g.strip().lower() for g in target_genres.split(",") if g.strip()])
    target_log_budget = np.log1p(max(0.0, target_budget))
    target_runtime = max(45.0, min(240.0, target_runtime))
    
    scores = []
    for _, row in df.iterrows():
        # 1. Genre Jaccard Similarity
        row_genres = set([g.strip().lower() for g in str(row["genres"]).split(",") if g.strip()])
        if target_genre_set and row_genres:
            genre_sim = len(target_genre_set.intersection(row_genres)) / len(target_genre_set.union(row_genres))
        else:
            genre_sim = 0.0
            
        # 2. Budget Proximity (exponential decay on log difference)
        row_log_budget = np.log1p(max(0.0, float(row["budget"])))
        budget_diff = abs(target_log_budget - row_log_budget)
        budget_sim = float(np.exp(-0.5 * budget_diff))
        
        # 3. Runtime Proximity (decay on minutes difference)
        runtime_diff = abs(target_runtime - float(row["runtime"]))
        runtime_sim = float(np.exp(-0.03 * runtime_diff))
        
        # 4. Franchise status match
        franchise_sim = 1.0 if int(row.get("is_franchise", 0)) == int(is_franchise) else 0.4
        
        # Combined weighted score
        composite_score = (
            0.45 * genre_sim +
            0.35 * budget_sim +
            0.10 * runtime_sim +
            0.10 * franchise_sim
        )
        scores.append(round(composite_score * 100, 1))
        
    df["similarity_score"] = scores
    top_matches = df.sort_values("similarity_score", ascending=False).head(top_k)
    
    results = []
    for _, row in top_matches.iterrows():
        results.append({
            "id": int(row["id"]),
            "title": str(row["title"]),
            "release_year": int(row["release_year"]),
            "genres": str(row["genres"]),
            "budget": float(row["budget"]),
            "budget_formatted": f"${float(row['budget']):,.0f}",
            "revenue": float(row["revenue"]),
            "revenue_formatted": f"${float(row['revenue']):,.0f}",
            "actual_roi_percent": round(float(row["actual_roi"]), 1),
            "similarity_score": float(row["similarity_score"]),
            "is_franchise": bool(row["is_franchise"]),
            "overview": str(row.get("overview", ""))
        })
        
    return results
