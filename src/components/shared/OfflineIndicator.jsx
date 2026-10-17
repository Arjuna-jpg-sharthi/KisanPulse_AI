import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const OfflineIndicator = ({ showToggle = true, className = '' }) => {
  const { isOffline, isSimulated, toggleSimulation } = useNetwork();
  const { t } = useLanguage();

  return (
    <div className={`kp-flex kp-items-center kp-gap-2 ${className}`}>
      <div
        className={`kp-offline-pill ${isOffline ? 'offline' : 'online'}`}
        title={
          isOffline
            ? isSimulated
              ? 'Simulated offline mode active'
              : 'Network disconnected'
            : 'Connected to live network'
        }
      >
        <span className="kp-status-dot" />
        {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
        <span>{isOffline ? t('statusOffline', 'Offline Mode') : t('statusOnline', 'Live Network')}</span>
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={toggleSimulation}
          className="kp-btn kp-btn-ghost kp-btn-sm"
          style={{ fontSize: '0.72rem', padding: '2px 8px', color: 'var(--kp-text-muted)' }}
          title={isOffline ? 'Switch back to online mode' : 'Simulate offline environment for testing'}
        >
          {isOffline ? t('simulateOnline', 'Go Online') : t('simulateOffline', 'Simulate Offline')}
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;
