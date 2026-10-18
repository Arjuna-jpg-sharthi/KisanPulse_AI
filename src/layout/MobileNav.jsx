import React from 'react';
import { LayoutDashboard, TrendingUp, Sprout, FileCheck2, ShoppingBasket, UserRound, ShieldCheck, CloudSun, Calculator, Clock3 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const MobileNav = ({ currentView, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const allItems = [
    { id: 'dashboard', labelKey: 'navDashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'mandi', labelKey: 'navMandi', defaultLabel: 'Mandi', icon: TrendingUp },
    { id: 'marketplace', labelKey: 'navMarketplace', defaultLabel: 'Market', icon: ShoppingBasket },
    { id: 'farming', labelKey: 'navCropHealth', defaultLabel: 'Farming', icon: Sprout },
    { id: 'schemes', labelKey: 'navSchemes', defaultLabel: 'Schemes', icon: FileCheck2 },
    { id: 'advisors', labelKey: 'navAdvisors', defaultLabel: 'Advisors', icon: Clock3 },
    { id: 'weather', labelKey: 'navWeather', defaultLabel: 'Weather', icon: CloudSun },
    { id: 'land', labelKey: 'navLand', defaultLabel: 'Land', icon: Calculator },
    { id: 'account', labelKey: 'navAccount', defaultLabel: 'Account', icon: UserRound },
    { id: 'admin', labelKey: 'navAdmin', defaultLabel: 'Admin', icon: ShieldCheck }
  ];
  const allowedIds = user?.role === 'buyer'
    ? ['dashboard', 'mandi', 'marketplace', 'account']
    : user?.role === 'admin'
      ? ['dashboard', 'mandi', 'marketplace', 'farming', 'schemes', 'admin']
      : ['dashboard', 'mandi', 'marketplace', 'farming', 'schemes'];
  const mobileItems = allItems.filter((item) => allowedIds.includes(item.id));

  return (
    <nav className="kp-mobile-nav" aria-label="Mobile Bottom Navigation">
      <ul className="kp-mobile-nav-list">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <li key={item.id} style={{ flex: 1, display: 'flex' }}>
              <button
                type="button"
                className={`kp-mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{ width: '100%' }}
              >
                <Icon className="kp-mobile-nav-icon" />
                <span className="kp-truncate" style={{ maxWidth: '80px' }}>
                  {t(item.labelKey, item.defaultLabel)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
