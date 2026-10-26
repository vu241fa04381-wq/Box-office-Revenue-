import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { ComparePage } from './pages/ComparePage';
import { ExplorePage } from './pages/ExplorePage';
import { InsightsPage } from './pages/InsightsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardPage onNavigateToPredict={() => setActiveTab('predict')} />
        )}
        {activeTab === 'predict' && (
          <PredictPage onNavigateToHistory={() => setActiveTab('history')} />
        )}
        {activeTab === 'compare' && <ComparePage />}
        {activeTab === 'explore' && <ExplorePage />}
        {activeTab === 'insights' && <InsightsPage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
