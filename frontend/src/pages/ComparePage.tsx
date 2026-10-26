import React, { useState } from 'react';
import { Scale, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { PredictionResult } from '../types';

interface CandidateProfile {
  id: string;
  title: string;
  budget: number;
  genres: string;
  runtime: number;
  release_date: string;
  production_companies: string;
  is_franchise: number;
}

const DEFAULT_PROFILES: CandidateProfile[] = [
  {
    id: '1',
    title: 'Option A: High-Concept Mid-Budget Horror',
    budget: 20000000,
    genres: 'Horror, Mystery, Thriller',
    runtime: 98,
    release_date: '2026-10-16',
    production_companies: 'A24 / Boutique Studio',
    is_franchise: 0
  },
  {
    id: '2',
    title: 'Option B: Sci-Fi Franchise Sequel',
    budget: 140000000,
    genres: 'Action, Sci-Fi, Adventure',
    runtime: 142,
    release_date: '2026-06-12',
    production_companies: 'Warner Bros.',
    is_franchise: 1
  },
  {
    id: '3',
    title: 'Option C: Original Summer Comedy',
    budget: 45000000,
    genres: 'Comedy, Romance',
    runtime: 105,
    release_date: '2026-07-24',
    production_companies: 'Universal Pictures',
    is_franchise: 0
  }
];

export const ComparePage: React.FC = () => {
  const [profiles, setProfiles] = useState<CandidateProfile[]>(DEFAULT_PROFILES);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = (id: string, field: keyof CandidateProfile, value: any) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProfile = () => {
    if (profiles.length >= 4) return;
    const newId = String(Date.now());
    setProfiles([
      ...profiles,
      {
        id: newId,
        title: `Option ${String.fromCharCode(65 + profiles.length)}: Proposed Project`,
        budget: 60000000,
        genres: 'Drama, Thriller',
        runtime: 118,
        release_date: '2026-11-20',
        production_companies: 'Paramount Pictures',
        is_franchise: 0
      }
    ]);
  };

  const removeProfile = (id: string) => {
    if (profiles.length <= 2) return;
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = profiles.map(p => ({
        title: p.title,
        budget: Number(p.budget),
        genres: p.genres,
        runtime: Number(p.runtime),
        release_date: p.release_date,
        production_companies: p.production_companies,
        is_franchise: p.is_franchise,
        studio_rental_rate: 0.50,
        pa_budget_multiplier: 0.65
      }));

      const res = await api.compare(payload);
      setResults(res.profiles);
      setSummary(res.comparative_summary);
    } catch (err: any) {
      setError(err.message || 'Comparison execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Sensitivity Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Compare Hypothetical Movie Profiles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate 2 to 4 potential slate decisions side-by-side to assess risk, capital allocation, and box office payoff.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {profiles.length < 4 && (
            <button
              onClick={addProfile}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Candidate Profile</span>
            </button>
          )}
          <button
            id="run-compare-btn"
            onClick={runComparison}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Execute Matrix Comparison</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profiles Input Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-${profiles.length} gap-6`}>
        {profiles.map((p, idx) => (
          <div key={p.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Candidate Profile #{idx + 1}
              </span>
              {profiles.length > 2 && (
                <button
                  onClick={() => removeProfile(p.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => updateProfile(p.id, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Budget:</span>
                  <span className="font-bold text-emerald-400">${(p.budget / 1e6).toFixed(1)}M</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250000000"
                  step="5000000"
                  value={p.budget}
                  onChange={(e) => updateProfile(p.id, 'budget', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Genres</label>
                <input
                  type="text"
                  value={p.genres}
                  onChange={(e) => updateProfile(p.id, 'genres', e.target.value)}
                  placeholder="e.g. Action, Sci-Fi"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Runtime</label>
                  <input
                    type="number"
                    value={p.runtime}
                    onChange={(e) => updateProfile(p.id, 'runtime', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Release Date</label>
                  <input
                    type="date"
                    value={p.release_date}
                    onChange={(e) => updateProfile(p.id, 'release_date', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Studio</label>
                <input
                  type="text"
                  value={p.production_companies}
                  onChange={(e) => updateProfile(p.id, 'production_companies', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Franchise Sequel</span>
                <input
                  type="checkbox"
                  checked={p.is_franchise === 1}
                  onChange={(e) => updateProfile(p.id, 'is_franchise', e.target.checked ? 1 : 0)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Results Table */}
      {results && results.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Comparative Financial Scorecard</h2>
              <p className="text-xs text-slate-400">Head-to-head projection across candidate projects</p>
            </div>
            {summary && (
              <div className="text-xs px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                Top ROI: <span className="font-bold text-emerald-400">{summary.highest_roi_profile}</span> ({summary.highest_roi_percent > 0 ? `+${summary.highest_roi_percent}%` : `${summary.highest_roi_percent}%`})
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Metric</th>
                  {results.map((r, i) => (
                    <th key={i} className="py-3 px-4 font-bold text-white text-sm">
                      {r.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Production Budget</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4 font-semibold text-white">
                      {r.financial_analysis.budget_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Est. P&A Marketing</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4 text-slate-300">
                      {r.financial_analysis.estimated_pa_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Total Capital Required</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4 font-bold text-white">
                      {r.financial_analysis.total_investment_formatted}
                    </td>
                  ))}
                </tr>
                <tr className="bg-indigo-950/20">
                  <td className="py-3.5 px-4 font-bold text-indigo-300">Predicted Worldwide Gross</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3.5 px-4 font-display font-extrabold text-base text-cyan-300">
                      {r.prediction_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">80% Uncertainty Range</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4 text-[11px] text-slate-300">
                      {r.uncertainty_range_80.lower_formatted} &mdash; {r.uncertainty_range_80.upper_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Est. Net Studio Profit</td>
                  {results.map((r, i) => (
                    <td key={i} className={`py-3 px-4 font-bold text-sm ${
                      r.financial_analysis.estimated_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {r.financial_analysis.estimated_net_profit_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Theatrical Studio ROI</td>
                  {results.map((r, i) => (
                    <td key={i} className={`py-3 px-4 font-extrabold ${
                      r.financial_analysis.estimated_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {r.financial_analysis.estimated_roi_percent > 0 ? `+${r.financial_analysis.estimated_roi_percent}%` : `${r.financial_analysis.estimated_roi_percent}%`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Theatrical Break-Even</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4 font-medium text-slate-200">
                      {r.financial_analysis.break_even_formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-medium">Commercial Risk Verdict</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.financial_analysis.commercial_verdict === 'Likely Profitable'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {r.financial_analysis.commercial_verdict}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
