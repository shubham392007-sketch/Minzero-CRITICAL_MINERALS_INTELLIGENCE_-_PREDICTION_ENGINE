import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import DisruptionPredictorView from './pages/DisruptionPredictorView';
import SupplyRiskView from './pages/SupplyRiskView';
import PriceForecastView from './pages/PriceForecastView';
import SupplyShockView from './pages/SupplyShockView';
import MineralProfileView from './pages/MineralProfileView';
import CountryProfileView from './pages/CountryProfileView';
import ModelCardsView from './pages/ModelCardsView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        setHealth(res);
      } catch (e) {
        console.error("Backend health check error:", e);
      }
    }
    checkHealth();
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'disruption':
        return <DisruptionPredictorView />;
      case 'risk':
        return <SupplyRiskView />;
      case 'price':
        return <PriceForecastView />;
      case 'shock':
        return <SupplyShockView />;
      case 'mineral_profile':
        return <MineralProfileView />;
      case 'country_profile':
        return <CountryProfileView />;
      case 'model_cards':
        return <ModelCardsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col font-sans">
      <Header health={health} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
