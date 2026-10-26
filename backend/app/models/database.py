"""
CinePredict AI - SQLite Database & History Storage
Handles initialization of local SQLite schema, CRUD operations for prediction logs,
and saved hypothetical movie profiles.
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DB_PATH = os.path.join(BASE_DIR, "cinepredict.db")

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with dict-like row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if not already present."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Prediction History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        title TEXT NOT NULL,
        budget REAL NOT NULL,
        genres TEXT NOT NULL,
        runtime REAL NOT NULL,
        release_date TEXT NOT NULL,
        original_language TEXT NOT NULL,
        production_companies TEXT NOT NULL,
        is_franchise INTEGER NOT NULL,
        predicted_revenue REAL NOT NULL,
        lower_bound_80 REAL NOT NULL,
        upper_bound_80 REAL NOT NULL,
        estimated_net_profit REAL NOT NULL,
        estimated_roi_percent REAL NOT NULL,
        commercial_verdict TEXT NOT NULL,
        notes TEXT DEFAULT ''
    )
    """)
    
    # 2. Saved Hypothetical Comparison Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comparison_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        name TEXT NOT NULL,
        profiles_json TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def save_prediction(record: Dict[str, Any]) -> int:
    """Persists a new prediction record into SQLite."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO predictions (
        created_at, title, budget, genres, runtime, release_date,
        original_language, production_companies, is_franchise,
        predicted_revenue, lower_bound_80, upper_bound_80,
        estimated_net_profit, estimated_roi_percent, commercial_verdict, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        created_at,
        record.get("title", "Untitled Project"),
        float(record.get("budget", 0)),
        record.get("genres", "Drama"),
        float(record.get("runtime", 110)),
        record.get("release_date", "2025-07-04"),
        record.get("original_language", "en"),
        record.get("production_companies", "Independent"),
        int(record.get("is_franchise", 0)),
        float(record.get("predicted_revenue", 0)),
        float(record.get("lower_bound_80", 0)),
        float(record.get("upper_bound_80", 0)),
        float(record.get("estimated_net_profit", 0)),
        float(record.get("estimated_roi_percent", 0)),
        record.get("commercial_verdict", "Unknown"),
        record.get("notes", "")
    ))
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def list_predictions(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves paginated prediction history ordered by newest first."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM predictions ORDER BY id DESC LIMIT ? OFFSET ?
    """, (limit, offset))
    rows = cursor.fetchall()
    
    results = [dict(r) for r in rows]
    conn.close()
    return results

def delete_prediction(prediction_id: int) -> bool:
    """Deletes a prediction record by primary key."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions WHERE id = ?", (prediction_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def clear_all_predictions():
    """Clears all records from predictions table."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions")
    conn.commit()
    conn.close()
