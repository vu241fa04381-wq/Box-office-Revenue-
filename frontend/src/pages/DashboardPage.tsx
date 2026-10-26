import React, { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingUp, Award, Film, PieChart, 
  Layers, Sparkles, RefreshCw, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Line, AreaChart, Area, CartesianGrid, Legend, Cell 
} from 'recharts';
import { api } from '../services/api';
import type { DashboardKPIs, RevenueTier, GenrePerformance } from '../types';

interface DashboardPageProps {
  onNavigateToPredict: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToPredict }) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [distribution, setDistribution] = useState<RevenueTier[]>([]);
  const [budgetVsRevenue, setBudgetVsRevenue] = useState<any[]>([]);
  const [genres, setGenres] = useState<GenrePerformance[]>([]);
  const [trends, setTrends] = useState<{ yearly_trends: any[]; monthly_seasonality: any[] }>({ yearly_trends: [], monthly_seasonality: [] });
  const [franchise, setFranchise] = useState<any>(null);
  const [decades, setDecades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        kpiData, distData, scatterData, genreData, 
        trendData, franchiseData, decadeData
      ] = await Promise.all([
        api.getKPIs(),
        api.getDistribution(),
        api.getBudgetVsRevenue(),
        api.getGenres(),
        api.getTrends(),
        api.getFranchiseComparison(),
        api.getDecades()
      ]);
      setKpis(kpiData);
      setDistribution(distData);
      setBudgetVsRevenue(scatterData);
      setGenres(genreData);
      setTrends(trendData);
      setFranchise(franchiseData);
      setDecades(decadeData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to CinePredict API. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading Box Office Intelligence & Historical Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Backend Connection Error</h3>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">{error}</p>
          <div className="pt-2">
            <button
              onClick={loadData}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-navy-900/90 to-indigo-950/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Historical Machine Learning Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Movie Box Office Intelligence Platform
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empirical analysis of theatrical box-office performance, studio rental splits, and pre-release machine learning forecasting across 5 decades of cinematic history.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="hero-launch-predictor-btn"
              onClick={onNavigateToPredict}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Movie ROI</span>
            </button>
            <button
              onClick={loadData}
              title="Refresh Analytics"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Catalog Size</span>
              <Film className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white">{kpis.total_historical_movies}</div>
            <div className="text-[11px] text-slate-400">Verified Titles</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Gross</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300">{kpis.total_box_office_formatted}</div>
            <div className="text-[11px] text-slate-400">Worldwide Theatrical</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Median Budget</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white">{kpis.median_budget_formatted}</div>
            <div className="text-[11px] text-slate-400">Production Investment</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Median Gross</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300">{kpis.median_revenue_formatted}</div>
            <div className="text-[11px] text-slate-400">Median Theatrical</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Studio ROI</span>
              <PieChart className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`text-xl font-bold ${kpis.average_studio_roi_percent >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
              {kpis.average_studio_roi_percent > 0 ? `+${kpis.average_studio_roi_percent}%` : `${kpis.average_studio_roi_percent}%`}
            </div>
            <div className="text-[11px] text-slate-400">At 50% Studio Rental</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Profitability</span>
              <Award className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">{kpis.theatrical_profitability_rate}%</div>
            <div className="text-[11px] text-slate-400">Net Profitable Share</div>
          </div>
        </div>
      )}

      {/* Row 1: Revenue Distributions & Monthly Seasonality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Box-Office Revenue Distribution</h2>
              <p className="text-xs text-slate-400">Number of historical releases in each box-office gross tier</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              USD Volume
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="tier" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} movies`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#38bdf8', '#06b6d4', '#10b981', '#f59e0b'][index % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar Seasonality Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Calendar Release Seasonality</h2>
              <p className="text-xs text-slate-400">Median and average theatrical gross by premiere month</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Millions ($M)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.monthly_seasonality} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <defs>
                  <linearGradient id="seasonalityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${val}M`, 'Median Gross']}
                />
                <Area type="monotone" dataKey="median_revenue_m" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#seasonalityGrad)" name="Median Gross ($M)" />
                <Line type="monotone" dataKey="mean_revenue_m" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Mean Gross ($M)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Genre Financial Economics & Franchise Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Genre Financial Economics (2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Genre Financial Performance</h2>
              <p className="text-xs text-slate-400">Median production budget vs median box office by primary genre</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Millions ($M)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genres} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="genre" type="category" tick={{ fill: '#e2e8f0', fontSize: 11 }} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`$${val}M`, name === 'median_revenue_m' ? 'Median Revenue' : 'Median Budget']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="median_budget_m" name="Median Budget ($M)" fill="#475569" radius={[0, 4, 4, 0]} />
                <Bar dataKey="median_revenue_m" name="Median Revenue ($M)" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Franchise vs Standalone Breakdown (1 column) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Intellectual Property</span>
            </div>
            <h2 className="text-base font-bold text-white">Franchise vs. Standalone</h2>
            <p className="text-xs text-slate-400">Economic premium associated with sequel and established IP releases</p>
          </div>

          {franchise && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>Franchise / Sequel Releases</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[10px]">
                    {franchise.franchise.count} Films
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Median Gross</span>
                    <span className="font-bold text-white text-base">${franchise.franchise.median_revenue_m}M</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Median Budget</span>
                    <span className="font-bold text-white text-base">${franchise.franchise.median_budget_m}M</span>
                  </div>
                </div>
                <div className="text-[11px] text-indigo-300/90 pt-1">
                  Median Studio ROI: <span className="font-bold text-emerald-400">+{franchise.franchise.median_roi_percent}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Standalone / Original IP</span>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px]">
                    {franchise.standalone.count} Films
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Median Gross</span>
                    <span className="font-bold text-white text-base">${franchise.standalone.median_revenue_m}M</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Median Budget</span>
                    <span className="font-bold text-white text-base">${franchise.standalone.median_budget_m}M</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Median Studio ROI: <span className="font-bold text-white">+{franchise.standalone.median_roi_percent}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Key Finding:</span> Sequels and established franchises command roughly a 2.5x to 3.0x higher theatrical gross ceiling, though production and marketing costs also scale aggressively.
          </div>
        </div>
      </div>

      {/* Row 3: Budget vs Revenue Insights */}
      {budgetVsRevenue.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Production Budget vs. Worldwide Revenue Scatter</h2>
              <p className="text-xs text-slate-400">
                Audited sample showing relationship between capital outlay and global theatrical return ({budgetVsRevenue.length} benchmark films)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Millions ($M)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {budgetVsRevenue.slice(0, 6).map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-xs line-clamp-1">{item.title}</span>
                <div className="text-[10px] text-slate-400">Budget: ${item.budget_m}M</div>
                <div className="text-[11px] font-bold text-emerald-400">Gross: ${item.revenue_m}M</div>
                <div className={`text-[10px] font-semibold ${item.roi_percent >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                  ROI: {item.roi_percent > 0 ? `+${item.roi_percent}%` : `${item.roi_percent}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Decades Historical Evolution */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Decade-by-Decade Box Office Evolution (1980s — 2020s)</h2>
            <p className="text-xs text-slate-400">Progression of median budget, worldwide revenue, and sample counts across cinematic eras</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            5 Eras Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {decades.map((d) => (
            <div key={d.decade} className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-2 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-indigo-400 text-sm">{d.decade}</span>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">{d.count} titles</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Median Gross:</span>
                  <span className="font-bold text-white">${d.median_revenue_m}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Median Budget:</span>
                  <span className="font-medium text-slate-300">${d.median_budget_m}M</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Studio ROI:</span>
                  <span className={`font-bold ${d.median_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{d.median_roi_percent}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
