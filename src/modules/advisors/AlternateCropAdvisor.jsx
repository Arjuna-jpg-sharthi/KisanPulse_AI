import React, { useState, useMemo } from 'react';
import {
  Sprout,
  HelpCircle,
  Calendar,
  Droplet,
  Layers,
  MapPin,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Info
} from 'lucide-react';
import {
  REGIONS_CATALOG,
  SEASONS_CATALOG,
  SOIL_TYPES,
  WATER_LEVELS
} from './advisorData';
import {
  evaluateAlternateCrops,
  getAdvisorStorage,
  setAdvisorStorage
} from './advisorUtils';
import './advisors.css';

/**
 * ============================================================================
 * SHORT-DURATION CROP-WINDOW ADVISOR (ALTERNATE CROPS DEMO)
 * ============================================================================
 * Identifies viable short-duration catch crops (e.g., Summer Moong, Cowpea,
 * Cucurbits, Green Manuring) that can be grown in the gap between major seasons.
 *
 * PROPS:
 * @param {string} [language='en'] - 'en' | 'hi'
 * @param {boolean} [isOffline=false]
 * @param {Function} [onNavigate]
 */
export default function AlternateCropAdvisor({
  language = 'en',
  isOffline = false,
  onNavigate
}) {
  const isHi = language === 'hi';

  // State: Filter Parameters
  const [params, setParams] = useState(() => {
    const saved = getAdvisorStorage('crop_window_params', null);
    if (saved) return saved;
    return {
      regionId: 'north_plains',
      seasonId: 'zaid_summer',
      availableDays: 65,
      soilId: 'sandy_loam',
      waterId: 'assured_tube'
    };
  });

  const [showExcluded, setShowExcluded] = useState(false);

  // Sync to storage
  const handleParamChange = (field, value) => {
    setParams(prev => {
      const updated = { ...prev, [field]: value };
      setAdvisorStorage('crop_window_params', updated);
      return updated;
    });
  };

  // Run evaluation
  const { matchedCrops, excludedCrops, totalEvaluated } = useMemo(() => {
    return evaluateAlternateCrops(params);
  }, [params]);

  return (
    <div className="kp-adv-wrapper">
      {/* Header */}
      <div className="kp-adv-header">
        <div className="kp-adv-title-row">
          <h2 className="kp-adv-title">
            <Sprout size={28} color="#15803d" />
            {isHi ? 'लघु अवधि अंतर-फसल सलाहकार' : 'Short-Duration Crop-Window Advisor'}
          </h2>
          <span className="kp-adv-badge-ai">
            <Sparkles size={14} />
            {isHi ? 'नियम-आधारित सिफारिशें' : 'Rule-Based Shortlist Demo'}
          </span>
        </div>
        <p className="kp-adv-subtitle">
          {isHi
            ? 'दो मुख्य फसलों के बीच खाली समय में कौन सी फसल उगाई जा सकती है? अपने खेत का संदर्भ दर्ज करें और पारदर्शी agronomic नियमों पर आधारित विकल्प देखें।'
            : 'Explore short-duration catch crops that fit into fallow windows between your main crop cycles (e.g. post-wheat summer window). Built on transparent ICAR agronomic rules.'}
        </p>
      </div>

      {/* Mandatory Agronomic Disclaimer Banner */}
      <div className="kp-adv-notice-banner kp-adv-notice-warning" role="alert">
        <ShieldAlert size={22} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>
            {isHi
              ? 'कृषि वैज्ञानिक सलाह एवं अस्वीकरण (KVK सत्यापन)'
              : 'Agronomic Guidance & Non-Prescription Notice'}
          </strong>
          <span>
            {isHi
              ? 'यह सूची एक सांकेतिक नियम-आधारित शॉर्टलिस्ट है, कोई निश्चित नुस्खा नहीं। वास्तविक उपयुक्तता और फसल अवधि स्थानीय तापमान, बीज किस्म और मिट्टी की स्थिति पर निर्भर करती है। बीज खरीदने या बुवाई से पहले अपने स्थानीय कृषि विज्ञान केंद्र (KVK) या ब्लॉक कृषि अधिकारी से अवश्य पुष्टि करें।'
              : 'This is a rule-based agronomic shortlist, not a definitive commercial prescription. Crop duration, germination, and yield vary significantly by specific seed variety, localized microclimate, and field conditions. Farmers must verify seed choices with their local Krishi Vigyan Kendra (KVK) or block agricultural extension officer before planting.'}
          </span>
        </div>
      </div>

      {/* Input Parameters Form Card */}
      <div className="kp-adv-card">
        <div className="kp-adv-card-header">
          <h3 className="kp-adv-card-title">
            {isHi ? 'अपने खेत का संदर्भ दर्ज करें' : 'Your Farm & Seasonal Window Context'}
          </h3>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {isHi ? '5 मापदंडों के आधार पर फ़िल्टर' : 'Filtered across 5 agronomic dimensions'}
          </span>
        </div>

        <div className="kp-adv-grid-3">
          {/* Region */}
          <div className="kp-adv-field">
            <label className="kp-adv-label" htmlFor="adv-alt-region">
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              {isHi ? 'कृषि जलवायु क्षेत्र (Location)' : 'Agro-Climatic Region'}
            </label>
            <select
              id="adv-alt-region"
              className="kp-adv-select"
              value={params.regionId}
              onChange={(e) => handleParamChange('regionId', e.target.value)}
            >
              {REGIONS_CATALOG.map(reg => (
                <option key={reg.id} value={reg.id}>
                  {isHi ? reg.labelHi : reg.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Season / Window */}
          <div className="kp-adv-field">
            <label className="kp-adv-label" htmlFor="adv-alt-season">
              <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
              {isHi ? 'मौसम / विंडो (Season)' : 'Season / Fallow Window'}
            </label>
            <select
              id="adv-alt-season"
              className="kp-adv-select"
              value={params.seasonId}
              onChange={(e) => handleParamChange('seasonId', e.target.value)}
            >
              {SEASONS_CATALOG.map(sea => (
                <option key={sea.id} value={sea.id}>
                  {isHi ? sea.labelHi : sea.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Available Days */}
          <div className="kp-adv-field">
            <label className="kp-adv-label" htmlFor="adv-alt-days">
              {isHi ? 'उपलब्ध दिन (अगली मुख्य फसल तक)' : 'Available Days in Window (DAS)'}
            </label>
            <input
              id="adv-alt-days"
              type="number"
              min="20"
              max="120"
              className="kp-adv-input"
              value={params.availableDays}
              onChange={(e) => handleParamChange('availableDays', Number(e.target.value) || 60)}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {[45, 60, 75, 90].map(dayPreset => (
                <button
                  key={dayPreset}
                  type="button"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: params.availableDays === dayPreset ? '#dcfce7' : '#ffffff',
                    cursor: 'pointer',
                    color: params.availableDays === dayPreset ? '#15803d' : '#475569',
                    fontWeight: params.availableDays === dayPreset ? 700 : 500
                  }}
                  onClick={() => handleParamChange('availableDays', dayPreset)}
                >
                  {dayPreset}d
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="kp-adv-grid-2" style={{ marginTop: '16px' }}>
          {/* Soil Context */}
          <div className="kp-adv-field">
            <label className="kp-adv-label" htmlFor="adv-alt-soil">
              <Layers size={14} style={{ display: 'inline', marginRight: 4 }} />
              {isHi ? 'मिट्टी का प्रकार (Soil Type)' : 'Soil Context'}
            </label>
            <select
              id="adv-alt-soil"
              className="kp-adv-select"
              value={params.soilId}
              onChange={(e) => handleParamChange('soilId', e.target.value)}
            >
              {SOIL_TYPES.map(soil => (
                <option key={soil.id} value={soil.id}>
                  {isHi ? soil.labelHi : soil.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Water Availability */}
          <div className="kp-adv-field">
            <label className="kp-adv-label" htmlFor="adv-alt-water">
              <Droplet size={14} style={{ display: 'inline', marginRight: 4 }} />
              {isHi ? 'सिंचाई की उपलब्धता (Water Availability)' : 'Irrigation / Water Availability'}
            </label>
            <select
              id="adv-alt-water"
              className="kp-adv-select"
              value={params.waterId}
              onChange={(e) => handleParamChange('waterId', e.target.value)}
            >
              {WATER_LEVELS.map(water => (
                <option key={water.id} value={water.id}>
                  {isHi ? water.labelHi : water.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            {isHi
              ? `अनुशंसित विकल्प (${matchedCrops.length} फसलें आपके ${params.availableDays} दिन के समय में अनुकूल)`
              : `Recommended Candidates (${matchedCrops.length} Crops Match Your ${params.availableDays}-Day Window)`}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            {isHi
              ? 'वैज्ञानिक नियमों पर आधारित फ़िल्टरिंग: अवधि, जल और मिट्टी के अनुसार छांटी गई'
              : 'Ranked by duration buffer, legume soil-enrichment factor, and water fit.'}
          </p>
        </div>
      </div>

      {/* Matched Crops Grid */}
      {matchedCrops.length > 0 ? (
        <div className="kp-adv-crop-grid">
          {matchedCrops.map(crop => (
            <div key={crop.id} className="kp-adv-alt-card">
              <div>
                <div className="kp-adv-alt-header">
                  <div>
                    <div className="kp-adv-alt-name">
                      {isHi ? crop.nameHi : crop.nameEn}
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      {isHi ? `अनुमानित उपज: ${crop.benchmarkYieldQuintalPerAcre} क्वि/एकड़` : `Est. Yield: ${crop.benchmarkYieldQuintalPerAcre} q/acre`}
                    </span>
                  </div>
                  <span className="kp-adv-tag-score">
                    {crop.score}% {isHi ? 'अनुकूल' : 'Match'}
                  </span>
                </div>

                {/* Chips */}
                <div className="kp-adv-alt-chips">
                  <span className="kp-adv-chip">
                    ⏱️ {crop.minDays} - {crop.maxDays} {isHi ? 'दिन' : 'days'}
                  </span>
                  <span className="kp-adv-chip">
                    💧 {crop.minWaterLevel.replace('_', ' ')}
                  </span>
                  {crop.nitrogenFixationKgPerHa && crop.nitrogenFixationKgPerHa !== 'None' && (
                    <span className="kp-adv-chip kp-adv-chip-nitrogen">
                      🌱 +{crop.nitrogenFixationKgPerHa}
                    </span>
                  )}
                </div>

                {/* Duration fit */}
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, margin: '8px 0' }}>
                  ✓ {isHi ? crop.fitSummaryHi : crop.fitSummaryEn}
                </div>

                {/* Recommended Seed Varieties */}
                <div style={{ fontSize: '12.5px', color: '#334155', margin: '8px 0' }}>
                  <strong>{isHi ? 'प्रमाणित किस्में:' : 'Certified Varieties:'}</strong>{' '}
                  {crop.seedVarieties.join(', ')}
                </div>

                {/* Agronomic Benefit */}
                <div className="kp-adv-alt-box kp-adv-alt-benefit">
                  <strong>{isHi ? 'कृषि लाभ:' : 'Agronomic Benefit:'}</strong>{' '}
                  {isHi ? crop.benefitsHi : crop.benefitsEn}
                </div>

                {/* Cautions */}
                <div className="kp-adv-alt-box kp-adv-alt-caution">
                  <strong>{isHi ? 'सावधानी व सीमाएं:' : 'Key Risk / Caution:'}</strong>{' '}
                  {isHi ? crop.cautionsHi : crop.cautionsEn}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                {isHi ? 'स्थानीय KVK से बीज उपलब्धता की पुष्टि करें।' : 'Verify certified seed availability at local KVK.'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="kp-adv-empty-state">
          <Info size={40} className="kp-adv-empty-icon" />
          <h4 className="kp-adv-empty-title">
            {isHi ? 'इस विंडो में कोई फसल उपयुक्त नहीं पाई गई' : 'No Short-Duration Crop Fits This Specific Window'}
          </h4>
          <p className="kp-adv-empty-desc">
            {isHi
              ? `आपके द्वारा चुने गए ${params.availableDays} दिन, पानी या मिट्टी की स्थिति में कोई सुरक्षित फसल पूरी तरह फिट नहीं बैठती। दिन बढ़ाएं या हरी खाद (ढैंचा) जैसे कम जोखिम विकल्पों पर विचार करें।`
              : `None of our verified shortlist crops satisfy both your ${params.availableDays}-day timeframe and water/soil constraints safely. Consider expanding available days or adopting green manuring.`}
          </p>
        </div>
      )}

      {/* Excluded Crops Transparent Drawer */}
      {excludedCrops.length > 0 && (
        <div className="kp-adv-excluded-section">
          <button
            type="button"
            className="kp-adv-excluded-toggle"
            onClick={() => setShowExcluded(prev => !prev)}
            aria-expanded={showExcluded}
          >
            {showExcluded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>
              {isHi
                ? `पारदर्शिता: ${excludedCrops.length} फसलें जो आपके मापदंडों में शामिल नहीं हुईं (क्लिक करें)`
                : `Transparency: Why ${excludedCrops.length} candidate crops were excluded from this window (Click to inspect)`}
            </span>
          </button>

          {showExcluded && (
            <div className="kp-adv-excluded-list">
              {excludedCrops.map(item => (
                <div key={item.id} className="kp-adv-excluded-item">
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isHi ? item.nameHi : item.nameEn} ({isHi ? `न्यूनतम ${item.minDays} दिन चाहिए` : `Needs min ${item.minDays} days`})
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#991b1b', fontSize: '12.5px' }}>
                    {(isHi ? item.reasonsHi : item.reasonsEn).map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KVK Extension Officer Referral Card */}
      <div className="kp-adv-kvk-banner">
        <div className="kp-adv-kvk-icon">
          <PhoneCall size={24} />
        </div>
        <div className="kp-adv-kvk-text">
          <h4>
            {isHi
              ? 'कृषि विज्ञान केंद्र (KVK) एवं ब्लॉक विस्तार अधिकारी से संपर्क'
              : 'Direct Verification at Krishi Vigyan Kendra (KVK)'}
          </h4>
          <p>
            {isHi
              ? 'किसी भी नई अंतर-फसल की बुवाई से पहले अपने जिले के कृषि विज्ञान केंद्र या स्थानीय किसान कॉल सेंटर (1800-180-1551) पर संपर्क करें। वे आपके ब्लॉक के लिए अनुशंसित प्रमाणित बीज और उपयुक्त बुवाई तारीख की सटीक सलाह देंगे।'
              : 'Before procuring seeds for inter-season catch cropping, consult your district Krishi Vigyan Kendra (KVK) or call the Kisan Call Centre (Toll-Free 1800-180-1551). Scientists will confirm certified seed lot viability, seed treatment protocols, and exact pest resistance suited for your block.'}
          </p>
        </div>
      </div>
    </div>
  );
}
