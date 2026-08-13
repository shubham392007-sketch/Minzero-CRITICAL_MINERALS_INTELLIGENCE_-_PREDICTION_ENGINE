import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclosureNotice from './components/DisclosureNotice';
import Home from './pages/Home';
import Disruption from './pages/Disruption';
import Risk from './pages/Risk';
import Price from './pages/Price';
import Shocks from './pages/Shocks';
import MineralDetail from './pages/MineralDetail';
import CountryDetail from './pages/CountryDetail';
import Analytics from './pages/Analytics';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMineral, setSelectedMineral] = useState('Lithium');
  const [selectedCountry, setSelectedCountry] = useState('China');
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

  const navigateTo = (tab, param = null) => {
    if (tab === 'mineral' && param) setSelectedMineral(param);
    if (tab === 'country' && param) setSelectedCountry(param);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'disruption':
        return <Disruption onNavigate={navigateTo} />;
      case 'risk':
        return <Risk onNavigate={navigateTo} />;
      case 'price':
        return <Price onNavigate={navigateTo} />;
      case 'shocks':
        return <Shocks onNavigate={navigateTo} />;
      case 'mineral':
        return <MineralDetail onNavigate={navigateTo} mineralName={selectedMineral} />;
      case 'country':
        return <CountryDetail onNavigate={navigateTo} countryName={selectedCountry} />;
      case 'analytics':
        return <Analytics onNavigate={navigateTo} />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EDECE7] text-[#111111] flex flex-col font-sans selection:bg-[#FF2AA1] selection:text-white">
      {/* Editorial Top Navbar */}
      <Navbar health={health} onNavigate={navigateTo} />

      {/* Main Page Body */}
      <main className="flex-1 w-full pb-12">
        {renderActiveView()}
      </main>

      {/* Mandatory Disclosure Notice Footer */}
      <DisclosureNotice />
    </div>
  );
}
