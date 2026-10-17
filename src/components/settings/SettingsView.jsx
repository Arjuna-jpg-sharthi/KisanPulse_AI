import React from 'react';
import {
  Settings,
  Languages,
  Wifi,
  WifiOff,
  Trash2,
  CheckCircle2,
  Clock,
  Database,
  Shield,
  FileCode2,
  GitBranch
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/Card';
import { Button } from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';

export const SettingsView = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isOffline, isSimulated, toggleSimulation, refreshSync, lastSyncedTime } = useNetwork();

  const handleClearCache = () => {
    try {
      localStorage.removeItem('kisanpulse_language');
      alert('Local storage preferences cleared. Page will refresh.');
      window.location.reload();
    } catch (e) {}
  };

  return (
    <div className="kp-settings-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
          {t('navSettings', 'Settings & System Diagnostics')}
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: 'var(--kp-text-muted)' }}>
          Configure language preferences, test offline sync capabilities, and review hackathon module status.
        </p>
      </div>

      <div className="kp-flex kp-flex-col kp-gap-6">
        {/* Language Selection Card */}
        <Card>
          <CardHeader
            icon={<Languages size={20} />}
            title="Language & Localization (भाषा चयन)"
            subtitle="Choose your preferred interface dialect"
          />
          <CardBody>
            <div className="kp-grid kp-grid-cols-2 kp-gap-4">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--kp-radius-lg)',
                  border: `2px solid ${language === 'en' ? 'var(--kp-primary-600)' : 'var(--kp-border)'}`,
                  backgroundColor: language === 'en' ? 'var(--kp-primary-50)' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1rem', color: language === 'en' ? 'var(--kp-primary-800)' : 'var(--kp-text-primary)' }}>
                  English
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--kp-text-muted)', marginTop: '4px' }}>
                  Standard English agri-tech interface
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('hi')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--kp-radius-lg)',
                  border: `2px solid ${language === 'hi' ? 'var(--kp-primary-600)' : 'var(--kp-border)'}`,
                  backgroundColor: language === 'hi' ? 'var(--kp-primary-50)' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1rem', color: language === 'hi' ? 'var(--kp-primary-800)' : 'var(--kp-text-primary)' }}>
                  हिन्दी (Hindi)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--kp-text-muted)', marginTop: '4px' }}>
                  भारतीय किसानों एवं ग्रामीण बंधुओं के लिए सुगम
                </div>
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Offline & Cache Management */}
        <Card>
          <CardHeader
            icon={<Database size={20} />}
            title="Offline Operation & Data Sync"
            subtitle="Field resilience and cached telemetry control"
          />
          <CardBody>
            <div className="kp-flex kp-flex-col kp-gap-4">
              <div className="kp-flex kp-justify-between kp-items-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Network Connectivity Status</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
                    {isOffline ? 'Currently operating in Offline Mode' : 'Connected to live internet'}
                  </div>
                </div>
                <Button
                  variant={isOffline ? 'primary' : 'outline'}
                  size="md"
                  icon={isOffline ? <Wifi size={16} /> : <WifiOff size={16} />}
                  onClick={toggleSimulation}
                >
                  {isOffline ? 'Switch to Online' : 'Simulate Offline'}
                </Button>
              </div>

              <div className="kp-divider" />

              <div className="kp-flex kp-justify-between kp-items-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Local Preferences Cache</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
                    Reset localStorage settings and cached farm parameters
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={15} />}
                  onClick={handleClearCache}
                  style={{ color: 'var(--kp-danger)' }}
                >
                  Clear Storage
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Git & Module Integration Contract Diagnostics */}
        <Card>
          <CardHeader
            icon={<GitBranch size={20} />}
            title="Module Integration Diagnostics"
            subtitle="Current architecture status for teammate pull requests"
          />
          <CardBody>
            <div className="kp-flex kp-flex-col kp-gap-3">
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--kp-success)' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Smart Mandi Engine</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>Integrated directly into foundation shell</div>
                  </div>
                </div>
                <span className="kp-badge kp-badge-success">Operational</span>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--kp-warning)' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Crop Health & Smart Farming</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>Contract: src/modules/farming/FarmingModule.jsx</div>
                  </div>
                </div>
                <span className="kp-badge kp-badge-warning">Awaiting PR</span>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--kp-warning)' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Government SchemeMatch</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>Contract: src/modules/schemes/SchemeModule.jsx</div>
                  </div>
                </div>
                <span className="kp-badge kp-badge-warning">Awaiting PR</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;
