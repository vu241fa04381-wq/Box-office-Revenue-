import React, { useEffect, useState } from 'react';
import {
  Activity, Cpu, GitBranch,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';
import { api } from '../services/api';
import type { ModelMetrics } from '../types';

export const InsightsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getModelMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load model metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading ML evaluation scorecard & residual diagnostics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Model Metrics Scorecard Unavailable</h3>
          <p className="text-xs text-slate-400">{error || 'Metrics artifact not found.'}</p>
        </div>
      </div>
    );
  }

  const topFeatures = metrics.feature_importance.slice(0, 10).map(f => ({
    feature: f.feature.replace('genre_', '').replace('_', ' ').toUpperCase(),
    importance: Math.round(f.importance * 1000) / 10
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Evaluation & Transparency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Machine Learning Model Insights & Scorecard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Empirical holdout benchmarking, feature importance attributions, and residual uncertainty calibration.
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Algorithm Benchmark Comparison</h2>
            <p className="text-xs text-slate-400">
              Evaluated strictly on chronological out-of-sample holdout releases (premiere year &gt; {metrics.split_metadata.split_year})
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Champion: {metrics.champion_model.replace('_', ' ')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Model Architecture</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Holdout R² Score</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Holdout MAE ($ USD)</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Holdout RMSE ($ USD)</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Log-scale R²</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Log-scale MAE</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(metrics.model_comparison).map(([name, data]) => {
                const isChampion = name === metrics.champion_model;
                return (
                  <tr key={name} className={isChampion ? 'bg-indigo-950/20' : ''}>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <Cpu className={`w-3.5 h-3.5 ${isChampion ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>{name.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {data.test_holdout.r2_score.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      ${Math.round(data.test_holdout.mae_usd).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      ${Math.round(data.test_holdout.rmse_usd).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {data.test_holdout.r2_log.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {data.test_holdout.mae_log.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isChampion ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Production Model
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Benchmark Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Feature Importance Chart & Methodology Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Feature Importance (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Top Predictive Feature Importances</h2>
              <p className="text-xs text-slate-400">Relative Gini impurity reduction across ensemble regression trees</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Contribution %
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeatures} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis dataKey="feature" type="category" tick={{ fill: '#e2e8f0', fontSize: 10 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Relative Importance']}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {topFeatures.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : index === 1 ? '#6366f1' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology & Rigor Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Methodological Rigor</h2>
            <p className="text-xs text-slate-400">Engineered to eliminate lookahead bias and target leakage</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Target Leakage</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Post-release variables like actual box office, user vote counts, ratings, and runtime revenue are strictly banned from feature extraction.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <GitBranch className="w-4 h-4" />
                <span>Chronological Holdout Validation</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Unlike random k-fold splits that leak future trends into past models, the test set is partitioned strictly on future releases ({metrics.split_metadata.test_samples} movies).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                <Activity className="w-4 h-4" />
                <span>Empirical Residual Quantiles</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Uncertainty ranges reflect the real 10th and 90th percentile errors from out-of-sample holdout test predictions, rather than synthetic assumptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
