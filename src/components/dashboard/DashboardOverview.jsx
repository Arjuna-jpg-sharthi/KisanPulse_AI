import React from 'react';
import {
  TrendingUp,
  Sprout,
  FileCheck2,
  Calculator,
  Sun,
  CloudRain,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../shared/Card';
import { Button } from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMandiPrices } from '../../hooks/useMandiPrices';

export const DashboardOverview = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { records: mandiRecords, loading: mandiLoading, error: mandiError, staleSnapshot } = useMandiPrices();
  const mandiHighlights = mandiRecords.filter((record) => record.modalPrice !== null).slice(0, 4);

  return (
    <div className="kp-dashboard-view">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 60%, #14532d 100%)',
          borderRadius: 'var(--kp-radius-2xl)',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '12px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Sparkles size={14} />
            <span>{t('hackathonBadge', 'Smart India Hackathon Edition')}</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {t('dashboardWelcome', 'Namaste, Kisan Bandhu!')}
          </h2>
          <p style={{ margin: 0, fontSize: '0.98rem', opacity: 0.9, lineHeight: '1.5' }}>
            {t('dashboardSubheader', 'Real-time crop intelligence, mandi rates, and government schemes personalized for your farm.')}
          </p>
        </div>

        {/* Decorative crop illustration circle */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* KPI Stat Cards */}
      <div className="kp-grid kp-grid-cols-4 kp-gap-4" style={{ marginBottom: '28px' }}>
        <Card variant="stat" hoverable onClick={() => onNavigate('mandi')} style={{ cursor: 'pointer' }}>
          <div className="kp-stat-top">
            <span className="kp-stat-label">{t('kpiMandiAverage', 'Mandi Price Index')}</span>
            <div className="kp-card-icon-wrap" style={{ width: '32px', height: '32px' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kp-stat-value">{mandiHighlights[0]?.modalPrice != null ? `₹${mandiHighlights[0].modalPrice.toLocaleString('en-IN')}` : '—'}<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--kp-text-muted)' }}>/q</span></div>
          <div className="kp-stat-meta">
            <span className="kp-badge kp-badge-info">{mandiLoading ? 'Loading mandi data…' : mandiError ? 'Mandi data unavailable' : staleSnapshot ? 'CSV snapshot rate' : 'Latest reported rate'}</span>
          </div>
        </Card>

        <Card variant="stat" hoverable onClick={() => onNavigate('farming')} style={{ cursor: 'pointer' }}>
          <div className="kp-stat-top">
            <span className="kp-stat-label">{t('kpiActiveCrops', 'Monitored Crops')}</span>
            <div className="kp-card-icon-wrap" style={{ width: '32px', height: '32px' }}>
              <Sprout size={16} />
            </div>
          </div>
          <div className="kp-stat-value">5 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--kp-text-muted)' }}>varieties</span></div>
          <div className="kp-stat-meta">
            <span className="kp-badge kp-badge-info">12 Acres Active</span>
          </div>
        </Card>

        <Card variant="stat" hoverable onClick={() => onNavigate('schemes')} style={{ cursor: 'pointer' }}>
          <div className="kp-stat-top">
            <span className="kp-stat-label">{t('kpiSchemesEligible', 'Eligible Schemes')}</span>
            <div className="kp-card-icon-wrap accent" style={{ width: '32px', height: '32px' }}>
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="kp-stat-value">4 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--kp-text-muted)' }}>matched</span></div>
          <div className="kp-stat-meta">
            <span className="kp-badge kp-badge-warning">₹32,000+ Subsidy</span>
          </div>
        </Card>

        <Card variant="stat">
          <div className="kp-stat-top">
            <span className="kp-stat-label">{t('kpiHealthScore', 'Soil & Health Index')}</span>
            <div className="kp-card-icon-wrap" style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="kp-stat-value">84<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--kp-text-muted)' }}>/100</span></div>
          <div className="kp-stat-meta">
            <span className="kp-badge kp-badge-success">{t('kpiTrendStable', 'Optimal condition')}</span>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <Card style={{ marginBottom: '28px' }}>
        <CardHeader
          title={t('quickActionsTitle', 'Quick Farm Operations')}
          subtitle="One-click access to core agriculture engines"
        />
        <CardBody>
          <div className="kp-grid kp-grid-cols-4 kp-gap-4">
            <Button
              variant="outline"
              size="lg"
              icon={<TrendingUp size={18} />}
              onClick={() => onNavigate('mandi')}
              style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>{t('actionCheckMandi', 'Check Mandi Rates')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--kp-text-muted)' }}>Latest daily-reported market prices</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<Calculator size={18} />}
              onClick={() => onNavigate('mandi')}
              style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>{t('actionCalculateProfit', 'Calculate Profit')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--kp-text-muted)' }}>Revenue & cost estimator</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<Sprout size={18} />}
              onClick={() => onNavigate('farming')}
              style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>{t('actionDiagnoseCrop', 'Crop Health')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--kp-text-muted)' }}>Disease detection & advice</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<FileCheck2 size={18} />}
              onClick={() => onNavigate('schemes')}
              style={{ justifyContent: 'flex-start', padding: '14px 18px', height: 'auto' }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>{t('actionFindSchemes', 'Explore Subsidies')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--kp-text-muted)' }}>PM-KISAN & State Schemes</div>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Two-Column Layout: Live Mandi Highlights & Agri-Weather Alert */}
      <div className="kp-grid kp-grid-cols-3 kp-gap-6" style={{ marginBottom: '28px' }}>
        {/* Mandi Ticker Preview (2 Columns) */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <CardHeader
              icon={<TrendingUp size={20} />}
              title={t('mandiHighlightsTitle', 'Latest APMC Mandi Prices')}
              subtitle={t('mandiSubtitle', 'Daily-reported market prices from data.gov.in / AGMARKNET')}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight size={16} />}
                  iconPosition="right"
                  onClick={() => onNavigate('mandi')}
                >
                  {t('viewAllMandi', 'Open Engine')}
                </Button>
              }
            />
            <CardBody style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--kp-border)', color: 'var(--kp-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>{t('crop', 'Crop')}</th>
                      <th style={{ padding: '12px 16px' }}>{t('market', 'Market')}</th>
                      <th style={{ padding: '12px 16px' }}>{t('currentPrice', 'Price')}</th>
                      <th style={{ padding: '12px 16px' }}>Arrival date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandiHighlights.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--kp-border-subtle)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--kp-text-primary)' }}>
                          {row.cropEn}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--kp-text-secondary)', fontSize: '0.85rem' }}>
                          {[row.market, row.district, row.state].filter(Boolean).join(', ')}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
                          ₹{row.modalPrice.toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--kp-text-muted)', marginLeft: '4px' }}>
                            / q
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--kp-text-muted)', fontSize: '0.85rem' }}>
                          {row.arrivalDate || '—'}
                        </td>
                      </tr>
                    ))}
                    {!mandiHighlights.length && (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px 16px', color: 'var(--kp-text-muted)' }}>
                          {mandiLoading ? 'Loading official mandi reports…' : mandiError || 'No mandi records are available yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p style={{ margin: '10px 16px', fontSize: '0.76rem', color: 'var(--kp-text-muted)' }}>
                Government mandi reports update daily and may lag market activity.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Agri-Weather & Pest Advisory (1 Column) */}
        <div>
          <Card style={{ height: '100%' }}>
            <CardHeader
              icon={<Sun size={20} />}
              iconVariant="accent"
              title={t('weatherAdvisoryTitle', 'Agri-Weather Alert')}
              subtitle="Regional Field Advisory"
            />
            <CardBody>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--kp-accent-50)',
                  borderRadius: 'var(--kp-radius-lg)',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--kp-accent-700)', lineHeight: '1.1' }}>
                    {t('weatherTemp', '28°C')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--kp-accent-600)', fontWeight: '600' }}>
                    {t('weatherCondition', 'Clear Sky / Mild Humidity')}
                  </div>
                </div>
                <CloudRain size={36} style={{ color: 'var(--kp-accent-600)' }} />
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--kp-text-secondary)', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 12px' }}>
                  {t(
                    'weatherAdvice',
                    'Favorable conditions for mustard sowing and wheat irrigation. Low aphid pest risk over the next 48 hours.'
                  )}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--kp-border-subtle)', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--kp-success)', fontWeight: '700' }}>
                  <CheckCircle size={14} />
                  <span>Irrigation window: Optimal until Thursday</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
