import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { AppShell } from './layout/AppShell';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SmartMandiView } from './components/mandi/SmartMandiView';
import MarketplaceModule from './modules/marketplace/MarketplaceModule';
import { ModuleContainer } from './components/modules/ModuleContainer';
import { SettingsView } from './components/settings/SettingsView';
import KisanAssistant from './components/assistant/KisanAssistant';

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
  const [currentView, setCurrentView] = useState(() => {
    // Sync with location hash if present
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'mandi', 'marketplace', 'farming', 'schemes', 'settings'];
    return validViews.includes(hash) ? hash : 'dashboard';
  });

  // Keep URL hash in sync for clean back/forward navigation
  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['dashboard', 'mandi', 'marketplace', 'farming', 'schemes', 'settings'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setCurrentView} />;
      case 'mandi':
        return <SmartMandiView />;
      case 'marketplace':
        return <MarketplaceModule />;
      case 'farming':
        return <ModuleContainer moduleId="farming" onNavigate={setCurrentView} />;
      case 'schemes':
        return <ModuleContainer moduleId="schemes" onNavigate={setCurrentView} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview onNavigate={setCurrentView} />;
    }
  };

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      {renderCurrentView()}
      <KisanAssistant onNavigate={setCurrentView} />
    </AppShell>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </NetworkProvider>
  );
}


