export interface UncertaintyBounds {
  lower_bound: number;
  upper_bound: number;
  lower_formatted: string;
  upper_formatted: string;
  confidence_level: string;
}

export interface FinancialAnalysis {
  budget: number;
  budget_formatted: string;
  estimated_pa: number;
  estimated_pa_formatted: string;
  total_investment: number;
  total_investment_formatted: string;
  studio_rental_rate: number;
  studio_rental_rate_percent: string;
  estimated_studio_gross: number;
  estimated_studio_gross_formatted: string;
  estimated_net_profit: number;
  estimated_net_profit_formatted: string;
  estimated_roi_percent: number;
  break_even_gross: number;
  break_even_formatted: string;
  commercial_verdict: string;
}

export interface FeatureDriver {
  factor: string;
  effect: string;
  desc: string;
}

export interface PredictionResult {
  title: string;
  currency: string;
  predicted_revenue: number;
  prediction_formatted: string;
  uncertainty_range_80: UncertaintyBounds;
  uncertainty_range_95: UncertaintyBounds;
  financial_analysis: FinancialAnalysis;
  feature_drivers: FeatureDriver[];
  warnings: string[];
  model_used: string;
  assumptions: string[];
  saved_id?: number;
}

export interface MovieItem {
  id: number;
  title: string;
  budget: number;
  budget_formatted: string;
  revenue: number;
  revenue_formatted: string;
  actual_roi_percent: number;
  genres: string;
  release_date: string;
  release_year: number;
  runtime: number;
  original_language: string;
  production_companies: string;
  is_franchise: boolean;
  overview: string;
}

export interface SimilarMovieItem extends MovieItem {
  similarity_score: number;
}

export interface DashboardKPIs {
  total_historical_movies: number;
  total_box_office_usd: number;
  total_box_office_formatted: string;
  median_budget_usd: number;
  median_budget_formatted: string;
  median_revenue_usd: number;
  median_revenue_formatted: string;
  average_studio_roi_percent: number;
  theatrical_profitability_rate: number;
  top_grossing_movie: {
    title: string;
    revenue: number;
    revenue_formatted: string;
    release_year: number;
  };
}

export interface RevenueTier {
  tier: string;
  count: number;
  percentage: number;
}

export interface GenrePerformance {
  genre: string;
  movie_count: number;
  median_budget_m: number;
  median_revenue_m: number;
  mean_revenue_m: number;
  median_roi_percent: number;
}

export interface TrendItem {
  year?: number;
  month?: string;
  month_num?: number;
  count: number;
  median_revenue_m: number;
  mean_revenue_m: number;
}

export interface ModelMetrics {
  model_comparison: Record<string, {
    train: Record<string, number>;
    test_holdout: Record<string, number>;
  }>;
  champion_model: string;
  feature_importance: Array<{
    feature: string;
    importance: number;
  }>;
  uncertainty_profile: {
    residual_std_log: number;
    prediction_interval_80_multiplier_lower: number;
    prediction_interval_80_multiplier_upper: number;
  };
  split_metadata: {
    split_type: string;
    split_year: number;
    train_samples: number;
    test_samples: number;
    total_samples: number;
  };
  target_variable: string;
}

export interface PredictionHistoryItem {
  id: number;
  created_at: string;
  title: string;
  budget: number;
  genres: string;
  runtime: number;
  release_date: string;
  predicted_revenue: number;
  lower_bound_80: number;
  upper_bound_80: number;
  estimated_net_profit: number;
  estimated_roi_percent: number;
  commercial_verdict: string;
  notes: string;
}
