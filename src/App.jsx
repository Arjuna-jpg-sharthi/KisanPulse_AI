import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { AppShell } from './layout/AppShell';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SmartMandiView } from './components/mandi/SmartMandiView';
import MarketplaceModule from './modules/marketplace/MarketplaceExchange';
import { ModuleContainer } from './components/modules/ModuleContainer';
import { SettingsView } from './components/settings/SettingsView';
import KisanAssistant from './components/assistant/KisanAssistant';
import FarmAdvisorsModule from './modules/advisors/FarmAdvisorsModule';
import WeatherForecastView from './components/weather/WeatherForecastView';
import LandAreaCalculator from './components/farming/LandAreaCalculator';
import AccountView from './components/auth/AccountView';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './i18n/LanguageContext';

/**
 * ============================================================================
 * KISANPULSE AI — APPLICATION FOUNDATION & INTEGRATION SHELL
 * ============================================================================
 * Integration Contract:
 * - src/modules/farming/FarmingModule.jsx
 * - src/modules/schemes/SchemeModule.jsx
 *
 * Each module exports one default React component.
 * Missing modules are handled safely by ModuleContainer with zero crashes.
 */

export function AppContent() {
  const { language } = useLanguage();
  const { user, ready } = useAuth();
  const role = user?.role || 'farmer';
  const allowedViews = role === 'buyer'
    ? ['dashboard', 'mandi', 'marketplace', 'account', 'settings']
    : role === 'admin'
      ? ['dashboard', 'mandi', 'marketplace', 'farming', 'advisors', 'weather', 'land', 'schemes', 'admin', 'account', 'settings']
      : ['dashboard', 'mandi', 'marketplace', 'farming', 'advisors', 'weather', 'land', 'schemes', 'account', 'settings'];
  const [currentView, setCurrentView] = useState(() => {
    // Sync with location hash if present
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'mandi', 'marketplace', 'farming', 'advisors', 'weather', 'land', 'schemes', 'admin', 'account', 'settings'];
    return validViews.includes(hash) ? hash : 'account';
  });
  const previousUser = useRef(undefined);
  const activeView = allowedViews.includes(currentView) ? currentView : 'dashboard';

  useEffect(() => {
    if (previousUser.current === null && user && currentView === 'account') {
      setCurrentView(role === 'admin' ? 'admin' : 'dashboard');
    }
    previousUser.current = user;
  }, [user, currentView, role]);

  // Keep URL hash in sync for clean back/forward navigation
  useEffect(() => {
    if (user && !allowedViews.includes(currentView)) setCurrentView('dashboard');
    else if (user) window.location.hash = currentView;
  }, [currentView, user, role]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['dashboard', 'mandi', 'marketplace', 'farming', 'advisors', 'weather', 'land', 'schemes', 'admin', 'account', 'settings'];
      if (validViews.includes(hash) && allowedViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allowedViews.join('|')]);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setCurrentView} />;
      case 'mandi':
        return <SmartMandiView />;
      case 'marketplace':
        return <MarketplaceModule />;
      case 'farming':
        return <ModuleContainer moduleId="farming" onNavigate={setCurrentView} />;
      case 'advisors':
        return <FarmAdvisorsModule language={language} onNavigate={setCurrentView} />;
      case 'weather':
        return <WeatherForecastView onNavigate={setCurrentView} />;
      case 'land':
        return <LandAreaCalculator />;
      case 'schemes':
        return <ModuleContainer moduleId="schemes" onNavigate={setCurrentView} />;
      case 'admin':
        return <ModuleContainer moduleId="schemes" onNavigate={setCurrentView} adminOnly />;
      case 'account':
        return <AccountView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview onNavigate={setCurrentView} />;
    }
  };

  if (!ready) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#166534' }}>Checking your KisanPulse account…</main>;
  if (!user) return <AccountView />;

  return (
    <AppShell currentView={activeView} onNavigate={setCurrentView}>
      {renderCurrentView()}
      {role !== 'buyer' && <KisanAssistant onNavigate={setCurrentView} language={language} />}
    </AppShell>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}


