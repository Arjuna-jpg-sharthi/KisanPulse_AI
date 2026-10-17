import React from 'react';
import { Menu, X, Sparkles, Bell } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { OfflineIndicator } from '../components/shared/OfflineIndicator';

export const Header = ({
  currentView,
  viewTitle,
  viewIcon: ViewIcon,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="kp-header">
      <div className="kp-header-left">
        <button
          type="button"
          className="kp-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <h1 className="kp-header-page-title">
          {ViewIcon && <ViewIcon size={20} style={{ color: 'var(--kp-primary-600)' }} />}
          <span>{viewTitle}</span>
        </h1>
      </div>

      <div className="kp-header-right">
        {/* Offline & Connectivity Status Indicator */}
        <OfflineIndicator showToggle={true} />

        {/* Language Switcher: English / हिंदी */}
        <div className="kp-lang-toggle" role="group" aria-label="Language selection">
          <button
            type="button"
            className={`kp-lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            title="English Interface"
          >
            EN
          </button>
          <button
            type="button"
            className={`kp-lang-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
            title="हिंदी इंटरफ़ेस"
          >
            हिन्दी
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
