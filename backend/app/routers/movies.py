"""
CinePredict AI - Historical Movies & Similarity Router
Provides catalog exploration, filtering, pagination, and multi-attribute metadata similarity search.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from ml.similarity import get_movies_data, find_similar_movies
from app.services.tmdb_adapter import get_movie_poster_url
from app.models.schemas import SimilarMoviesResponse

router = APIRouter(prefix="/api/movies", tags=["Movies"])

@router.get("")
def list_movies(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    search: Optional[str] = Query(None, description="Search by movie title"),
    min_year: Optional[int] = Query(None, description="Minimum release year"),
    max_year: Optional[int] = Query(None, description="Maximum release year"),
    sort_by: Optional[str] = Query("revenue", description="Field to sort by (revenue, budget, actual_roi, release_date)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)")
):
    """
    Retrieves filtered and paginated historical movies from the verified catalog.
    """
    df = get_movies_data().copy()
    
    # 1. Search Filter
    if search:
        search_lower = search.strip().lower()
        df = df[df["title"].str.lower().str.contains(search_lower, na=False)]
        
    # 2. Genre Filter
    if genre and genre.lower() != "all":
        df = df[df["genres"].str.lower().str.contains(genre.strip().lower(), na=False)]
        
    # 3. Year Filters
    if min_year:
        df = df[df["release_year"] >= min_year]
    if max_year:
        df = df[df["release_year"] <= max_year]
        
    # 4. Sorting
    valid_sort_fields = ["revenue", "budget", "actual_roi", "release_date", "title"]
    field = sort_by if sort_by in valid_sort_fields else "revenue"
    ascending = (sort_order.lower() == "asc")
    df = df.sort_values(by=field, ascending=ascending)
    
    # 5. Pagination
    total_count = len(df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_df = df.iloc[start_idx:end_idx]
    
    items = []
    for _, row in paged_df.iterrows():
        items.append({
            "id": int(row["id"]),
            "title": str(row["title"]),
            "budget": float(row["budget"]),
            "budget_formatted": f"${float(row['budget']):,.0f}",
            "revenue": float(row["revenue"]),
            "revenue_formatted": f"${float(row['revenue']):,.0f}",
            "actual_roi_percent": round(float(row["actual_roi"]), 1),
            "genres": str(row["genres"]),
            "release_date": str(row["release_date"])[:10],
            "release_year": int(row["release_year"]),
            "runtime": float(row["runtime"]),
            "original_language": str(row["original_language"]),
            "production_companies": str(row["production_companies"]),
            "is_franchise": bool(row["is_franchise"]),
            "overview": str(row.get("overview", ""))
        })
        
    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
        "items": items
    }

@router.get("/similar", response_model=SimilarMoviesResponse)
def get_similar_movies(
    genres: str = Query("Action, Sci-Fi", description="Target comma-separated genres"),
    budget: float = Query(50000000.0, ge=0, description="Target production budget in USD"),
    runtime: float = Query(115.0, ge=30, le=300, description="Target runtime in minutes"),
    is_franchise: int = Query(0, ge=0, le=1, description="Franchise status (1 or 0)"),
    top_k: int = Query(5, ge=1, le=15, description="Number of similar matches")
):
    """
    Finds the most comparable historical movies based on multi-dimensional metadata similarity.
    """
    matches = find_similar_movies(
        target_genres=genres,
        target_budget=budget,
        target_runtime=runtime,
        is_franchise=is_franchise,
        top_k=top_k
    )
    
    return {
        "query_summary": {
            "genres": genres,
            "budget": budget,
            "runtime": runtime,
            "is_franchise": bool(is_franchise),
            "match_count": len(matches)
        },
        "matches": matches
    }

@router.get("/poster")
def get_poster(title: str = Query(..., description="Movie title")):
    """Retrieves movie poster through optional TMDb adapter."""
    return get_movie_poster_url(title)

@router.get("/{movie_id}")
def get_movie_by_id(movie_id: int):
    """Retrieves full details for a specific historical movie by ID."""
    df = get_movies_data()
    match = df[df["id"] == movie_id]
    if match.empty:
        raise HTTPException(status_code=404, detail="Movie not found.")
        
    row = match.iloc[0]
    return {
        "id": int(row["id"]),
        "title": str(row["title"]),
        "budget": float(row["budget"]),
        "budget_formatted": f"${float(row['budget']):,.0f}",
        "revenue": float(row["revenue"]),
        "revenue_formatted": f"${float(row['revenue']):,.0f}",
        "actual_roi_percent": round(float(row["actual_roi"]), 1),
        "genres": str(row["genres"]),
        "release_date": str(row["release_date"])[:10],
        "release_year": int(row["release_year"]),
        "runtime": float(row["runtime"]),
        "original_language": str(row["original_language"]),
        "production_companies": str(row["production_companies"]),
        "is_franchise": bool(row["is_franchise"]),
        "overview": str(row.get("overview", ""))
    }
