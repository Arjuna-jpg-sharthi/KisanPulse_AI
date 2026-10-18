import React, { useState } from 'react';
import {
  Clock,
  Sprout,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import SellFirstAdvisor from './SellFirstAdvisor';
import AlternateCropAdvisor from './AlternateCropAdvisor';
import './advisors.css';

/**
 * ============================================================================
 * KISANPULSE AI — FARM ADVISORS UNIFIED MODULE
 * ============================================================================
 * Primary entry point for decision support tools:
 * 1. "Which crop should I sell first?" shelf-life & perishability urgency advisor
 * 2. Short-duration catch crop window demo ("what to grow in the meanwhile")
 * 3. Transparent agronomic methodology & integrity notes
 *
 * PROPS:
 * @param {string} [language='en'] - 'en' | 'hi'
 * @param {boolean} [isOffline=false] - Connection state
 * @param {Function} [onNavigate] - View routing function
 * @param {string} [defaultTab='sellFirst'] - 'sellFirst' | 'alternateCrop' | 'methodology'
 */
export default function FarmAdvisorsModule({
  language = 'en',
  isOffline = false,
  onNavigate,
  defaultTab = 'sellFirst'
}) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="kp-advisors-module-root">
      {/* Top Tab Switcher */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 0 20px' }}>
        <div className="kp-adv-nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sellFirst'}
            className={`kp-adv-tab-btn ${activeTab === 'sellFirst' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellFirst')}
          >
            <Clock size={17} />
            <span>{isHi ? '१. पहले क्या बेचें? (प्राथमिकता)' : '1. Which Crop to Sell First?'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'alternateCrop'}
            className={`kp-adv-tab-btn ${activeTab === 'alternateCrop' ? 'active' : ''}`}
            onClick={() => setActiveTab('alternateCrop')}
          >
            <Sprout size={17} />
            <span>{isHi ? '२. बीच में क्या उगाएं? (लघु विंडो)' : '2. Short-Duration Crop Window'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'methodology'}
            className={`kp-adv-tab-btn ${activeTab === 'methodology' ? 'active' : ''}`}
            onClick={() => setActiveTab('methodology')}
          >
            <BookOpen size={17} />
            <span>{isHi ? '३. कार्यप्रणाली व डेटा स्रोत' : '3. Methodology & Assumptions'}</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'sellFirst' && (
        <SellFirstAdvisor
          language={language}
          isOffline={isOffline}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'alternateCrop' && (
        <AlternateCropAdvisor
          language={language}
          isOffline={isOffline}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'methodology' && (
        <div className="kp-adv-wrapper">
          <div className="kp-adv-header">
            <h2 className="kp-adv-title">
              <BookOpen size={26} color="#15803d" />
              {isHi ? 'कृषि वैज्ञानिक कार्यप्रणाली एवं नियम' : 'Agronomic Methodology & Integrity Documentation'}
            </h2>
            <p className="kp-adv-subtitle">
              {isHi
                ? 'KisanPulse AI के सलाहकार मॉड्यूल के पीछे के गणितीय सूत्र, बेंचमार्क डेटा और भविष्य के कार्यों का विवरण।'
                : 'Detailed agronomic formulas, data integrity standards, baseline sources, and documented future work.'}
            </p>
          </div>

          <div className="kp-adv-card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              {isHi ? '१. "पहले क्या बेचें?" प्राथमिकता गणना सूत्र' : '1. Sell-First Urgency Mathematical Model'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
              The composite Urgency Index ($U \in [5, 99]$) is computed purely from verified post-harvest factors:
            </p>
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '13px', margin: '12px 0' }}>
              <div><strong>1. Storage Duration:</strong> Days Stored = max(0, CurrentDate - HarvestDate)</div>
              <div><strong>2. Effective Shelf-Life:</strong> S = CustomDays || (BaseAmbientDays × StorageModifier)</div>
              <div><strong>3. Shelf-Life Ratio:</strong> R = DaysStored / S</div>
              <div><strong>4. Urgency Score:</strong> U = clamp(5, 99, BaseScore(R) + PerishabilityMod + StorageHazard + OfferExpiryUrgency)</div>
            </div>
            <ul style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#475569', paddingLeft: '20px' }}>
              <li><strong>High Perishability (Tomatoes, Green Chillies):</strong> Exponential decay penalty once 50% of ambient shelf life is reached.</li>
              <li><strong>Storage Modifiers:</strong> Uncovered field ($0.6\times$ shelf-life), Ambient room ($1.0\times$), Ventilated Godown ($1.4\times$), Hermetic PICS bag ($2.2\times$), Cold Storage ($3.5\times$).</li>
              <li><strong>Buyer Offer Pressure:</strong> If an active offer expires within 2 days, urgency receives a $+14$ point boost to capture liquidity.</li>
              <li><strong>Strict Price Momentum Policy:</strong> Real-time price trends are <em>explicitly reported as unavailable</em> because no streaming Agmarknet/e-NAM API is connected in offline mode. No speculative price curves are fabricated.</li>
            </ul>
          </div>

          <div className="kp-adv-card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              {isHi ? '२. लघु अवधि फसल विंडो के चयन नियम' : '2. Short-Duration Crop Window Selection Rules'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
              Candidate catch crops are evaluated against 4 deterministic agronomic criteria:
            </p>
            <ol style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#475569', paddingLeft: '20px' }}>
              <li><strong>Duration Feasibility:</strong> Available days must be at least the crop’s minimum maturity period. Excludes crops that cannot mature before the next primary sowing season.</li>
              <li><strong>Water Accessibility:</strong> Ensures crop water requirement does not exceed farmer's actual source (e.g. Cucurbits strictly excluded under rainfed conditions).</li>
              <li><strong>Soil Texture Matching:</strong> Matches root morphology (e.g. Sandy loam for taproot legumes vs heavier clay loam for moisture retention).</li>
              <li><strong>Soil Health / Legume Bonus:</strong> Crops providing biological nitrogen fixation (e.g. Summer Moong adding 30-35 kg N/ha, Dhaincha adding 60-80 kg N/ha) receive priority scoring.</li>
            </ol>
          </div>

          <div className="kp-adv-card" style={{ borderLeft: '4px solid #0284c7' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              {isHi ? '३. भविष्य का कार्य (Future Work Documentation)' : '3. Documented Future Work & Excluded Options'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
              Per competition guidelines, any capability lacking verified, defensible rule foundations was omitted from this release and documented for upcoming releases:
            </p>
            <ul style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#475569', paddingLeft: '20px' }}>
              <li><strong>Multi-Year Climate Forecasts:</strong> Long-range monsoon onset prediction requires IMD seasonal numerical weather prediction models; current release limits guidance to user-specified days.</li>
              <li><strong>Micro-Zone Soil Salinity Sensors:</strong> Smartphone cameras cannot measure electrical conductivity (EC) or available nitrogen; soil context relies on farmer-selected classifications.</li>
              <li><strong>Live Agmarknet / e-NAM API Hook:</strong> Once government mandi API credentials and streaming WebSockets are provisioned in production, real-time price momentum will dynamically adjust urgency scores.</li>
              <li><strong>Intercropping In Standing Canopies:</strong> Relay seeding into standing sugarcane or fruit orchards requires specialized shade-tolerant agronomic models not yet validated for all regions.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
