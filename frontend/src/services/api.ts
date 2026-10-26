import type {
  PredictionResult, MovieItem, SimilarMovieItem, DashboardKPIs,
  RevenueTier, GenrePerformance, ModelMetrics, PredictionHistoryItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health Check
  getHealth: async (): Promise<{ status: string; model_status: string }> => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Prediction
  predict: async (data: Record<string, any>): Promise<PredictionResult> => {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Multi-profile Compare
  compare: async (profiles: Record<string, any>[]): Promise<{ profiles: PredictionResult[]; comparative_summary: any }> => {
    const res = await fetch(`${API_BASE}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiles }),
    });
    return handleResponse(res);
  },

  // Movies Catalog
  getMovies: async (params: Record<string, any> = {}): Promise<{ total: number; page: number; page_size: number; total_pages: number; items: MovieItem[] }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/api/movies?${query.toString()}`);
    return handleResponse(res);
  },

  // Similar Movies Search
  getSimilarMovies: async (params: { genres: string; budget: number; runtime?: number; is_franchise?: number; top_k?: number }): Promise<{ matches: SimilarMovieItem[] }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/api/movies/similar?${query.toString()}`);
    return handleResponse(res);
  },

  // Poster Lookup
  getPoster: async (title: string): Promise<{ poster_url: string | null; has_poster: boolean }> => {
    const res = await fetch(`${API_BASE}/api/movies/poster?title=${encodeURIComponent(title)}`);
    return handleResponse(res);
  },

  // Analytics
  getKPIs: async (): Promise<DashboardKPIs> => {
    const res = await fetch(`${API_BASE}/api/analytics/kpis`);
    return handleResponse(res);
  },

  getDistribution: async (): Promise<RevenueTier[]> => {
    const res = await fetch(`${API_BASE}/api/analytics/distribution`);
    return handleResponse(res);
  },

  getBudgetVsRevenue: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/api/analytics/budget-vs-revenue`);
    return handleResponse(res);
  },

  getGenres: async (): Promise<GenrePerformance[]> => {
    const res = await fetch(`${API_BASE}/api/analytics/genres`);
    return handleResponse(res);
  },

  getTrends: async (): Promise<{ yearly_trends: any[]; monthly_seasonality: any[] }> => {
    const res = await fetch(`${API_BASE}/api/analytics/trends`);
    return handleResponse(res);
  },

  getFranchiseComparison: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/analytics/franchise`);
    return handleResponse(res);
  },

  getDecades: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/api/analytics/decades`);
    return handleResponse(res);
  },

  // Model Metrics
  getModelMetrics: async (): Promise<ModelMetrics> => {
    const res = await fetch(`${API_BASE}/api/model/metrics`);
    return handleResponse(res);
  },

  // History CRUD
  getHistory: async (): Promise<PredictionHistoryItem[]> => {
    const res = await fetch(`${API_BASE}/api/predictions?limit=100`);
    return handleResponse(res);
  },

  deleteHistoryItem: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/predictions/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  clearHistory: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/predictions`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // CSV Export URL
  getExportCsvUrl: (): string => {
    return `${API_BASE}/api/export/csv`;
  }
};
