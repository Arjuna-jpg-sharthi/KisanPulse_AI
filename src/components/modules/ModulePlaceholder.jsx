import React, { useState } from 'react';
import {
  GitPullRequest,
  Code2,
  FileCode,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sprout,
  Landmark,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../shared/Card';
import { Button } from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';

export const ModulePlaceholder = ({
  moduleId, // 'farming' | 'schemes'
  title,
  subtitle,
  expectedPath,
  icon: Icon = Code2,
  accentColor = 'var(--kp-primary-600)',
  onBackToDashboard
}) => {
  const { t, language } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);

  const isFarming = moduleId === 'farming';

  return (
    <div className="kp-module-placeholder" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Banner Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--kp-radius-xl)',
          padding: '16px 20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--kp-radius-lg)',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <GitPullRequest size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: '#fef3c7',
                  color: '#92400e',
                  letterSpacing: '0.04em'
                }}
              >
                {t('modulePending', 'Integration Standby')}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>
                Feature Branch Workflow
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#14532d' }}>
              {title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            icon={<Sparkles size={14} />}
            style={{ borderColor: '#86efac', color: '#166534', backgroundColor: '#ffffff' }}
          >
            {showPreview ? 'Hide Architectural Preview' : 'View Module Architecture'}
          </Button>
          {onBackToDashboard && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToDashboard}
            >
              {t('backToDashboard', 'Return to Dashboard')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Integration Contract Card */}
      <Card className="kp-mb-6" style={{ marginBottom: '24px' }}>
        <CardHeader
          icon={<FileCode size={22} />}
          title="Module Integration Contract"
          subtitle={`Awaiting pull request merge for: ${expectedPath}`}
        />
        <CardBody>
          <p style={{ margin: '0 0 16px', fontSize: '0.92rem', color: 'var(--kp-text-secondary)', lineHeight: '1.6' }}>
            {t(
              'missingModuleDesc',
              'This module is owned by your teammate. The KisanPulse AI application foundation is structured with error boundaries and lazy loading to automatically render this module as soon as the PR is merged.'
            )}
          </p>

          <div
            style={{
              background: '#0f172a',
              borderRadius: 'var(--kp-radius-lg)',
              padding: '16px 20px',
              color: '#e2e8f0',
              fontFamily: 'monospace',
              fontSize: '0.86rem',
              overflowX: 'auto',
              marginBottom: '20px',
              border: '1px solid #334155'
            }}
          >
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>// Expected File Location:</div>
            <div style={{ color: '#38bdf8', fontWeight: '700' }}>{expectedPath}</div>
            <div style={{ color: '#94a3b8', margin: '12px 0 8px' }}>// Component Export Contract:</div>
            <div style={{ color: '#4ade80' }}>
              export default function {isFarming ? 'FarmingModule' : 'SchemeModule'}(props) &#123;
            </div>
            <div style={{ color: '#cbd5e1', paddingLeft: '16px' }}>
              // props: &#123; language: 'en' | 'hi', isOffline: boolean, t: Function, navigate: Function &#125;
            </div>
            <div style={{ color: '#cbd5e1', paddingLeft: '16px' }}>
              return &lt;div className=&quot;kp-module-container&quot;&gt;...&lt;/div&gt;;
            </div>
            <div style={{ color: '#4ade80' }}>&#125;</div>
          </div>

          <div className="kp-grid kp-grid-cols-3 kp-gap-4">
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--kp-radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--kp-success)' }} />
                <strong style={{ fontSize: '0.85rem' }}>CSS Inheritance</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                Access to all <code>--kp-*</code> shared CSS tokens without global namespace conflicts.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--kp-radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--kp-success)' }} />
                <strong style={{ fontSize: '0.85rem' }}>Crash Safeguard</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                Wrapped in <code>ErrorBoundary</code> and <code>Suspense</code> to ensure zero app crashes.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--kp-radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--kp-success)' }} />
                <strong style={{ fontSize: '0.85rem' }}>Offline Support</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                Receives <code>isOffline</code> prop and displays offline badges seamlessly.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Architectural Wireframe / Feature Preview */}
      {showPreview && (
        <Card style={{ marginBottom: '24px', border: '1px solid #cbd5e1' }}>
          <CardHeader
            icon={<Cpu size={20} />}
            title={`${title} — Architectural Blueprint`}
            subtitle="Preview of intended module features and UI layout specifications"
          />
          <CardBody>
            {isFarming ? (
              <div className="kp-flex kp-flex-col kp-gap-4">
                <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
                    <Sprout size={18} />
                    <span>Crop Health Diagnosis Engine</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532d' }}>
                    Camera upload / drag-and-drop crop leaf scanner, leaf disease prediction (e.g. Yellow Rust in Wheat, Leaf Blight in Paddy), recommended organic and chemical remedies, and pesticide dosage advisor.
                  </p>
                </div>

                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e40af', marginBottom: '6px' }}>
                    <Layers size={18} />
                    <span>Smart Irrigation & Soil Telemetry</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e3a8a' }}>
                    Soil moisture indicators (Optimal 45-60%), NPK nutrient balance guide, smart drip irrigation schedule based on upcoming rainfall and temperature forecast.
                  </p>
                </div>
              </div>
            ) : (
              <div className="kp-flex kp-flex-col kp-gap-4">
                <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>
                    <Landmark size={18} />
                    <span>Government Subsidies & Eligibility Matcher</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f' }}>
                    Intelligent rule-engine for PM-KISAN (₹6,000/year direct transfer), PM Fasal Bima Yojana (crop insurance against drought/flood), Soil Health Card scheme, and solar pump (PM-KUSUM) subsidies.
                  </p>
                </div>

                <div style={{ padding: '16px', background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#9d174d', marginBottom: '6px' }}>
                    <FileCode size={18} />
                    <span>Application Guide & CSC Kendra Locator</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#831843' }}>
                    Step-by-step document checklist (Aadhaar, Khasra/Khatauni, Bank Passbook) with offline form download and nearest Common Service Centre (CSC) lookup.
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ModulePlaceholder;
