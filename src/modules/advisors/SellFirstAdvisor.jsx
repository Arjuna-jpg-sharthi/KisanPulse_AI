import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Warehouse,
  Coins,
  Plus,
  Trash2,
  HelpCircle,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  CROP_PERISHABILITY_CATALOG,
  STORAGE_CONDITIONS,
  INITIAL_SAMPLE_STORED_CROPS
} from './advisorData';
import {
  rankStoredCrops,
  validateLotInput,
  getAdvisorStorage,
  setAdvisorStorage
} from './advisorUtils';
import './advisors.css';

/**
 * ============================================================================
 * SELL-FIRST ADVISOR COMPONENT
 * ============================================================================
 * Helps farmers determine which harvested crop lot to sell first based on
 * physiological perishability, storage condition, days in storage, and active
 * buyer offers.
 *
 * PROPS:
 * @param {string} [language='en'] - 'en' | 'hi' (Bilingual interface)
 * @param {boolean} [isOffline=false] - Connection state indicator
 * @param {Function} [onNavigate] - Optional navigation router callback
 * @param {Array} [initialLots] - Optional pre-loaded crop lots array
 */
export default function SellFirstAdvisor({
  language = 'en',
  isOffline = false,
  onNavigate,
  initialLots = null
}) {
  const isHi = language === 'hi';

  // State: List of stored crop lots
  const [lots, setLots] = useState(() => {
    if (initialLots && Array.isArray(initialLots) && initialLots.length > 0) {
      return initialLots;
    }
    const saved = getAdvisorStorage('stored_crop_lots', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_SAMPLE_STORED_CROPS;
  });

  // State: Form modal / drawer for adding a new lot
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSampleLoaded, setIsSampleLoaded] = useState(() => {
    const saved = getAdvisorStorage('stored_crop_lots', null);
    return !saved || saved.length === 0;
  });

  // New lot form state
  const defaultNewLot = {
    cropId: 'tomato',
    cropNameCustom: '',
    perishability: 'medium',
    quantity: '',
    quantityUnit: 'Quintals',
    harvestDate: new Date().toISOString().split('T')[0],
    storageCondition: 'ambient_shed',
    customShelfLifeDays: '',
    hasBuyerOffer: false,
    buyerName: '',
    offeredPrice: '',
    offerExpiresInDays: '',
    storageNotes: ''
  };

  const [formState, setFormState] = useState(defaultNewLot);
  const [formErrors, setFormErrors] = useState({});

  // Sync to local storage
  useEffect(() => {
    setAdvisorStorage('stored_crop_lots', lots);
  }, [lots]);

  // Evaluate & Rank Lots
  const { rankedLots, explanations } = useMemo(() => {
    return rankStoredCrops(lots);
  }, [lots]);

  // Form Field Change Handler
  const handleFormFieldChange = (field, value) => {
    setFormState(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set perishability class if catalog crop is selected
      if (field === 'cropId') {
        const cat = CROP_PERISHABILITY_CATALOG.find(c => c.id === value);
        if (cat) {
          updated.perishability = cat.perishability;
        }
      }
      return updated;
    });

    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Submit New Lot
  const handleAddLotSubmit = (e) => {
    e.preventDefault();
    const validation = validateLotInput(formState);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const newLot = {
      ...formState,
      id: `lot-${Date.now()}`
    };

    setLots(prev => [...prev, newLot]);
    setFormState(defaultNewLot);
    setFormErrors({});
    setShowAddForm(false);
    setIsSampleLoaded(false);
  };

  // Remove Lot
  const handleRemoveLot = (lotId) => {
    setLots(prev => prev.filter(l => l.id !== lotId));
  };

  // Load Benchmark Demo
  const handleLoadBenchmark = () => {
    setLots(INITIAL_SAMPLE_STORED_CROPS);
    setIsSampleLoaded(true);
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm(isHi ? 'क्या आप सभी फसलों को हटाना चाहते हैं?' : 'Clear all stored crop lots from this session?')) {
      setLots([]);
      setIsSampleLoaded(false);
    }
  };

  return (
    <div className="kp-adv-wrapper">
      {/* Module Title Header */}
      <div className="kp-adv-header">
        <div className="kp-adv-title-row">
          <h2 className="kp-adv-title">
            <Clock size={28} color="#15803d" />
            {isHi ? 'फसल बिक्री प्राथमिकता सलाहकार' : '“Which Crop Should I Sell First?” Advisor'}
          </h2>
          <span className="kp-adv-badge-ai">
            <Sparkles size={14} />
            {isHi ? 'नियम-आधारित शेल्फ-लाइफ विश्लेषण' : 'Agronomic Shelf-Life Engine'}
          </span>
        </div>
        <p className="kp-adv-subtitle">
          {isHi
            ? 'अपनी भंडारित फसलों का विवरण दर्ज करें। हमारा सिस्टम शेल्फ-लाइफ, फसल संवेदनशीलता और खरीदार प्रस्तावों के आधार पर बताएगा कि किस फसल को पहले बेचना चाहिए।'
            : 'Enter your stored crop batches. Our decision engine ranks urgency based on biological perishability, storage conditions, elapsed storage days, and expiring buyer offers.'}
        </p>
      </div>

      {/* Real-time Price Momentum Unavailable Notice (Strict Integrity Rule) */}
      <div className="kp-adv-notice-banner kp-adv-notice-info" role="status">
        <ShieldAlert size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>
            {isHi
              ? 'डेटा अखंडता सूचना: लाइव मूल्य रुझान अनुपलब्ध'
              : 'Data Integrity Notice: Real-Time Price Momentum Unavailable'}
          </strong>
          <span>
            {isHi
              ? 'वर्तमान में कोई सक्रिय लाइव मंडी टिकर कनेक्ट नहीं है। इसलिए यह प्राथमिकता स्कोर केवल जैविक शेल्फ-लाइफ, भंडारण स्थिति और आपके द्वारा दर्ज किए गए खरीदार प्रस्ताव पर आधारित है। हम कोई काल्पनिक मूल्य अनुमान नहीं लगाते।'
              : 'No live Agmarknet / e-NAM ticker is currently connected. Consequently, urgency is derived strictly from verified crop perishability, storage age, and entered buyer offers. We do not synthesize speculative price trends or fake market demands.'}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="kp-adv-action-bar">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="kp-adv-btn kp-adv-btn-primary"
            onClick={() => setShowAddForm(prev => !prev)}
            aria-expanded={showAddForm}
          >
            <Plus size={16} />
            {showAddForm
              ? (isHi ? 'फॉर्म बंद करें' : 'Close Form')
              : (isHi ? 'नई भंडारित फसल जोड़ें' : 'Add Stored Crop Lot')}
          </button>

          <button
            type="button"
            className="kp-adv-btn kp-adv-btn-secondary"
            onClick={handleLoadBenchmark}
            title={isHi ? 'नमूना डेटा लोड करें' : 'Load realistic ICAR benchmark lot sample'}
          >
            <Layers size={16} />
            {isHi ? 'नमूना फार्म डेटा लोड करें' : 'Load Benchmark Sample'}
          </button>

          {lots.length > 0 && (
            <button
              type="button"
              className="kp-adv-btn kp-adv-btn-danger-outline"
              onClick={handleClearAll}
            >
              <Trash2 size={14} />
              {isHi ? 'सभी हटाएं' : 'Clear All'}
            </button>
          )}
        </div>

        {isSampleLoaded && (
          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
            ✓ {isHi ? 'मानक परीक्षण डेटा लोड है' : 'Demonstration benchmark lots loaded'}
          </span>
        )}
      </div>

      {/* Add Stored Crop Lot Form */}
      {showAddForm && (
        <div className="kp-adv-card" style={{ border: '2px solid #86efac' }}>
          <div className="kp-adv-card-header">
            <h3 className="kp-adv-card-title">
              {isHi ? 'भंडारित फसल विवरण दर्ज करें' : 'Enter Stored Crop Lot Details'}
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              * {isHi ? 'अनिवार्य फ़ील्ड' : 'Mandatory fields'}
            </span>
          </div>

          <form onSubmit={handleAddLotSubmit}>
            <div className="kp-adv-grid-3">
              {/* Crop Selection */}
              <div className="kp-adv-field">
                <label className="kp-adv-label" htmlFor="adv-crop-select">
                  {isHi ? 'फसल चुनें *' : 'Select Crop *'}
                </label>
                <select
                  id="adv-crop-select"
                  className={`kp-adv-select ${formErrors.crop ? 'has-error' : ''}`}
                  value={formState.cropId}
                  onChange={(e) => handleFormFieldChange('cropId', e.target.value)}
                >
                  {CROP_PERISHABILITY_CATALOG.map(crop => (
                    <option key={crop.id} value={crop.id}>
                      {isHi ? crop.nameHi : crop.nameEn} ({crop.perishability.toUpperCase()})
                    </option>
                  ))}
                  <option value="custom">{isHi ? 'अन्य (कस्टम फसल)' : 'Other / Custom Crop'}</option>
                </select>
                {formErrors.crop && <span className="kp-adv-error-text">{formErrors.crop}</span>}
              </div>

              {/* Custom Crop Name if selected */}
              {formState.cropId === 'custom' && (
                <div className="kp-adv-field">
                  <label className="kp-adv-label" htmlFor="adv-custom-crop">
                    {isHi ? 'फसल का नाम *' : 'Custom Crop Name *'}
                  </label>
                  <input
                    id="adv-custom-crop"
                    type="text"
                    className="kp-adv-input"
                    placeholder={isHi ? 'उदा. खीरा / ककड़ी' : 'e.g. Cucumber'}
                    value={formState.cropNameCustom}
                    onChange={(e) => handleFormFieldChange('cropNameCustom', e.target.value)}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="kp-adv-field">
                <label className="kp-adv-label" htmlFor="adv-quantity">
                  {isHi ? 'मात्रा (क्विंटल) *' : 'Quantity (Quintals) *'}
                </label>
                <input
                  id="adv-quantity"
                  type="number"
                  min="0.1"
                  step="any"
                  className={`kp-adv-input ${formErrors.quantity ? 'has-error' : ''}`}
                  placeholder="50"
                  value={formState.quantity}
                  onChange={(e) => handleFormFieldChange('quantity', e.target.value)}
                />
                {formErrors.quantity && <span className="kp-adv-error-text">{formErrors.quantity}</span>}
              </div>

              {/* Harvest Date */}
              <div className="kp-adv-field">
                <label className="kp-adv-label" htmlFor="adv-harvest-date">
                  {isHi ? 'कटाई की तारीख (या भंडारण शुरू) *' : 'Harvest Date / Storage Start *'}
                </label>
                <input
                  id="adv-harvest-date"
                  type="date"
                  className={`kp-adv-input ${formErrors.harvestDate ? 'has-error' : ''}`}
                  value={formState.harvestDate}
                  onChange={(e) => handleFormFieldChange('harvestDate', e.target.value)}
                />
                {formErrors.harvestDate && <span className="kp-adv-error-text">{formErrors.harvestDate}</span>}
                <span className="kp-adv-help-text">
                  {isHi ? 'इससे भंडारण के दिन गिने जाते हैं' : 'Used to compute storage duration'}
                </span>
              </div>
            </div>

            <div className="kp-adv-grid-2" style={{ marginTop: '16px' }}>
              {/* Storage Condition */}
              <div className="kp-adv-field">
                <label className="kp-adv-label" htmlFor="adv-storage-condition">
                  {isHi ? 'भंडारण की स्थिति *' : 'Storage Condition *'}
                </label>
                <select
                  id="adv-storage-condition"
                  className="kp-adv-select"
                  value={formState.storageCondition}
                  onChange={(e) => handleFormFieldChange('storageCondition', e.target.value)}
                >
                  {STORAGE_CONDITIONS.map(cond => (
                    <option key={cond.id} value={cond.id}>
                      {isHi ? cond.labelHi : cond.labelEn}
                    </option>
                  ))}
                </select>
                <span className="kp-adv-help-text">
                  {STORAGE_CONDITIONS.find(c => c.id === formState.storageCondition)?.[isHi ? 'descHi' : 'descEn']}
                </span>
              </div>

              {/* Custom Shelf Life (Optional) */}
              <div className="kp-adv-field">
                <label className="kp-adv-label" htmlFor="adv-custom-shelflife">
                  {isHi ? 'अनुमानित शेल्फ-लाइफ दिन (वैकल्पिक)' : 'Estimated Shelf-Life in Days (Optional Override)'}
                </label>
                <input
                  id="adv-custom-shelflife"
                  type="number"
                  min="1"
                  className={`kp-adv-input ${formErrors.customShelfLifeDays ? 'has-error' : ''}`}
                  placeholder={isHi ? 'खाली छोड़ें यदि मानक वैज्ञानिक दर चाहिए' : 'Leave blank for ICAR baseline standard'}
                  value={formState.customShelfLifeDays}
                  onChange={(e) => handleFormFieldChange('customShelfLifeDays', e.target.value)}
                />
                {formErrors.customShelfLifeDays && (
                  <span className="kp-adv-error-text">{formErrors.customShelfLifeDays}</span>
                )}
                <span className="kp-adv-help-text">
                  {isHi ? 'यदि आपको अपनी विशेष किस्म का सटीक शेल्फ-लाइफ पता है' : 'Overrides default scientific baseline if specified'}
                </span>
              </div>
            </div>

            {/* Optional Buyer Offer Section */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#854d0e' }}>
                <input
                  type="checkbox"
                  checked={formState.hasBuyerOffer}
                  onChange={(e) => handleFormFieldChange('hasBuyerOffer', e.target.checked)}
                />
                {isHi ? 'क्या किसी खरीदार का सक्रिय प्रस्ताव मिला है?' : 'Do you have an active offer from a buyer / merchant? (Optional)'}
              </label>

              {formState.hasBuyerOffer && (
                <div className="kp-adv-grid-3" style={{ marginTop: '14px' }}>
                  <div className="kp-adv-field">
                    <label className="kp-adv-label" htmlFor="adv-buyer-name">
                      {isHi ? 'खरीदार का नाम / कंपनी' : 'Buyer Name / Organization'}
                    </label>
                    <input
                      id="adv-buyer-name"
                      type="text"
                      className="kp-adv-input"
                      placeholder={isHi ? 'उदा. शर्मा ट्रेडिंग' : 'e.g. Local Agro Mill'}
                      value={formState.buyerName}
                      onChange={(e) => handleFormFieldChange('buyerName', e.target.value)}
                    />
                  </div>

                  <div className="kp-adv-field">
                    <label className="kp-adv-label" htmlFor="adv-offer-price">
                      {isHi ? 'प्रस्तावित दर (₹/क्विंटल)' : 'Offered Price (₹ / Quintal)'}
                    </label>
                    <input
                      id="adv-offer-price"
                      type="number"
                      min="0"
                      className="kp-adv-input"
                      placeholder="2450"
                      value={formState.offeredPrice}
                      onChange={(e) => handleFormFieldChange('offeredPrice', e.target.value)}
                    />
                  </div>

                  <div className="kp-adv-field">
                    <label className="kp-adv-label" htmlFor="adv-offer-validity">
                      {isHi ? 'प्रस्ताव कितने दिन में समाप्त होगा?' : 'Offer Expires in (Days)'}
                    </label>
                    <input
                      id="adv-offer-validity"
                      type="number"
                      min="1"
                      className="kp-adv-input"
                      placeholder="3"
                      value={formState.offerExpiresInDays}
                      onChange={(e) => handleFormFieldChange('offerExpiresInDays', e.target.value)}
                    />
                    <span className="kp-adv-help-text">
                      {isHi ? 'निकटतम एक्सपायरी वाले सौदे प्राथमिकता बढ़ाते हैं' : 'Expiring offers increase liquidity urgency'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="kp-adv-btn kp-adv-btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="kp-adv-btn kp-adv-btn-primary"
              >
                {isHi ? 'फसल लॉट जोड़ें और विश्लेषण करें' : 'Save Lot & Rank'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {rankedLots.length === 0 && (
        <div className="kp-adv-empty-state">
          <Warehouse size={48} className="kp-adv-empty-icon" />
          <h3 className="kp-adv-empty-title">
            {isHi ? 'कोई भंडारित फसल दर्ज नहीं है' : 'No Stored Crop Lots Recorded'}
          </h3>
          <p className="kp-adv-empty-desc">
            {isHi
              ? 'अपनी फसलों को जोड़ें ताकि शेल्फ-लाइफ और भंडारण जोखिम के आधार पर यह जाना जा सके कि किसे पहले बेचना चाहिए।'
              : 'Add your harvested lots or click "Load Benchmark Sample" to immediately test drive the sell-first ranking engine.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              className="kp-adv-btn kp-adv-btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              {isHi ? 'पहली फसल जोड़ें' : 'Add First Crop Lot'}
            </button>
            <button
              type="button"
              className="kp-adv-btn kp-adv-btn-secondary"
              onClick={handleLoadBenchmark}
            >
              <Layers size={16} />
              {isHi ? 'नमूना डेटा लोड करें' : 'Load Benchmark Sample'}
            </button>
          </div>
        </div>
      )}

      {/* Ranked Crop Lots Showcase */}
      {rankedLots.length > 0 && (
        <div className="kp-adv-rankings-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {isHi
                ? `प्राथमिकता क्रम (${rankedLots.length} फसलें विश्लेषित)`
                : `Sell-First Priority Order (${rankedLots.length} Lots Evaluated)`}
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {isHi ? 'उच्च स्कोर = पहले बेचना आवश्यक' : 'Rank 1 = Highest Urgency to Sell'}
            </span>
          </div>

          {rankedLots.map((lot) => {
            const rankClass =
              lot.rank === 1
                ? 'kp-adv-rank-1'
                : lot.rank === 2
                ? 'kp-adv-rank-2'
                : lot.rank === 3
                ? 'kp-adv-rank-3'
                : 'kp-adv-rank-other';

            return (
              <div
                key={lot.lotId}
                className={`kp-adv-lot-card ${lot.urgencyLevel}`}
              >
                {/* Header Row */}
                <div className="kp-adv-lot-header">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div className={`kp-adv-rank-pill ${rankClass}`} title={`Rank ${lot.rank}`}>
                      #{lot.rank}
                    </div>

                    <div>
                      <div className="kp-adv-crop-name">
                        {isHi ? lot.cropNameHi : lot.cropNameEn}
                      </div>
                      <div className="kp-adv-crop-meta">
                        <span>
                          <strong>{lot.quantity}</strong> {lot.quantityUnit}
                        </span>
                        <span>•</span>
                        <span>
                          {isHi ? 'भंडार:' : 'Storage:'}{' '}
                          <strong>{isHi ? lot.storageConditionLabelHi : lot.storageConditionLabelEn}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {isHi ? 'कटाई:' : 'Harvest:'}{' '}
                          {lot.harvestDate || (isHi ? 'अज्ञात' : 'Unknown')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className="kp-adv-urgency-badge"
                      style={{
                        backgroundColor: `${lot.urgencyColor}18`,
                        color: lot.urgencyColor,
                        border: `1.5px solid ${lot.urgencyColor}44`
                      }}
                    >
                      {lot.urgencyLevel === 'critical' ? (
                        <AlertTriangle size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {isHi ? lot.urgencyLabelHi : lot.urgencyLabelEn}
                    </span>

                    <button
                      type="button"
                      className="kp-adv-btn-danger-outline"
                      onClick={() => handleRemoveLot(lot.lotId)}
                      title={isHi ? 'इस लॉट को हटाएं' : 'Remove this crop lot'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Urgency Meter Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: '#475569' }}>
                    {isHi ? 'जोखिम स्कोर:' : 'Urgency Index:'}{' '}
                    <strong style={{ color: lot.urgencyColor }}>{lot.urgencyScore} / 100</strong>
                  </span>
                  <span style={{ color: '#64748b' }}>
                    {isHi
                      ? `${lot.shelfLifeUsedPct}% शेल्फ-लाइफ समाप्त`
                      : `${lot.shelfLifeUsedPct}% Shelf-Life Expended`}
                  </span>
                </div>

                <div className="kp-adv-meter-wrapper">
                  <div
                    className="kp-adv-meter-fill"
                    style={{
                      width: `${Math.min(100, lot.shelfLifeUsedPct)}%`,
                      backgroundColor: lot.urgencyColor
                    }}
                  />
                </div>

                {/* Key Metrics Stats Row */}
                <div className="kp-adv-stats-row">
                  <div className="kp-adv-stat-box">
                    <span className="kp-adv-stat-label">
                      {isHi ? 'भंडारण के दिन' : 'Days in Storage'}
                    </span>
                    <span className="kp-adv-stat-val">
                      {lot.daysInStorage} {isHi ? 'दिन' : 'days'}
                    </span>
                  </div>

                  <div className="kp-adv-stat-box">
                    <span className="kp-adv-stat-label">
                      {isHi ? 'सुरक्षित सीमा' : 'Safe Horizon'}
                    </span>
                    <span className="kp-adv-stat-val">
                      ~{lot.safeShelfLife} {isHi ? 'दिन' : 'days'}
                    </span>
                  </div>

                  <div className="kp-adv-stat-box">
                    <span className="kp-adv-stat-label">
                      {isHi ? 'शेष सुरक्षित दिन' : 'Estimated Days Left'}
                    </span>
                    <span
                      className="kp-adv-stat-val"
                      style={{ color: lot.remainingDays <= 3 ? '#dc2626' : '#1e293b' }}
                    >
                      {lot.remainingDays <= 0
                        ? (isHi ? '0 (समाप्त)' : '0 (Expired)')
                        : `~${lot.remainingDays} ${isHi ? 'दिन' : 'days'}`}
                    </span>
                  </div>

                  <div className="kp-adv-stat-box">
                    <span className="kp-adv-stat-label">
                      {isHi ? 'फसल संवेदनशीलता' : 'Perishability'}
                    </span>
                    <span className="kp-adv-stat-val" style={{ textTransform: 'capitalize' }}>
                      {lot.perishability}
                    </span>
                  </div>
                </div>

                {/* Buyer Offer Banner if present */}
                {lot.hasBuyerOffer && lot.offeredPrice && (
                  <div className="kp-adv-offer-strip">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Coins size={16} />
                      <span>
                        <strong>{lot.buyerName || (isHi ? 'सक्रिय खरीदार' : 'Buyer')}</strong>:{' '}
                        ₹{lot.offeredPrice}/q
                        {lot.offerExpiresInDays && (
                          <span style={{ marginLeft: 6, color: '#b45309' }}>
                            ({isHi ? `वैधता: ${lot.offerExpiresInDays} दिन शेष` : `Expires in ${lot.offerExpiresInDays}d`})
                          </span>
                        )}
                      </span>
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {isHi ? 'समीक्षा: प्रस्ताव पर विचार करें' : 'Decision Factor: Active Liquidity'}
                    </span>
                  </div>
                )}

                {/* Transparent Why This Rank Explanation */}
                <div className="kp-adv-reasons-title">
                  {isHi ? 'यह प्राथमिकता क्यों दी गई? (पारदर्शी कारण)' : 'Why This Priority? (Transparent Agronomic Rationale)'}
                </div>
                <ul className="kp-adv-reasons-list">
                  {(isHi ? lot.reasonsHi : lot.reasonsEn).map((reason, idx) => (
                    <li key={idx} className="kp-adv-reason-item">
                      <CheckCircle2 size={16} color={lot.urgencyColor} />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Pairwise Explanations Box (Why Rank #1 before Rank #2) */}
          {explanations.length > 0 && (
            <div className="kp-adv-comparison-card">
              <div className="kp-adv-comparison-title">
                <Layers size={18} />
                {isHi ? 'रैंक तुलना विश्लेषण: एक के बाद दूसरी क्यों?' : 'Pairwise Comparative Ranking Explanations'}
              </div>
              <div>
                {explanations.map((exp, idx) => (
                  <div key={idx} className="kp-adv-comp-item">
                    <strong>
                      {exp.higherName} <ArrowRight size={13} style={{ display: 'inline', margin: '0 4px' }} /> {exp.lowerName}:
                    </strong>{' '}
                    {isHi ? exp.textHi : exp.textEn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
