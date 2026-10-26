import React from 'react';
import { 
  Film, ShieldCheck, Cpu, GitBranch, 
  Layers, AlertTriangle, Compass 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Film className="w-3.5 h-3.5" />
          <span>Platform Documentation & Provenance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          CinePredict AI — Architecture & Methodology
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          An original full-stack machine learning platform engineered from the ground up to estimate worldwide theatrical box-office revenue from pre-release metadata, analyze studio financial risk, and explain model attributions.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Strict Anti-Leakage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Actual box office receipts, post-release user ratings, and vote tallies are strictly prohibited from the feature matrix. Only pre-release attributes known before premiere are used.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Chronological Holdout</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluated on real chronological out-of-sample data (releases &gt; 2017) to authentically simulate forecasting unseen future releases, avoiding time-travel bias.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Studio Economics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Distinguishes consumer ticket receipts from studio theatrical rental share (default 50%) and factors in Prints & Advertising (P&A) marketing multipliers.
          </p>
        </div>
      </div>

      {/* Full-Stack Architecture Breakdown */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Full-Stack System Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-300 block text-sm">Frontend Tech Stack</span>
            <ul className="space-y-1.5 text-slate-400">
              <li>&bull; <strong className="text-white">React 19 & TypeScript:</strong> Modern component architecture with strict type contracts.</li>
              <li>&bull; <strong className="text-white">Vite:</strong> Ultra-fast HMR and optimized asset bundling.</li>
              <li>&bull; <strong className="text-white">Tailwind CSS:</strong> Curated deep navy cinematic palette (<code className="text-indigo-400">#070b14</code>) with accessible contrast.</li>
              <li>&bull; <strong className="text-white">Recharts:</strong> Responsive, interactive distribution, seasonality, and feature importance charts.</li>
              <li>&bull; <strong className="text-white">Lucide Icons:</strong> Consistent, clean interface symbology.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block text-sm">Backend & ML Engine</span>
            <ul className="space-y-1.5 text-slate-400">
              <li>&bull; <strong className="text-white">Python 3.10 & FastAPI:</strong> Asynchronous REST routing with automatic OpenAPI docs.</li>
              <li>&bull; <strong className="text-white">Pydantic v2:</strong> Strict runtime validation for request and response payloads.</li>
              <li>&bull; <strong className="text-white">scikit-learn & pandas:</strong> Preprocessing pipelines, standard scaling, and ensemble models.</li>
              <li>&bull; <strong className="text-white">SQLite Database:</strong> Local persistence for predictions and sensitivity comparisons.</li>
              <li>&bull; <strong className="text-white">Empirical Residual Quantiles:</strong> Validated 80% and 95% uncertainty intervals.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Theatrical Economics vs Studio Profit */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 text-xs leading-relaxed">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Theatrical Box Office Economics: Gross vs. Studio Profit
        </h2>
        <p className="text-slate-400">
          In movie industry financial modeling, comparing worldwide box-office gross directly against production budget is fundamentally flawed:
        </p>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
          <div>Theatrical Gross (Ticket Sales)</div>
          <div>&nbsp;&nbsp;&minus; Theater / Exhibitor Share (~50% Domestic, ~55-60% Foreign)</div>
          <div>&nbsp;&nbsp;= <strong>Studio Theatrical Rental (~45% - 50% Worldwide Blended)</strong></div>
          <div>&nbsp;&nbsp;&minus; Production Budget</div>
          <div>&nbsp;&nbsp;&minus; Prints & Advertising (P&A Marketing, ~50% to 100% of Budget)</div>
          <div>&nbsp;&nbsp;= <strong>Studio Net Theatrical Profit / Loss</strong></div>
        </div>
        <p className="text-slate-400">
          This dynamic forms the origin of Hollywood&rsquo;s renowned <strong className="text-white">2.5x Rule</strong>: a commercial film typically needs to gross at least 2.5 times its production budget at the worldwide box office to achieve break-even before ancillary licensing (SVOD, VOD, physical media, syndication) begins generating profit.
        </p>
      </div>

      {/* Extensibility & Future Roadmap */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Compass className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">Extensibility Roadmap</h2>
        </div>
        <p className="text-xs text-slate-400">
          The CinePredict AI architecture is structured in decoupled, modular components ready for specialized sub-models:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-300">1. Opening Weekend Predictor Model</span>
            <p className="text-slate-400 text-[11px]">
              Pre-release tracking and preview screen counts can be connected into a dedicated 3-day opening weekend regression pipeline without altering the lifetime gross model.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-300">2. Regional & Indian Cinema Expansion</span>
            <p className="text-slate-400 text-[11px]">
              The language and studio categorization engine is parameterized to support distinct regional distribution structures (Bollywood, Tollywood, Kollywood) with customized distributor shares.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Academic & Professional Decision Support Disclaimer</span>
          <p className="text-amber-300/80 text-[11px] mt-0.5 leading-relaxed">
            CinePredict AI projections are statistical estimates based on historical distributions. No machine learning algorithm can guarantee commercial success, predict unpredictable social virality, critical fallout, or macro-economic events. Figures are provided for analytics and scenario simulation only.
          </p>
        </div>
      </div>
    </div>
  );
};
