import React, { useMemo, useState } from 'react';
import { Calculator, Ruler } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Card, CardBody, CardHeader } from '../shared/Card';

const SQ_METERS_PER_SQ_FOOT = 0.09290304;
const SQ_METERS_PER_ACRE = 4046.8564224;
const SQ_METERS_PER_HECTARE = 10000;
const SQ_METERS_PER_GUNTHA = 101.17141056;

function format(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value);
}

export default function LandAreaCalculator() {
  const { t } = useLanguage();
  const [length, setLength] = useState('100');
  const [width, setWidth] = useState('100');
  const [unit, setUnit] = useState('ft');
  const area = useMemo(() => {
    const l = Number(length);
    const w = Number(width);
    if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) return null;
    const squareMeters = l * w * (unit === 'ft' ? SQ_METERS_PER_SQ_FOOT : 1);
    return {
      squareMeters,
      acres: squareMeters / SQ_METERS_PER_ACRE,
      hectares: squareMeters / SQ_METERS_PER_HECTARE,
      squareFeet: squareMeters / SQ_METERS_PER_SQ_FOOT,
      gunthas: squareMeters / SQ_METERS_PER_GUNTHA
    };
  }, [length, width, unit]);

  const inputStyle = { width: '100%', padding: '11px 12px', borderRadius: 9, border: '1px solid var(--kp-border)', fontSize: 16, boxSizing: 'border-box' };
  const cards = area ? [
    ['Acres', area.acres, 'ac'],
    ['Hectares', area.hectares, 'ha'],
    ['Square metres', area.squareMeters, 'm²'],
    ['Square feet', area.squareFeet, 'ft²'],
    ['Gunthas', area.gunthas, 'guntha']
  ] : [];

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--kp-primary-700)', fontWeight: 700, fontSize: 13 }}><Calculator size={16} /> {t('landCalculatorEyebrow', 'FARM PLANNING TOOL')}</div>
        <h2 style={{ margin: '6px 0', fontSize: '1.7rem', color: 'var(--kp-text-primary)' }}>{t('landCalculatorTitle', 'Land Area Calculator')}</h2>
        <p style={{ margin: 0, color: 'var(--kp-text-muted)' }}>{t('landCalculatorDescription', 'Enter the length and width of a rectangular plot to convert its area into common farm units.')}</p>
      </div>

      <Card>
        <CardHeader icon={<Ruler size={20} />} title={t('plotDimensions', 'Plot dimensions')} subtitle={t('rectangularPlotHint', 'For a rectangular plot: length × width')} />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>{t('length', 'Length')}<input style={inputStyle} type="number" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} /></label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>{t('width', 'Width')}<input style={inputStyle} type="number" min="0" step="any" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>{t('measurementUnit', 'Measurement unit')}<select style={inputStyle} value={unit} onChange={(e) => setUnit(e.target.value)}><option value="ft">Feet (ft)</option><option value="m">Metres (m)</option></select></label>
          </div>
        </CardBody>
      </Card>

      {area ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }} aria-live="polite">
          {cards.map(([label, value, unitLabel], index) => (
            <Card key={label}>
              <CardBody>
                <div style={{ fontSize: 13, color: 'var(--kp-text-muted)', marginBottom: 8 }}>{t(`landUnit${index}`, label)}</div>
                <strong style={{ fontSize: 22, color: 'var(--kp-primary-800)' }}>{format(value)}</strong>
                <span style={{ marginLeft: 6, fontSize: 13, color: 'var(--kp-text-secondary)' }}>{unitLabel}</span>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : <p role="status" style={{ color: 'var(--kp-danger)' }}>{t('enterPositiveDimensions', 'Enter positive length and width values to calculate the area.')}</p>}

      <p style={{ margin: 0, color: 'var(--kp-text-muted)', fontSize: 12, lineHeight: 1.5 }}>{t('gunthaNote', 'Guntha conversion is standardized at 40 gunthas per acre. Bigha varies by region and is not shown as a single fixed conversion.')}</p>
    </div>
  );
}
