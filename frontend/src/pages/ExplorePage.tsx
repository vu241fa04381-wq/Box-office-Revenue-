import React, { useEffect, useState } from 'react';
import { 
  Search, ArrowUpDown, Film, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import type { MovieItem } from '../types';

export const ExplorePage: React.FC = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('revenue');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMovies({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        genre: genre !== 'All' ? genre : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setMovies(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load movie catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, genre, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const genresList = [
    'All', 'Action', 'Adventure', 'Animation', 'Comedy', 
    'Crime', 'Drama', 'Family', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Explore Historical Movie Catalog
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Browse verified historical releases across 5 decades with audited production budgets, worldwide grosses, and studio ROI metrics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="movie-catalog-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Genre:</span>
            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              {genresList.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="revenue">Theatrical Revenue</option>
              <option value="budget">Production Budget</option>
              <option value="actual_roi">Studio ROI</option>
              <option value="release_date">Release Date</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(1); }}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs flex items-center space-x-1"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] font-bold">{sortOrder}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Movie Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading historical releases...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Film className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No historical movies match your criteria</h3>
          <p className="text-xs text-slate-400">Try adjusting your search terms or clearing genre filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((m) => (
            <div 
              key={m.id}
              className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              {/* Card Banner / Poster Placeholder */}
              <div className="h-32 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/60 p-4 flex flex-col justify-between relative border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                    {m.release_year}
                  </span>
                  {m.is_franchise && (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Franchise
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {m.genres}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {m.overview || 'Historical theatrical release with audited financial metrics.'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Production Budget:</span>
                    <span className="font-medium text-slate-200">{m.budget_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Theatrical Gross:</span>
                    <span className="font-bold text-emerald-400">{m.revenue_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Studio ROI:</span>
                    <span className={`font-bold ${m.actual_roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.actual_roi_percent > 0 ? `+${m.actual_roi_percent}%` : `${m.actual_roi_percent}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{m.runtime} min &bull; {m.original_language.toUpperCase()}</span>
                  <span className="truncate max-w-[120px]">{m.production_companies.split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400">
            Showing Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({total} titles)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
