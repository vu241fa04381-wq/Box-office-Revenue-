"""
CinePredict AI - Prediction History & Export Router
Stores, queries, and exports stored prediction records from SQLite.
"""

import csv
import io
from fastapi import APIRouter, HTTPException, Query, Response
from typing import List, Optional

from app.models.database import (
    list_predictions, delete_prediction, clear_all_predictions, get_db_connection
)
from app.models.schemas import HistoryItemResponse

router = APIRouter(prefix="/api", tags=["History & Export"])

@router.get("/predictions", response_model=List[HistoryItemResponse])
def get_prediction_history(
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """Retrieves stored predictions from SQLite ordered newest first."""
    return list_predictions(limit=limit, offset=offset)

@router.delete("/predictions/{prediction_id}")
def remove_prediction(prediction_id: int):
    """Deletes a prediction record from SQLite by ID."""
    success = delete_prediction(prediction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return {"status": "success", "message": f"Prediction {prediction_id} deleted successfully."}

@router.delete("/predictions")
def delete_all_history():
    """Clears all stored prediction records from SQLite."""
    clear_all_predictions()
    return {"status": "success", "message": "All prediction history cleared."}

@router.get("/export/csv")
def export_predictions_csv():
    """Generates and downloads a CSV export of all prediction records."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail="No prediction records to export.")
        
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Timestamp (UTC)", "Title", "Budget (USD)", "Genres", 
        "Runtime (min)", "Release Date", "Predicted Revenue (USD)",
        "80% Lower Bound (USD)", "80% Upper Bound (USD)", 
        "Estimated Net Profit (USD)", "Estimated ROI (%)", 
        "Commercial Verdict", "Notes"
    ])
    
    # Write rows
    for r in rows:
        writer.writerow([
            r["id"], r["created_at"], r["title"], r["budget"], r["genres"],
            r["runtime"], r["release_date"], r["predicted_revenue"],
            r["lower_bound_80"], r["upper_bound_80"],
            r["estimated_net_profit"], r["estimated_roi_percent"],
            r["commercial_verdict"], r["notes"]
        ])
        
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cinepredict_predictions_export.csv"}
    )
