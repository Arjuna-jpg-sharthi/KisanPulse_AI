import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from './Button';

export const CachedDataWarning = ({ className = '' }) => {
  const { isOffline, lastSyncedTime, refreshSync } = useNetwork();
  const { t } = useLanguage();

  if (!isOffline) return null;

  const formattedTime = lastSyncedTime
    ? lastSyncedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Earlier today';

  return (
    <aside className={`kp-cached-warning-banner ${className}`} role="alert" aria-live="polite">
      <div className="kp-cached-warning-content">
        <Database size={17} style={{ flexShrink: 0, color: '#b45309' }} />
        <div>
          <strong>{t('cachedWarningTitle', 'Viewing Cached Data')}: </strong>
          <span>{t('cachedWarningDesc', 'You are currently offline. Showing local cached data.')}</span>
          <span style={{ opacity: 0.85, marginLeft: '6px' }}>
            ({t('lastSynced', 'Last updated')}: {formattedTime})
          </span>
        </div>
      </div>
      <div>
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={13} />}
          onClick={refreshSync}
          style={{
            borderColor: '#d97706',
            color: '#92400e',
            backgroundColor: '#fffbeb',
            fontSize: '0.76rem',
            padding: '3px 8px',
            minHeight: '28px'
          }}
        >
          {t('retry', 'Re-check')}
        </Button>
      </div>
    </aside>
  );
};

export default CachedDataWarning;
