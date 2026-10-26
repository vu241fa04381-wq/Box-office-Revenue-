"""
CinePredict AI - Model Training & Evaluation Engine
Performs chronological holdout evaluation comparing Baseline, Random Forest, and Gradient Boosting.
Computes empirical prediction intervals and exports serialized pipelines and metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ml.data_validation import validate_dataframe, clean_movie_data
from ml.feature_engineering import extract_features, get_feature_column_names

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_PATH = os.path.join(BASE_DIR, "..", "data", "raw", "tmdb_movies_curated.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
PIPELINE_OUT_PATH = os.path.join(MODEL_DIR, "cinepredict_pipeline.joblib")
METRICS_OUT_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

def evaluate_predictions(y_true_usd: np.ndarray, y_pred_usd: np.ndarray, y_true_log: np.ndarray, y_pred_log: np.ndarray) -> dict:
    """Computes standard financial and logarithmic regression metrics."""
    # Ensure positive USD predictions
    y_pred_usd_clean = np.maximum(0, y_pred_usd)
    
    mae_usd = float(mean_absolute_error(y_true_usd, y_pred_usd_clean))
    rmse_usd = float(np.sqrt(mean_squared_error(y_true_usd, y_pred_usd_clean)))
    r2_usd = float(r2_score(y_true_usd, y_pred_usd_clean))
    
    mae_log = float(mean_absolute_error(y_true_log, y_pred_log))
    rmse_log = float(np.sqrt(mean_squared_error(y_true_log, y_pred_log)))
    r2_log = float(r2_score(y_true_log, y_pred_log))
    
    # Mean Absolute Percentage Error (MAPE) clamped
    mape = float(np.mean(np.abs((y_true_usd - y_pred_usd_clean) / np.maximum(y_true_usd, 1e5))) * 100)
    
    return {
        "mae_usd": mae_usd,
        "rmse_usd": rmse_usd,
        "r2_score": r2_usd,
        "mae_log": mae_log,
        "rmse_log": rmse_log,
        "r2_log": r2_log,
        "mape_percent": min(mape, 500.0)
    }

def train_and_evaluate(split_year: int = 2017) -> dict:
    """
    Executes end-to-end model training, chronological evaluation, and artifact serialization.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print(f"[Training] Loading verified historical movies from: {RAW_DATA_PATH}")
    if not os.path.exists(RAW_DATA_PATH):
        raise FileNotFoundError(f"Dataset missing at {RAW_DATA_PATH}. Run dataset_builder first.")
        
    df_raw = pd.read_csv(RAW_DATA_PATH)
    
    # 1. Validation & Quality Checks
    is_valid, report = validate_dataframe(df_raw, is_training=True)
    print(f"[Training] Data validation status: {is_valid}. Record count: {report['record_count']}")
    
    # 2. Cleaning & Imputation
    df_cleaned = clean_movie_data(df_raw)
    
    # 3. Feature Engineering
    df_feat = extract_features(df_cleaned, is_training=True)
    feature_cols = get_feature_column_names()
    print(f"[Training] Extracted {len(feature_cols)} candidate features: {feature_cols[:5]}...")
    
    # 4. Chronological Holdout Split
    # Training strictly on earlier releases; evaluating on unseen future releases
    df_train = df_feat[df_feat["release_year"] <= split_year].copy()
    df_test = df_feat[df_feat["release_year"] > split_year].copy()
    
    if len(df_train) < 10 or len(df_test) < 5:
        # Fallback to random 80/20 if chronological split unbalanced
        print("[Training] Adjusting split threshold for balanced evaluation...")
        split_year = int(df_feat["release_year"].quantile(0.70))
        df_train = df_feat[df_feat["release_year"] <= split_year].copy()
        df_test = df_feat[df_feat["release_year"] > split_year].copy()
        
    print(f"[Training] Chronological Split at {split_year}: Train={len(df_train)} movies, Test={len(df_test)} movies")
    
    X_train_raw = df_train[feature_cols].values
    X_test_raw = df_test[feature_cols].values
    
    # Log1p target transformation
    y_train_usd = df_train["revenue"].values
    y_test_usd = df_test["revenue"].values
    
    y_train_log = np.log1p(y_train_usd)
    y_test_log = np.log1p(y_test_usd)
    
    # 5. Preprocessing Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_raw)
    X_test_scaled = scaler.transform(X_test_raw)
    
    # 6. Model Training & Comparison
    models = {
        "Baseline_Ridge": Ridge(alpha=10.0, random_state=42),
        "Random_Forest": RandomForestRegressor(n_estimators=120, max_depth=7, min_samples_split=3, random_state=42),
        "Gradient_Boosting": GradientBoostingRegressor(n_estimators=100, learning_rate=0.06, max_depth=3, subsample=0.85, random_state=42)
    }
    
    model_scorecard = {}
    fitted_models = {}
    
    for name, model in models.items():
        print(f"[Training] Fitting {name}...")
        model.fit(X_train_scaled, y_train_log)
        fitted_models[name] = model
        
        # In-sample predictions
        pred_train_log = model.predict(X_train_scaled)
        pred_train_usd = np.expm1(pred_train_log)
        
        # Out-of-sample holdout predictions
        pred_test_log = model.predict(X_test_scaled)
        pred_test_usd = np.expm1(pred_test_log)
        
        train_metrics = evaluate_predictions(y_train_usd, pred_train_usd, y_train_log, pred_train_log)
        test_metrics = evaluate_predictions(y_test_usd, pred_test_usd, y_test_log, pred_test_log)
        
        model_scorecard[name] = {
            "train": train_metrics,
            "test_holdout": test_metrics
        }
        print(f"  -> {name} Holdout R²={test_metrics['r2_score']:.3f}, MAE=${test_metrics['mae_usd']:,.0f}")
        
    # Select Champion Model (Gradient Boosting)
    champion_name = "Gradient_Boosting"
    champion_model = fitted_models[champion_name]
    
    # 7. Uncertainty Estimation via Holdout Residuals
    holdout_preds_log = champion_model.predict(X_test_scaled)
    residuals_log = y_test_log - holdout_preds_log
    
    residual_std_log = float(np.std(residuals_log))
    q10 = float(np.percentile(residuals_log, 10))
    q20 = float(np.percentile(residuals_log, 20))
    q80 = float(np.percentile(residuals_log, 80))
    q90 = float(np.percentile(residuals_log, 90))
    
    uncertainty_profile = {
        "residual_std_log": residual_std_log,
        "q10_error_log": q10,
        "q20_error_log": q20,
        "q80_error_log": q80,
        "q90_error_log": q90,
        "prediction_interval_80_multiplier_lower": float(np.exp(q10)),
        "prediction_interval_80_multiplier_upper": float(np.exp(q90))
    }
    
    # 8. Feature Importance
    importances = champion_model.feature_importances_
    feat_importance_list = [
        {"feature": feat, "importance": round(float(imp), 4)}
        for feat, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    ]
    
    # 9. Assemble & Save Pipeline
    pipeline_artifact = {
        "scaler": scaler,
        "champion_name": champion_name,
        "model": champion_model,
        "rf_model": fitted_models["Random_Forest"],
        "baseline_model": fitted_models["Baseline_Ridge"],
        "feature_names": feature_cols,
        "target_transform": "log1p",
        "split_year": split_year,
        "uncertainty_profile": uncertainty_profile,
        "train_size": len(df_train),
        "test_size": len(df_test)
    }
    
    joblib.dump(pipeline_artifact, PIPELINE_OUT_PATH)
    print(f"[Training] Saved full ML pipeline artifact to: {PIPELINE_OUT_PATH}")
    
    # 10. Save Detailed Metrics & Documentation Scorecard
    metrics_artifact = {
        "model_comparison": model_scorecard,
        "champion_model": champion_name,
        "feature_importance": feat_importance_list,
        "uncertainty_profile": uncertainty_profile,
        "split_metadata": {
            "split_type": "chronological_holdout",
            "split_year": split_year,
            "train_samples": len(df_train),
            "test_samples": len(df_test),
            "total_samples": len(df_feat)
        },
        "target_variable": "worldwide_theatrical_box_office_revenue_usd"
    }
    
    with open(METRICS_OUT_PATH, "w") as f:
        json.dump(metrics_artifact, f, indent=2)
    print(f"[Training] Saved model metrics scorecard to: {METRICS_OUT_PATH}")
    
    return metrics_artifact

if __name__ == "__main__":
    train_and_evaluate()
