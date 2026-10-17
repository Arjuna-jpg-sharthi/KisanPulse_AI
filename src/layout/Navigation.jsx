import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBasket,
  Sprout,
  FileCheck2,
  Settings,
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    labelKey: 'navDashboard',
    defaultLabel: 'Dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    id: 'mandi',
    labelKey: 'navMandi',
    defaultLabel: 'Smart Mandi & Profit',
    icon: TrendingUp,
    badge: 'Live'
  },
  {
    id: 'marketplace',
    labelKey: 'navMarketplace',
    defaultLabel: 'Kisan Vyapar Marketplace',
    icon: ShoppingBasket,
    badge: 'Demo'
  },
  {
    id: 'farming',
    labelKey: 'navCropHealth',
    defaultLabel: 'Crop Health & Farming',
    icon: Sprout,
    badge: 'AI'
  },
  {
    id: 'schemes',
    labelKey: 'navSchemes',
    defaultLabel: 'SchemeMatch AI',
    icon: FileCheck2,
    badge: 'Govt'
  },
  {
    id: 'settings',
    labelKey: 'navSettings',
    defaultLabel: 'Settings & Sync',
    icon: Settings,
    badge: null
  }
];

export const Navigation = ({
  currentView,
  onNavigate,
  mobileOpen = false,
  onCloseMobile
}) => {
  const { t } = useLanguage();

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`kp-sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside className={`kp-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="kp-sidebar-header">
          <img
            src="/logo.svg"
            alt="KisanPulse AI Logo"
            className="kp-sidebar-logo-icon"
          />
          <div className="kp-sidebar-brand-text">
            <span className="kp-sidebar-brand-name">
              KisanPulse <span>AI</span>
            </span>
            <span className="kp-sidebar-brand-tagline">
              {t('appTagline', 'Smart Agriculture & Rural Development')}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="kp-sidebar-nav" aria-label="Main Navigation">
          <div className="kp-nav-section-title">Navigation / नेविगेशन</div>
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`kp-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="kp-nav-item-icon" />
                <span className="kp-nav-item-text">
                  {t(item.labelKey, item.defaultLabel)}
                </span>
                {item.badge && (
                  <span className="kp-nav-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="kp-sidebar-footer">
          <div className="kp-flex kp-items-center kp-gap-2" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--kp-primary-600)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--kp-text-secondary)' }}>
              Hackathon Ready
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--kp-text-muted)', lineHeight: '1.4' }}>
            KisanPulse AI Foundation Shell v1.0 • Offline Sync & Multi-module integration
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
