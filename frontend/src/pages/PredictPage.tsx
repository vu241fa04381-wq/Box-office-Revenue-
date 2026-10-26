import React, { useState } from 'react';
import {
  Sparkles, DollarSign, Clock, Calendar, Globe, Building2,
  CheckCircle2, Compass, Sliders, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictionResult, SimilarMovieItem } from '../types';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'War'
];

const STUDIO_PRESETS = [
  'Warner Bros.', 'Universal Pictures', 'Walt Disney Pictures',
  'Paramount Pictures', 'Columbia Pictures / Sony', '20th Century Studios',
  'Marvel Studios', 'A24 / Boutique Studio', 'Independent Distribution'
];

interface PredictPageProps {
  onNavigateToHistory: () => void;
}

export const PredictPage: React.FC<PredictPageProps> = ({ onNavigateToHistory }) => {
  // Form State
  const [title, setTitle] = useState('Chronicles of the Void');
  const [budget, setBudget] = useState(85000000);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Sci-Fi']);
  const [runtime, setRuntime] = useState(124);
  const [releaseDate, setReleaseDate] = useState('2026-06-19');
  const [language, setLanguage] = useState('en');
  const [studio, setStudio] = useState('Warner Bros.');
  const [isFranchise, setIsFranchise] = useState(1);
  const [rentalRate, setRentalRate] = useState(0.50);
  const [paMultiplier, setPaMultiplier] = useState(0.65);
  const [notes] = useState('Summer tentpole blockbuster targeting worldwide release.');

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [similarMovies, setSimilarMovies] = useState<SimilarMovieItem[]>([]);
  const [, setLoadingSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter(g => g !== genre));
      }
    } else {
      if (selectedGenres.length < 4) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const payload = {
        title: title || 'Untitled Project',
        budget: Number(budget),
        genres: selectedGenres.join(', '),
        runtime: Number(runtime),
        release_date: releaseDate,
        original_language: language,
        production_companies: studio,
        is_franchise: isFranchise,
        studio_rental_rate: Number(rentalRate),
        pa_budget_multiplier: Number(paMultiplier),
        notes: notes,
        save_to_history: true
      };

      const res = await api.predict(payload);
      setResult(res);
      setSavedSuccess(true);

      // Concurrently fetch similar movies
      fetchSimilar();
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async () => {
    setLoadingSimilar(true);
    try {
      const sim = await api.getSimilarMovies({
        genres: selectedGenres.join(', '),
        budget: Number(budget),
        runtime: Number(runtime),
        is_franchise: isFranchise,
        top_k: 4
      });
      setSimilarMovies(sim.matches);
    } catch {
      // Non-critical, ignore
    } finally {
      setLoadingSimilar(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Pre-Release Box Office Prediction & Scenario Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter proposed pre-release movie metadata to generate statistical worldwide gross forecasts, empirical confidence bounds, and studio economics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <form onSubmit={handlePredict} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="movie-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Movie Title / Project Code
              </label>
              <input
                id="movie-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Inception 2, Project Nebula"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Production Budget */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="budget-slider" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Production Budget (USD)
                </label>
                <span className="text-base font-bold text-emerald-400">
                  ${budget.toLocaleString()}
                </span>
              </div>

              <input
                id="budget-slider"
                type="range"
                min="0"
                max="300000000"
                step="2500000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '$0 Micro', val: 0 },
                  { label: '$5M Indie', val: 5000000 },
                  { label: '$25M Mid', val: 25000000 },
                  { label: '$75M Wide', val: 75000000 },
                  { label: '$150M Big', val: 150000000 },
                  { label: '$250M Tentpole', val: 250000000 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBudget(preset.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${budget === preset.val
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {budget === 0 && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Zero budget specified: Modeled as micro-budget / festival release. The pipeline uses minimal baseline marketing and festival acquisition benchmarks.
                  </span>
                </div>
              )}
            </div>

            {/* Genres Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Primary Genres (Select 1 to 4)
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedGenres.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((g) => {
                  const isSelected = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Runtime & Release Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="runtime-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                    Runtime (min)
                  </label>
                  <span className="text-xs font-bold text-white">{runtime} min</span>
                </div>
                <input
                  id="runtime-input"
                  type="range"
                  min="60"
                  max="210"
                  step="5"
                  value={runtime}
                  onChange={(e) => setRuntime(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="release-date-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-purple-400" />
                  Planned Release Date
                </label>
                <input
                  id="release-date-input"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Studio Partner & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studio-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  Studio / Distribution
                </label>
                <select
                  id="studio-select"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STUDIO_PRESETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="language-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                  <Globe className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  Primary Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English (en)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="ja">Japanese (ja)</option>
                  <option value="ko">Korean (ko)</option>
                  <option value="fr">French (fr)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="other">Other Global Language</option>
                </select>
              </div>
            </div>

            {/* Franchise Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Franchise / Sequel IP</span>
                <span className="text-[11px] text-slate-400">Is this movie part of an established cinematic universe or existing IP?</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFranchise(isFranchise === 1 ? 0 : 1)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFranchise === 1 ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFranchise === 1 ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Advanced Financial Assumption Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Custom Financial Sliders' : 'Configure Custom Studio Split & P&A Multiplier'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Studio Theatrical Rental Cut:</span>
                      <span className="font-bold text-white">{(rentalRate * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="0.65"
                      step="0.05"
                      value={rentalRate}
                      onChange={(e) => setRentalRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500">Industry baseline: 50% domestic, 40-50% international.</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">P&A (Prints & Advertising) Multiplier:</span>
                      <span className="font-bold text-white">{(paMultiplier * 100).toFixed(0)}% of Budget</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.50"
                      step="0.05"
                      value={paMultiplier}
                      onChange={(e) => setPaMultiplier(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500">Industry baseline: ~65% for major studio theatrical releases.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="run-prediction-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-display font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Computing Predictive Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Theatrical Box Office Forecast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results & Financial Model (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Primary Prediction Card */}
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-950 relative overflow-hidden glow-indigo">
                <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Estimated Worldwide Theatrical Gross</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] text-indigo-300 border border-indigo-500/30">
                    USD
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-300 tracking-tight my-2">
                  {result.prediction_formatted}
                </div>

                {/* 80% Confidence Interval */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">80% Prediction Interval:</span>
                    <span className="font-bold text-white text-[11px]">
                      {result.uncertainty_range_80.lower_formatted} &mdash; {result.uncertainty_range_80.upper_formatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>95% Stat Interval:</span>
                    <span>{result.uncertainty_range_95.lower_formatted} &mdash; {result.uncertainty_range_95.upper_formatted}</span>
                  </div>
                </div>

                {/* Saved Notification */}
                {savedSuccess && (
                  <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-400">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Prediction automatically saved to SQLite history
                    </span>
                    <button
                      onClick={onNavigateToHistory}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                    >
                      View Log
                    </button>
                  </div>
                )}
              </div>

              {/* Studio Economics Breakdown Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Studio Financial Model
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${result.financial_analysis.commercial_verdict === 'Likely Profitable'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                    {result.financial_analysis.commercial_verdict}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Production Budget:</span>
                    <span className="font-semibold text-white">{result.financial_analysis.budget_formatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Estimated P&A Marketing:</span>
                    <span className="font-semibold text-white">{result.financial_analysis.estimated_pa_formatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Capital Investment:</span>
                    <span className="font-bold text-white">{result.financial_analysis.total_investment_formatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Studio Share (Rental {result.financial_analysis.studio_rental_rate_percent}):</span>
                    <span className="font-bold text-indigo-300">{result.financial_analysis.estimated_studio_gross_formatted}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-sm">
                    <span className="font-semibold text-slate-300">Net Studio Profit / Loss:</span>
                    <span className={`font-bold ${result.financial_analysis.estimated_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.financial_analysis.estimated_net_profit_formatted}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Projected Theatrical ROI:</span>
                    <span className={`font-bold ${result.financial_analysis.estimated_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.financial_analysis.estimated_roi_percent > 0 ? `+${result.financial_analysis.estimated_roi_percent}%` : `${result.financial_analysis.estimated_roi_percent}%`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Theatrical Break-Even Target:</span>
                    <span className="font-bold text-cyan-400">{result.financial_analysis.break_even_formatted}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-400">Assumption note:</span> Excludes post-theatrical ancillary revenues (home video, SVOD licensing, syndication), which typically represent an additional 30%–60% of total lifetime value.
                </div>
              </div>

              {/* Model Feature Drivers */}
              {result.feature_drivers.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Model Feature Drivers
                  </h3>
                  <div className="space-y-2">
                    {result.feature_drivers.map((drv, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${drv.effect.includes('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                          {drv.effect}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{drv.factor}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{drv.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Placeholder / Empty State */
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Simulator Standby</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Adjust the movie parameters on the left and click &ldquo;Generate Theatrical Box Office Forecast&rdquo; to execute machine learning inference.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Historical Movies Section */}
      {result && similarMovies.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white">Most Comparable Historical Releases</h2>
                <p className="text-xs text-slate-400">Real movies with similar budget scale, genre composition, and runtime</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Cosine & Jaccard Matching
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarMovies.map((movie) => (
              <div key={movie.id} className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-white text-xs line-clamp-1">{movie.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 shrink-0">
                    {movie.similarity_score}% Match
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{movie.release_year} &bull; {movie.genres}</div>
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget:</span>
                    <span className="text-slate-200">{movie.budget_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Gross:</span>
                    <span className="font-bold text-emerald-400">{movie.revenue_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Studio ROI:</span>
                    <span className={`font-semibold ${movie.actual_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      +{movie.actual_roi_percent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
