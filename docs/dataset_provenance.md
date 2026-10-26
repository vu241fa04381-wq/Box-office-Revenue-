# Dataset Provenance, Schema, and Acquisition Guide

## 1. Overview
CinePredict AI relies on historical movie metadata and theatrical box-office figures derived from **The Movie Database (TMDb)** and open community financial records (such as the Kaggle TMDb 5000 and MovieLens/BoxOfficeMojo historical releases).

- **Source**: The Movie Database (TMDb) via public research exports.
- **Licensing**: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) / Open Database License (ODbL).
- **Domain**: Pre-release movie attributes (budget, genres, runtime, release date, spoken languages, production companies) and observed theatrical box-office revenue.

---

## 2. Dataset Schema

The canonical schema utilized across CinePredict AI's preprocessing pipeline:

| Column Name | Data Type | Description | Role in Pipeline |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Unique TMDb / CinePredict movie identifier | Identifier |
| `title` | String | Official theatrical release title | Metadata & Display |
| `budget` | Float/Int | Total production budget in USD | **Key Predictor** |
| `revenue` | Float/Int | Worldwide theatrical gross in USD | **Target Variable** ($y$) |
| `genres` | String (JSON/List) | Primary and secondary genre tags (Action, Drama, etc.) | One-Hot Feature |
| `release_date` | Date (YYYY-MM-DD) | Theatrical release date | Temporal Feature (Month, Day, Year) |
| `runtime` | Float/Int | Feature film duration in minutes | Numerical Feature |
| `original_language`| String | Primary spoken language ISO code (`en`, `fr`, etc.) | Categorical Feature |
| `production_companies` | String (JSON/List)| Producing studios / distribution entities | Categorical Feature |
| `is_franchise` | Boolean/Int | Indicates whether movie is part of a franchise/sequel | Binary Feature |
| `overview` | String | Plot synopsis | Similarity Search Feature |

---

## 3. Strict Pre-Release Anti-Leakage Separation
To preserve strict integrity for pre-release predictions:
- **Forbidden Input Features**: `revenue`, `profit`, `roi`, `vote_count` (accumulated post-release), `popularity` (post-release traffic), and any gross-derived metrics.
- Only verified pre-release metadata known prior to opening night are incorporated into the feature matrix.

---

## 4. Synthetic Development vs. Historical Evaluation Dataset
- **Synthetic Development Dataset (`data/synthetic/synthetic_movies_dev.csv`)**:
  - Provided strictly for rapid offline development, pipeline testing, and CI validation.
  - Clearly tagged with `data_source: "SYNTHETIC_DEV"` and `is_synthetic: True`.
  - **Rule**: Synthetic records are NEVER mixed with real historical evaluations or model benchmark scorecards.
- **Historical Benchmark Dataset (`data/raw/tmdb_movies_curated.csv`)**:
  - Contains verified historical movie releases with verified budgets and box-office grosses.
  - Used for training, cross-validation, and final chronological holdout evaluation.

---

## 5. Acquisition and Verification Instructions
To refresh or replace the dataset with an external bulk dump:
1. Download `tmdb_5000_movies.csv` from Kaggle or export directly via the TMDb API.
2. Place the raw file in `data/raw/tmdb_movies_curated.csv`.
3. Run the validation and preprocessing CLI:
   ```powershell
   python -m backend.ml.prepare_data --raw-path data/raw/tmdb_movies_curated.csv
   ```
4. Verify data distributions and absence of zero-variance columns:
   ```powershell
   python -m backend.ml.validate_data
   ```
