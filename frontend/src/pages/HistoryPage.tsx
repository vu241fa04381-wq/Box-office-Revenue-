import React, { useEffect, useState } from 'react';
import { 
  History, Download, Printer, Trash2, 
  AlertCircle, RefreshCw, FileText 
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictionHistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter(h => h.id !== id));
    } catch (err: any) {
      alert(`Could not delete record: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all prediction history?')) return;
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (err: any) {
      alert(`Could not clear history: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <History className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">SQLite Persistence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Prediction History & Exports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit past model inferences, review financial estimates, and export logs to CSV and printable PDF reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {history.length > 0 && (
            <>
              <a
                href={api.getExportCsvUrl()}
                download
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF Report</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center space-x-1 transition-colors"
                title="Clear all logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </>
          )}

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading stored prediction logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No saved predictions yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you run new predictions on the Predict page, your results and financial models will be logged here in SQLite.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date / ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Project Title</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Budget</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Predicted Gross</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">80% Interval</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Net Profit</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">ROI %</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Verdict</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <div className="font-medium text-slate-300">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500">#{item.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.genres}</div>
                      {item.notes && (
                        <div className="text-[10px] text-indigo-400 italic line-clamp-1 mt-0.5">
                          &ldquo;{item.notes}&rdquo;
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      ${Math.round(item.budget).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-bold text-cyan-300">
                      ${Math.round(item.predicted_revenue).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                      ${Math.round(item.lower_bound_80).toLocaleString()} &mdash; ${Math.round(item.upper_bound_80).toLocaleString()}
                    </td>

                    <td className={`py-3 px-4 font-semibold ${
                      item.estimated_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      ${Math.round(item.estimated_net_profit).toLocaleString()}
                    </td>

                    <td className={`py-3 px-4 font-bold ${
                      item.estimated_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.estimated_roi_percent > 0 ? `+${item.estimated_roi_percent}%` : `${item.estimated_roi_percent}%`}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.commercial_verdict === 'Likely Profitable'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.commercial_verdict}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
