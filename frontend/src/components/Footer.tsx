import React from 'react';
import { Film, ShieldCheck, Database, GitBranch } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060a12] text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-base">
                CinePredict AI
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              A full-stack machine learning platform engineered from scratch for pre-release theatrical box office forecasting, studio financial sensitivity analysis, and multi-profile comparative intelligence.
            </p>
            <div className="flex items-center space-x-4 text-xs pt-1">
              <span className="flex items-center text-slate-500">
                <Database className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                TMDb Verified Data
              </span>
              <span className="flex items-center text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Zero Target Leakage
              </span>
              <span className="flex items-center text-slate-500">
                <GitBranch className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Chronological Evaluation
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-400 transition-colors">
                  Executive Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('predict')} className="hover:text-indigo-400 transition-colors">
                  Predict & Scenario Simulator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('compare')} className="hover:text-indigo-400 transition-colors">
                  Multi-Movie Matrix
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('explore')} className="hover:text-indigo-400 transition-colors">
                  Historical Film Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('insights')} className="hover:text-indigo-400 transition-colors">
                  Model Insights & Metrics
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Financial Assumptions
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500 mb-3">
              Box office predictions reflect theatrical gross. Studio net estimates apply a baseline 50% theatrical rental split and variable P&A marketing allowances.
            </p>
            <button 
              onClick={() => setActiveTab('about')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center"
            >
              Read full methodology &rarr;
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} CinePredict AI. Original Machine Learning System.</p>
          <p className="mt-2 sm:mt-0 text-slate-500">
            For professional forecasting & academic analysis. Not guaranteed investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
