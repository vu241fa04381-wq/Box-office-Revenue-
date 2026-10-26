"""
Integration Tests for FastAPI Routes, SQLite History, and Similarity Search
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.models.database import clear_all_predictions

client = TestClient(app)

def setup_function():
    """Clear predictions table before each test run."""
    clear_all_predictions()

def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_status"] == "loaded"

def test_predict_endpoint_and_history_storage():
    payload = {
        "title": "Supernova Protocol",
        "budget": 85000000,
        "genres": "Action, Sci-Fi",
        "runtime": 128,
        "release_date": "2026-05-22",
        "original_language": "en",
        "production_companies": "Paramount Pictures",
        "is_franchise": 1,
        "notes": "Tentpole summer release candidate",
        "save_to_history": True
    }
    
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    
    assert data["title"] == "Supernova Protocol"
    assert data["predicted_revenue"] > 0
    assert data["saved_id"] is not None
    assert "uncertainty_range_80" in data
    assert "financial_analysis" in data
    
    # Verify presence in history endpoint
    hist_res = client.get("/api/predictions")
    assert hist_res.status_code == 200
    hist_items = hist_res.json()
    assert len(hist_items) == 1
    assert hist_items[0]["title"] == "Supernova Protocol"
    
    # Test delete from history
    pred_id = hist_items[0]["id"]
    del_res = client.delete(f"/api/predictions/{pred_id}")
    assert del_res.status_code == 200
    
    hist_after = client.get("/api/predictions").json()
    assert len(hist_after) == 0

def test_compare_endpoint():
    payload = {
        "profiles": [
            {
                "title": "Scenario A - Moderate Budget",
                "budget": 40000000,
                "genres": "Horror, Mystery",
                "runtime": 102,
                "release_date": "2026-10-15",
                "is_franchise": 0
            },
            {
                "title": "Scenario B - Franchise Sequel",
                "budget": 120000000,
                "genres": "Action, Adventure",
                "runtime": 140,
                "release_date": "2026-07-03",
                "is_franchise": 1
            }
        ]
    }
    
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["profiles"]) == 2
    assert "comparative_summary" in data

def test_movies_catalog_and_similarity():
    # 1. Catalog listing
    res = client.get("/api/movies?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) == 10
    
    # 2. Similarity search
    sim_res = client.get("/api/movies/similar?genres=Action,Adventure&budget=150000000&top_k=3")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert len(sim_data["matches"]) == 3
    assert sim_data["matches"][0]["similarity_score"] > 0

def test_analytics_endpoints():
    kpi_res = client.get("/api/analytics/kpis")
    assert kpi_res.status_code == 200
    assert kpi_res.json()["total_historical_movies"] > 0
    
    dist_res = client.get("/api/analytics/distribution")
    assert dist_res.status_code == 200
    assert len(dist_res.json()) > 0
    
    metrics_res = client.get("/api/model/metrics")
    assert metrics_res.status_code == 200
    assert "model_comparison" in metrics_res.json()
