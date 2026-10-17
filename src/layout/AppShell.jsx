import React, { useState } from 'react';
import { Header } from './Header';
import { Navigation, NAVIGATION_ITEMS } from './Navigation';
import { MobileNav } from './MobileNav';
import { CachedDataWarning } from '../components/shared/CachedDataWarning';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { useLanguage } from '../i18n/LanguageContext';

export const AppShell = ({ currentView, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const currentItem = NAVIGATION_ITEMS.find((item) => item.id === currentView) || NAVIGATION_ITEMS[0];
  const viewTitle = t(currentItem.labelKey, currentItem.defaultLabel);
  const ViewIcon = currentItem.icon;

  return (
    <div className="kp-app-root">
      <div className="kp-shell">
        {/* Sidebar for Desktop & Mobile Drawer */}
        <Navigation
          currentView={currentView}
          onNavigate={onNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="kp-main-wrapper">
          {/* Top Header */}
          <Header
            currentView={currentView}
            viewTitle={viewTitle}
            viewIcon={ViewIcon}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Offline Cached Data Warning Banner */}
          <CachedDataWarning />

          {/* Main Dynamic View Content */}
          <main className="kp-content-container">
            <ErrorBoundary
              title="Application Display Error"
              message="A rendering error occurred in this view. Use the button below to recover."
              onReset={() => onNavigate('dashboard')}
            >
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default AppShell;
