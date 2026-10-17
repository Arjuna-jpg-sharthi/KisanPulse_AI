import React, { useState, useEffect, useMemo } from 'react';
import './farming.css';
import {
  CROPS_CATALOG,
  INITIAL_SAMPLE_MARKETS,
  COMMON_SYMPTOMS,
  SAMPLE_WEATHER_HUBS
} from './farmingData';
import {
  validateMarketInputs,
  evaluateAndRankMarkets,
  explainMarketRankings,
  formatCurrency,
  getIrrigationGuidance,
  compressImageFile,
  getLocalItem,
  setLocalItem
} from './farmingUtils';

export default function FarmingModule({
  language = 'en',
  isOffline = false,
  isOnline = true,
  t,
  navigate
}) {
  const offlineActive = isOffline || !isOnline;
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState('mandi'); // 'mandi' | 'health' | 'irrigation' | 'weather'

  // ==========================================
  // PART A: SMART MANDI & PROFIT ENGINE STATE
  // ==========================================
  const [selectedCropId, setSelectedCropId] = useState('wheat');
  const [customCropName, setCustomCropName] = useState('');
  const [quantity, setQuantity] = useState(50); // Quintals
  const [markets, setMarkets] = useState(INITIAL_SAMPLE_MARKETS);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [buyerDraftTargetMarket, setBuyerDraftTargetMarket] = useState(null);
  const [buyerNotes, setBuyerNotes] = useState('');
  const [savedDrafts, setSavedDrafts] = useState(() => getLocalItem('market_drafts', []));
  const [showDraftsListModal, setShowDraftsListModal] = useState(false);

  // Active crop object
  const currentCrop = useMemo(() => {
    return CROPS_CATALOG.find(c => c.id === selectedCropId) || {
      id: 'custom',
      name: customCropName || 'Custom Crop',
      stages: []
    };
  }, [selectedCropId, customCropName]);

  // Market validation and ranking
  const validation = useMemo(() => {
    return validateMarketInputs(quantity, markets);
  }, [quantity, markets]);

  const rankedMarkets = useMemo(() => {
    if (!validation.isValid && (!quantity || quantity <= 0)) {
      return [];
    }
    return evaluateAndRankMarkets(quantity, markets);
  }, [quantity, markets, validation.isValid]);

  const marketExplanation = useMemo(() => {
    if (rankedMarkets.length < 2) return null;
    return explainMarketRankings(rankedMarkets, quantity);
  }, [rankedMarkets, quantity]);

  // Handlers for market inputs
  const handleMarketChange = (id, field, value) => {
    setMarkets(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMarket = () => {
    const newId = `market-${Date.now()}`;
    const newMarket = {
      id: newId,
      name: `Mandi ${markets.length + 1}`,
      sellingPrice: currentCrop.defaultPrice || 2400,
      distanceKm: 30,
      transportCost: 1500,
      loadingCost: 400,
      mandiFee: 300,
      otherCosts: 100,
      verified: false,
      dataSource: 'Farmer Entry / Unverified',
      updateDate: 'Today'
    };
    setMarkets(prev => [...prev, newMarket]);
  };

  const handleRemoveMarket = (id) => {
    if (markets.length <= 2) {
      alert('At least two markets are required for profit comparison.');
      return;
    }
    setMarkets(prev => prev.filter(m => m.id !== id));
  };

  // Buyer enquiry draft saving
  const handleOpenBuyerModal = (market) => {
    setBuyerDraftTargetMarket(market);
    setBuyerNotes(`Seeking direct buyer offers for ${quantity} quintals of ${currentCrop.name}. Preferred dispatch from farm-gate or delivery to ${market.name}.`);
    setShowBuyerModal(true);
  };

  const handleSaveBuyerDraft = () => {
    if (!buyerDraftTargetMarket) return;
    const newDraft = {
      id: `draft-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      cropName: currentCrop.name,
      quantityQuintals: quantity,
      targetMarket: buyerDraftTargetMarket.name,
      benchmarkRate: buyerDraftTargetMarket.sellingPrice,
      notes: buyerNotes,
      status: 'Local Draft (Not Sent)'
    };
    const updated = [newDraft, ...savedDrafts];
    setSavedDrafts(updated);
    setLocalItem('market_drafts', updated);
    setShowBuyerModal(false);
    alert('Buyer enquiry draft saved locally on your device. Note: Drafts are stored offline and not transmitted to external buyers.');
  };

  const handleDeleteDraft = (draftId) => {
    const updated = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updated);
    setLocalItem('market_drafts', updated);
  };

  // ==========================================
  // PART B: CROP HEALTH REPORTING STATE
  // ==========================================
  const [healthCropId, setHealthCropId] = useState('wheat');
  const [healthSymptoms, setHealthSymptoms] = useState('');
  const [healthLocation, setHealthLocation] = useState('');
  const [healthDate, setHealthDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [healthPhotoData, setHealthPhotoData] = useState(null);
  const [healthPhotoCompressing, setHealthPhotoCompressing] = useState(false);
  const [savedHealthReports, setSavedHealthReports] = useState(() => getLocalItem('crop_reports', []));
  const [viewingReport, setViewingReport] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setHealthPhotoCompressing(true);
      const compressed = await compressImageFile(file, 800, 800, 0.7);
      setHealthPhotoData(compressed);
    } catch (err) {
      alert(err.message || 'Error processing photo. Please try another image.');
    } finally {
      setHealthPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setHealthPhotoData(null);
  };

  const handleAddSymptomChip = (chip) => {
    if (!healthSymptoms.includes(chip)) {
      setHealthSymptoms(prev => (prev ? `${prev}, ${chip}` : chip));
    }
  };

  const handleSaveHealthReport = (e) => {
    e.preventDefault();
    if (!healthSymptoms.trim()) {
      alert('Please describe observed symptoms before saving report.');
      return;
    }

    const cropObj = CROPS_CATALOG.find(c => c.id === healthCropId) || { name: healthCropId };
    const newReport = {
      id: `report-${Date.now()}`,
      cropName: cropObj.name,
      symptoms: healthSymptoms.trim(),
      date: healthDate,
      location: healthLocation.trim() || 'Unspecified Field',
      photo: healthPhotoData,
      savedAt: new Date().toLocaleString()
    };

    const updated = [newReport, ...savedHealthReports];
    setSavedHealthReports(updated);
    setLocalItem('crop_reports', updated);

    // Reset inputs
    setHealthSymptoms('');
    setHealthPhotoData(null);
    setHealthLocation('');
    alert('Crop health observation report saved locally to your device history.');
  };

  const handleDeleteHealthReport = (reportId) => {
    const updated = savedHealthReports.filter(r => r.id !== reportId);
    setSavedHealthReports(updated);
    setLocalItem('crop_reports', updated);
    if (viewingReport?.id === reportId) {
      setViewingReport(null);
    }
  };

  // ==========================================
  // PART C: BASIC IRRIGATION GUIDANCE STATE
  // ==========================================
  const [irrigCropId, setIrrigCropId] = useState('wheat');
  const irrigCrop = useMemo(() => {
    return CROPS_CATALOG.find(c => c.id === irrigCropId) || CROPS_CATALOG[0];
  }, [irrigCropId]);

  const [irrigStageId, setIrrigStageId] = useState(irrigCrop.stages[0]?.id || '');
  const [irrigRainfall, setIrrigRainfall] = useState('none');
  const [irrigSoilMoisture, setIrrigSoilMoisture] = useState('moderate');
  const [irrigDaysAgo, setIrrigDaysAgo] = useState(5);

  // Update stage when crop changes
  useEffect(() => {
    if (irrigCrop.stages && irrigCrop.stages.length > 0) {
      setIrrigStageId(irrigCrop.stages[0].id);
    }
  }, [irrigCrop]);

  const irrigationGuidance = useMemo(() => {
    return getIrrigationGuidance({
      crop: irrigCrop,
      stageId: irrigStageId,
      rainfall: irrigRainfall,
      soilMoisture: irrigSoilMoisture,
      daysSinceWatering: irrigDaysAgo
    });
  }, [irrigCrop, irrigStageId, irrigRainfall, irrigSoilMoisture, irrigDaysAgo]);

  // ==========================================
  // PART D: WEATHER PANEL STATE
  // ==========================================
  const [selectedHubId, setSelectedHubId] = useState('karnal');
  const [weatherData, setWeatherData] = useState(SAMPLE_WEATHER_HUBS[0]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherIsLive, setWeatherIsLive] = useState(false);
  const [weatherCacheDate, setWeatherCacheDate] = useState('Today, 14:30 IST');

  const selectedHub = useMemo(() => {
    return SAMPLE_WEATHER_HUBS.find(h => h.id === selectedHubId) || SAMPLE_WEATHER_HUBS[0];
  }, [selectedHubId]);

  // Weather fetcher: attempts live Open-Meteo, falls back gracefully to benchmark data
  useEffect(() => {
    let isCancelled = false;

    async function fetchWeather() {
      setWeatherLoading(true);

      // Check if browser is online
      if (!navigator.onLine) {
        if (!isCancelled) {
          setWeatherData(selectedHub);
          setWeatherIsLive(false);
          setWeatherCacheDate(selectedHub.updatedAt);
          setWeatherLoading(false);
        }
        return;
      }

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedHub.lat}&longitude=${selectedHub.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation_probability&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error('API response not ok');
        const json = await res.json();

        if (!isCancelled && json.current) {
          const temp = Math.round(json.current.temperature_2m);
          const humidity = Math.round(json.current.relative_humidity_2m);
          const wind = Math.round(json.current.wind_speed_10m);
          const precipProb = json.hourly?.precipitation_probability?.[0] || 0;

          let cond = 'Clear Sky';
          if (humidity > 70) cond = 'Humid & Overcast';
          else if (precipProb > 30) cond = 'Cloudy / Rain Chance';
          else if (temp > 32) cond = 'Hot & Sunny';

          let advisory = 'Normal operational conditions.';
          if (wind > 15) {
            advisory = 'High wind speed (> 15 km/h). Delay foliar pesticide/fungicide spraying to avoid chemical drift.';
          } else if (precipProb > 40) {
            advisory = 'High chance of rainfall. Hold off on nitrogen top-dressing and irrigation.';
          } else {
            advisory = 'Safe window for spraying, intercultural operations, and standard field work.';
          }

          setWeatherData({
            ...selectedHub,
            temp,
            humidity,
            windSpeedKm: wind,
            rainChancePct: precipProb,
            condition: cond,
            advisory,
            source: 'Live Open-Meteo Agromet API'
          });
          setWeatherIsLive(true);
          setWeatherCacheDate(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
        }
      } catch (err) {
        // Fallback to sample benchmark data without fabricated claims
        if (!isCancelled) {
          setWeatherData(selectedHub);
          setWeatherIsLive(false);
          setWeatherCacheDate(selectedHub.updatedAt);
        }
      } finally {
        if (!isCancelled) {
          setWeatherLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      isCancelled = true;
    };
  }, [selectedHubId, selectedHub]);

  return (
    <div className="farming-container">
      {/* Sub-Navigation Tabs */}
      <div className="farming-nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {navigate && (
            <button
              className="farming-btn farming-btn-outline farming-btn-sm"
              onClick={() => navigate('dashboard')}
              title={isHindi ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'}
            >
              ← {isHindi ? 'डैशबोर्ड' : 'Dashboard'}
            </button>
          )}

          <div className="farming-sub-tabs">
            <button
              className={`farming-sub-tab-btn ${activeTab === 'mandi' ? 'farming-active' : ''}`}
              onClick={() => setActiveTab('mandi')}
            >
              <span>⚖️</span> {isHindi ? 'मंडी लाभ इंजन' : 'Mandi Profit Engine'}
            </button>
            <button
              className={`farming-sub-tab-btn ${activeTab === 'health' ? 'farming-active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              <span>🩺</span> {isHindi ? 'फसल स्वास्थ्य' : 'Crop Health Log'}
            </button>
            <button
              className={`farming-sub-tab-btn ${activeTab === 'irrigation' ? 'farming-active' : ''}`}
              onClick={() => setActiveTab('irrigation')}
            >
              <span>💧</span> {isHindi ? 'सिंचाई गाइड' : 'Irrigation Guide'}
            </button>
            <button
              className={`farming-sub-tab-btn ${activeTab === 'weather' ? 'farming-active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <span>⛅</span> {isHindi ? 'मौसम एवं स्प्रे' : 'Weather & Spray'}
            </button>
          </div>
        </div>

        <div>
          <button
            className="farming-btn farming-btn-secondary farming-btn-sm"
            onClick={() => setShowDraftsListModal(true)}
            title="View saved buyer enquiry drafts"
          >
            📋 {isHindi ? 'सहेजे गए ड्राफ्ट' : 'Saved Drafts'} ({savedDrafts.length})
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {offlineActive && (
        <div className="farming-offline-alert">
          <span>📡</span>
          <div>
            <strong>{isHindi ? 'ऑफलाइन मोड सक्रिय:' : 'Offline Operation Mode:'}</strong>{' '}
            {isHindi
              ? 'गणनाएं, सिंचाई नियम और फसल स्वास्थ्य लॉग आपके उपकरण पर स्थानीय रूप से चल रहे हैं।'
              : 'Calculations, irrigation rules, and crop logs are running locally on your device. Previously loaded market benchmarks and weather data are served from local cache.'}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: SMART MANDI AND FARM PROFIT ENGINE (PART A)           */}
      {/* ============================================================ */}
      {activeTab === 'mandi' && (
        <div>
          {/* Farm Yield Configuration Card */}
          <div className="farming-card">
            <div className="farming-card-header">
              <div>
                <h2 className="farming-card-title">
                  <span>🌾</span> Smart Mandi & Farm Profit Engine
                </h2>
                <p className="farming-card-subtitle">
                  Calculate true in-hand profits across multiple mandis. Accounts for transit, handling, and market fees so you never lose money on deceptive high sticker prices.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="farming-badge farming-badge-illustrative">
                  Benchmark Sample Data Active
                </span>
                <span className="farming-badge farming-badge-neutral">
                  Formula: Net = Gross - All Costs
                </span>
              </div>
            </div>

            <div className="farming-grid-2">
              <div className="farming-form-group">
                <label className="farming-label">
                  Select Harvested Crop
                  <span className="farming-label-helper">(Includes MSP benchmark)</span>
                </label>
                <select
                  className="farming-select"
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                >
                  {CROPS_CATALOG.map(crop => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} (MSP: ₹{crop.msp2026}/q)
                    </option>
                  ))}
                  <option value="custom">Other / Custom Crop</option>
                </select>
                {selectedCropId === 'custom' && (
                  <input
                    type="text"
                    className="farming-input"
                    style={{ marginTop: '0.5rem' }}
                    placeholder="Enter crop name..."
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                  />
                )}
              </div>

              <div className="farming-form-group">
                <label className="farming-label">
                  Total Produce Quantity (Quintals)
                  <span className="farming-label-helper">(1 Quintal = 100 kg)</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  className={`farming-input ${validation.errors.quantity ? 'farming-input-error' : ''}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                />
                {validation.errors.quantity && (
                  <div className="farming-field-error">{validation.errors.quantity}</div>
                )}
              </div>
            </div>
          </div>

          {/* Markets Comparison Table / Cards */}
          <div className="farming-card">
            <div className="farming-card-header">
              <div>
                <h3 className="farming-card-title">
                  <span>⚖️</span> Compare Mandis & Market Channels ({markets.length} Options)
                </h3>
                <p className="farming-card-subtitle">
                  Edit rates and expenses below. Calculations update instantaneously.
                </p>
              </div>
              <button
                className="farming-btn farming-btn-outline farming-btn-sm"
                onClick={handleAddMarket}
              >
                + Add Another Mandi / Buyer
              </button>
            </div>

            {validation.errors.marketsGeneral && (
              <div className="farming-field-error" style={{ marginBottom: '1rem' }}>
                {validation.errors.marketsGeneral}
              </div>
            )}

            <div className="farming-grid-3">
              {rankedMarkets.map((market) => {
                const err = validation.errors[`market_${market.id}`] || {};
                const isWinner = market.rank === 1;

                return (
                  <div
                    key={market.id}
                    className={`farming-market-card ${isWinner ? 'farming-rank-1' : ''}`}
                  >
                    {isWinner && (
                      <div className="farming-rank-tag">
                        ⭐ #1 Best Net Profit
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isWinner ? '#166534' : '#6b7280' }}>
                        Rank #{market.rank}
                      </span>
                      {markets.length > 2 && (
                        <button
                          className="farming-btn farming-btn-danger farming-btn-sm"
                          onClick={() => handleRemoveMarket(market.id)}
                          title="Remove this market"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="farming-form-group">
                      <label className="farming-label">Mandi / Buyer Name</label>
                      <input
                        type="text"
                        className={`farming-input ${err.name ? 'farming-input-error' : ''}`}
                        value={market.name}
                        onChange={(e) => handleMarketChange(market.id, 'name', e.target.value)}
                      />
                      {err.name && <div className="farming-field-error">{err.name}</div>}
                    </div>

                    <div className="farming-form-group">
                      <label className="farming-label">Selling Price (₹ / Quintal)</label>
                      <input
                        type="number"
                        min="0"
                        className={`farming-input ${err.sellingPrice ? 'farming-input-error' : ''}`}
                        value={market.sellingPrice}
                        onChange={(e) => handleMarketChange(market.id, 'sellingPrice', e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      {err.sellingPrice && <div className="farming-field-error">{err.sellingPrice}</div>}
                    </div>

                    {/* Breakdown of editable costs */}
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                        Cost Breakdown (₹ Total for Batch)
                      </span>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Transport</label>
                          <input
                            type="number"
                            min="0"
                            className="farming-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={market.transportCost}
                            onChange={(e) => handleMarketChange(market.id, 'transportCost', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Loading / Labor</label>
                          <input
                            type="number"
                            min="0"
                            className="farming-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={market.loadingCost}
                            onChange={(e) => handleMarketChange(market.id, 'loadingCost', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Mandi Fee / Tax</label>
                          <input
                            type="number"
                            min="0"
                            className="farming-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={market.mandiFee}
                            onChange={(e) => handleMarketChange(market.id, 'mandiFee', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Weighing & Misc</label>
                          <input
                            type="number"
                            min="0"
                            className="farming-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={market.otherCosts}
                            onChange={(e) => handleMarketChange(market.id, 'otherCosts', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calculated Results for Market */}
                    <div className="farming-market-metrics">
                      <div className="farming-metric-box">
                        <div className="farming-metric-label">Gross Revenue</div>
                        <div className="farming-metric-value">{formatCurrency(market.grossRevenue)}</div>
                      </div>
                      <div className="farming-metric-box">
                        <div className="farming-metric-label">Total Costs</div>
                        <div className="farming-metric-value farming-text-cost">-{formatCurrency(market.totalCosts)}</div>
                      </div>
                      <div className="farming-metric-box" style={{ gridColumn: 'span 2', background: isWinner ? '#dcfce7' : '#f3f4f6' }}>
                        <div className="farming-metric-label" style={{ color: isWinner ? '#166534' : '#4b5563' }}>
                          Estimated In-Hand Net Proceeds
                        </div>
                        <div className={`farming-metric-value ${isWinner ? 'farming-text-success' : ''}`} style={{ fontSize: '1.25rem' }}>
                          {formatCurrency(market.netProceeds)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                          Net Realization: <strong>{formatCurrency(market.netProceedsPerQuintal)} / quintal</strong>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`farming-badge ${market.verified ? 'farming-badge-verified' : 'farming-badge-illustrative'}`}>
                        {market.verified ? '✓ Verified Source' : '⚠️ Illustrative Benchmark'}
                      </span>
                      <button
                        className="farming-btn farming-btn-outline farming-btn-sm"
                        onClick={() => handleOpenBuyerModal(market)}
                      >
                        Draft Enquiry
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why This Market Ranks Higher Explanation Engine */}
            {marketExplanation && (
              <div className="farming-explanation-box">
                <div className="farming-explanation-header">
                  <span>💡</span> {marketExplanation.title}
                </div>
                <div className="farming-explanation-summary">
                  {marketExplanation.summary}
                </div>
                <div className="farming-explanation-verdict">
                  {marketExplanation.verdict}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', opacity: 0.85 }}>
                  Key principle: {marketExplanation.ruleCheck}
                </div>
              </div>
            )}

            {/* SVG Comparison Chart */}
            {rankedMarkets.length >= 2 && (
              <div className="farming-chart-wrap">
                <div className="farming-chart-header">
                  <span>📊 Financial Breakdown Comparison (Gross vs Costs vs Net)</span>
                  <div className="farming-chart-legend">
                    <div className="farming-legend-item">
                      <div className="farming-legend-color" style={{ backgroundColor: '#2d6a4f' }} />
                      <span>Net Proceeds</span>
                    </div>
                    <div className="farming-legend-item">
                      <div className="farming-legend-color" style={{ backgroundColor: '#dc2626' }} />
                      <span>Total Costs</span>
                    </div>
                    <div className="farming-legend-item">
                      <div className="farming-legend-color" style={{ backgroundColor: '#0284c7' }} />
                      <span>Gross Revenue</span>
                    </div>
                  </div>
                </div>

                {/* Accessible pure SVG Horizontal Bar Chart */}
                <div style={{ overflowX: 'auto' }}>
                  <svg
                    className="farming-svg-chart"
                    viewBox={`0 0 650 ${rankedMarkets.length * 85 + 20}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {(() => {
                      const maxRevenue = Math.max(...rankedMarkets.map(m => Math.max(m.grossRevenue, 1)));
                      const chartWidth = 420;

                      return rankedMarkets.map((m, idx) => {
                        const yBase = idx * 85 + 15;
                        const grossW = Math.max(0, (m.grossRevenue / maxRevenue) * chartWidth);
                        const netW = Math.max(0, (Math.max(0, m.netProceeds) / maxRevenue) * chartWidth);
                        const costW = Math.max(0, (m.totalCosts / maxRevenue) * chartWidth);

                        return (
                          <g key={m.id}>
                            {/* Market Label */}
                            <text
                              x="10"
                              y={yBase + 12}
                              fontSize="12"
                              fontWeight="bold"
                              fill="#1f2937"
                            >
                              {m.name.length > 25 ? m.name.substring(0, 25) + '...' : m.name}
                            </text>
                            <text
                              x="10"
                              y={yBase + 28}
                              fontSize="10"
                              fill="#6b7280"
                            >
                              Rate: ₹{m.sellingPrice}/q | Costs: ₹{m.totalCosts}
                            </text>

                            {/* Gross Bar */}
                            <rect
                              x="200"
                              y={yBase}
                              width={grossW}
                              height="12"
                              rx="3"
                              fill="#0284c7"
                              opacity="0.75"
                            />
                            {/* Net Bar */}
                            <rect
                              x="200"
                              y={yBase + 16}
                              width={netW}
                              height="14"
                              rx="3"
                              fill="#2d6a4f"
                            />
                            {/* Cost Bar */}
                            <rect
                              x="200"
                              y={yBase + 34}
                              width={costW}
                              height="10"
                              rx="3"
                              fill="#dc2626"
                              opacity="0.85"
                            />

                            {/* In-hand amount label */}
                            <text
                              x={210 + netW}
                              y={yBase + 27}
                              fontSize="11"
                              fontWeight="bold"
                              fill="#1b4332"
                            >
                              ₹{m.netProceeds.toLocaleString('en-IN')}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Benchmark Transparency Disclaimer */}
            <div className="farming-disclaimer">
              <strong>Price & Cost Verification Policy:</strong> KisanPulse AI does not fabricate live market prices. Benchmark mandi prices and fees shown are indicative historical modal prices derived from Agmarknet / e-NAM benchmark datasets. Always confirm with the physical APMC auction yard or buyer before loading produce.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CROP HEALTH REPORTING (PART B)                        */}
      {/* ============================================================ */}
      {activeTab === 'health' && (
        <div>
          <div className="farming-card">
            <div className="farming-card-header">
              <div>
                <h2 className="farming-card-title">
                  <span>🩺</span> Crop Health & Symptom Observation Log
                </h2>
                <p className="farming-card-subtitle">
                  Record plant symptoms, photograph damage, and maintain a local crop health diary.
                </p>
              </div>
              <span className="farming-badge farming-badge-neutral">
                Local Device Storage Only
              </span>
            </div>

            {/* Diagnostic Honesty Notice */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderLeft: '4px solid #d97706',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: '#78350f',
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}>
              <strong>⚠️ Diagnostic Integrity Notice:</strong> KisanPulse AI does not claim automated disease diagnosis without an integrated, clinically tested physical diagnostic model. Visual symptoms (yellowing, spots, wilt) often mimic multiple fungal, viral, or nutrient deficiency causes. Always consult with your local Krishi Vigyan Kendra (KVK) for physical specimen lab verification.
            </div>

            <form onSubmit={handleSaveHealthReport}>
              <div className="farming-grid-2">
                <div className="farming-form-group">
                  <label className="farming-label">Crop Under Observation</label>
                  <select
                    className="farming-select"
                    value={healthCropId}
                    onChange={(e) => setHealthCropId(e.target.value)}
                  >
                    {CROPS_CATALOG.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="farming-form-group">
                  <label className="farming-label">Observation Date</label>
                  <input
                    type="date"
                    className="farming-input"
                    value={healthDate}
                    onChange={(e) => setHealthDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="farming-form-group">
                <label className="farming-label">
                  Field Location / Plot Description
                  <span className="farming-label-helper">(Optional: e.g. North Plot near tube-well)</span>
                </label>
                <input
                  type="text"
                  className="farming-input"
                  placeholder="e.g., Khasra 42/1, Riverbed side patch"
                  value={healthLocation}
                  onChange={(e) => setHealthLocation(e.target.value)}
                />
              </div>

              <div className="farming-form-group">
                <label className="farming-label">
                  Observed Symptoms & Plant Condition *
                </label>
                <textarea
                  className="farming-textarea"
                  rows="3"
                  placeholder="Describe leaf discoloration, wilting pattern, pest presence, soil wetness..."
                  value={healthSymptoms}
                  onChange={(e) => setHealthSymptoms(e.target.value)}
                />

                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                    Quick Symptom Tags (Click to append):
                  </span>
                  <div className="farming-tag-cloud">
                    {COMMON_SYMPTOMS.map((chip, i) => (
                      <button
                        type="button"
                        key={i}
                        className="farming-tag-chip"
                        onClick={() => handleAddSymptomChip(chip)}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div className="farming-form-group">
                <label className="farming-label">Crop Photo Attachment (Camera or File)</label>

                {healthPhotoData ? (
                  <div className="farming-photo-preview-container">
                    <img src={healthPhotoData} alt="Crop sample preview" className="farming-photo-img" />
                    <button
                      type="button"
                      className="farming-photo-remove-btn"
                      onClick={handleRemovePhoto}
                      title="Remove attached photo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="farming-photo-box">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#166534' }}>
                      {healthPhotoCompressing ? 'Compressing photo for local storage...' : 'Click or tap to capture / upload plant photo'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Photos are automatically compressed to ensure smooth offline storage on your device.
                    </div>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="submit" className="farming-btn farming-btn-primary">
                  💾 Save Crop Observation Report
                </button>
              </div>
            </form>
          </div>

          {/* Cautious Agronomic Next-Step Guidance */}
          <div className="farming-card">
            <h3 className="farming-card-title">
              <span>🛡️</span> Cautious Agronomic Next-Step Guidance
            </h3>
            <p className="farming-card-subtitle">
              Standard biosecurity and physical verification practices recommended before applying any chemical sprays.
            </p>

            <div className="farming-grid-3" style={{ marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  1. Physical Containment
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Do not walk through wet infected rows to prevent spreading spores. Disinfect pruning shears and sickle blades with 70% alcohol or bleach solution.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  2. Root & Underside Inspection
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Carefully turn leaves to check for spider mites or whitefly colonies. Inspect the crown zone at the soil interface for dark fungal girdling.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  3. Contact Local KVK Officer
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Pack 2 fresh plant specimens (showing boundary between healthy and affected tissue) in dry paper and take to your block agricultural extension center for free pathology testing.
                </p>
              </div>
            </div>
          </div>

          {/* Saved Reports History List */}
          <div className="farming-card">
            <h3 className="farming-card-title">
              <span>📋</span> Reopen Saved Crop Reports ({savedHealthReports.length})
            </h3>
            <p className="farming-card-subtitle">
              Previously saved records stored securely on this browser.
            </p>

            {savedHealthReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                No crop reports saved yet. Fill out the form above to record your first field observation.
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                {savedHealthReports.map(report => (
                  <div key={report.id} className="farming-history-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {report.photo ? (
                        <img
                          src={report.photo}
                          alt="Thumbnail"
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                          🌱
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#111827' }}>
                          {report.cropName} &bull; <span style={{ fontWeight: '400', fontSize: '0.8rem', color: '#6b7280' }}>{report.date}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                          📍 {report.location}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {report.symptoms}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="farming-btn farming-btn-outline farming-btn-sm"
                        onClick={() => setViewingReport(report)}
                      >
                        Reopen
                      </button>
                      <button
                        className="farming-btn farming-btn-danger farming-btn-sm"
                        onClick={() => handleDeleteHealthReport(report.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: BASIC IRRIGATION GUIDANCE (PART C)                    */}
      {/* ============================================================ */}
      {activeTab === 'irrigation' && (
        <div>
          <div className="farming-card">
            <div className="farming-card-header">
              <div>
                <h2 className="farming-card-title">
                  <span>💧</span> Transparent Rule-Based Irrigation Guidance
                </h2>
                <p className="farming-card-subtitle">
                  Agronomic moisture recommendations calibrated to growth stages and local rainfall indicators.
                </p>
              </div>
              <span className="farming-badge farming-badge-neutral">
                ICAR / FAO Agronomic Decision Tree
              </span>
            </div>

            {/* Hardware Limitations Disclaimer */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #0284c7',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: '#0c4a6e',
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}>
              <strong>📱 Device Sensor Clarification:</strong> Smartphones do NOT possess internal physical sensors capable of detecting subsurface soil moisture. Recommendations are based on your reported field conditions and crop physiology rules. We avoid unsupported pseudo-precise water volume claims (such as "apply 37.4 liters") in favor of actionable operational timing windows.
            </div>

            <div className="farming-grid-2">
              <div className="farming-form-group">
                <label className="farming-label">Select Crop</label>
                <select
                  className="farming-select"
                  value={irrigCropId}
                  onChange={(e) => setIrrigCropId(e.target.value)}
                >
                  {CROPS_CATALOG.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="farming-form-group">
                <label className="farming-label">Current Crop Growth Stage</label>
                <select
                  className="farming-select"
                  value={irrigStageId}
                  onChange={(e) => setIrrigStageId(e.target.value)}
                >
                  {irrigCrop.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label} {stage.criticalMoisture ? '⭐ (Critical Stage)' : ''}
                    </option>
                  ))}
                </select>
                {irrigationGuidance.stageInfo && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    ℹ️ {irrigationGuidance.stageInfo.desc}
                  </p>
                )}
              </div>

              <div className="farming-form-group">
                <label className="farming-label">Recent Rainfall in Last 48 Hours</label>
                <select
                  className="farming-select"
                  value={irrigRainfall}
                  onChange={(e) => setIrrigRainfall(e.target.value)}
                >
                  <option value="none">None (Dry weather)</option>
                  <option value="light">Light drizzle (1 to 10 mm)</option>
                  <option value="moderate">Moderate showers (10 to 25 mm)</option>
                  <option value="heavy">Heavy downpour (&gt; 25 mm)</option>
                </select>
              </div>

              <div className="farming-form-group">
                <label className="farming-label">
                  Manual Soil Moisture Hand-Feel Check
                  <span className="farming-label-helper">(15 cm root depth)</span>
                </label>
                <select
                  className="farming-select"
                  value={irrigSoilMoisture}
                  onChange={(e) => setIrrigSoilMoisture(e.target.value)}
                >
                  <option value="low">Dry / Cracking (Soil ball crumbles easily)</option>
                  <option value="moderate">Moist & Cool (Forms pliable ball, leaves stain)</option>
                  <option value="high">Saturated / Wet (Water glitters on surface)</option>
                </select>
              </div>

              <div className="farming-form-group">
                <label className="farming-label">Days Since Last Irrigation</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  className="farming-input"
                  value={irrigDaysAgo}
                  onChange={(e) => setIrrigDaysAgo(e.target.value === '' ? 0 : Number(e.target.value))}
                />
              </div>
            </div>

            {/* Output Guidance Card */}
            <div className={`farming-guidance-card farming-priority-${irrigationGuidance.urgency}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
                  Operational Recommendation
                </span>
                <span className="farming-badge" style={{
                  backgroundColor: irrigationGuidance.urgency === 'high' ? '#fee2e2' : '#dcfce7',
                  color: irrigationGuidance.urgency === 'high' ? '#991b1b' : '#166534'
                }}>
                  {irrigationGuidance.urgency === 'high' ? '⚠️ High Priority' : 'Normal / Low Priority'}
                </span>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827' }}>
                {irrigationGuidance.recommendation}
              </div>

              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#374151', marginBottom: '1rem' }}>
                {irrigationGuidance.rationale}
              </p>

              {/* Underlying Assumptions */}
              <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '0.35rem' }}>
                  Model Assumptions & Missing Variables:
                </span>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                  {irrigationGuidance.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: WEATHER PANEL (PART D)                                */}
      {/* ============================================================ */}
      {activeTab === 'weather' && (
        <div>
          <div className="farming-card">
            <div className="farming-card-header">
              <div>
                <h2 className="farming-card-title">
                  <span>⛅</span> Agricultural Weather & Spray Window
                </h2>
                <p className="farming-card-subtitle">
                  Local temperature, wind velocity, and humidity advisories for spraying and field work.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`farming-badge ${weatherIsLive ? 'farming-badge-verified' : 'farming-badge-illustrative'}`}>
                  {weatherIsLive ? '📡 Live API Active' : '📋 Illustrative Benchmark'}
                </span>
                {!isOnline && (
                  <span className="farming-badge farming-badge-stale">
                    ⚠️ Offline Cache
                  </span>
                )}
              </div>
            </div>

            {/* Location Selector */}
            <div className="farming-grid-2" style={{ marginBottom: '1.25rem' }}>
              <div className="farming-form-group">
                <label className="farming-label">Select Agricultural Zone / Hub</label>
                <select
                  className="farming-select"
                  value={selectedHubId}
                  onChange={(e) => setSelectedHubId(e.target.value)}
                >
                  {SAMPLE_WEATHER_HUBS.map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Data Source:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>
                  {weatherData.source}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Last Updated: {weatherCacheDate}
                </span>
              </div>
            </div>

            {weatherLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Fetching local meteorological observations...
              </div>
            ) : (
              <div>
                {/* Weather Tiles */}
                <div className="farming-grid-4">
                  <div className="farming-weather-tile">
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TEMPERATURE</span>
                    <div className="farming-weather-val">{weatherData.temp}°C</div>
                    <span style={{ fontSize: '0.8rem', color: '#166534' }}>{weatherData.condition}</span>
                  </div>

                  <div className="farming-weather-tile">
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>HUMIDITY</span>
                    <div className="farming-weather-val">{weatherData.humidity}%</div>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {weatherData.humidity > 70 ? 'High Fungus Risk' : 'Normal Range'}
                    </span>
                  </div>

                  <div className="farming-weather-tile">
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>WIND SPEED</span>
                    <div className="farming-weather-val">{weatherData.windSpeedKm} km/h</div>
                    <span style={{ fontSize: '0.8rem', color: weatherData.windSpeedKm > 15 ? '#b91c1c' : '#166534' }}>
                      {weatherData.windSpeedKm > 15 ? 'Drift Hazard' : 'Safe for Spraying'}
                    </span>
                  </div>

                  <div className="farming-weather-tile">
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>RAIN PROBABILITY</span>
                    <div className="farming-weather-val">{weatherData.rainChancePct}%</div>
                    <span style={{ fontSize: '0.8rem', color: weatherData.rainChancePct > 40 ? '#b45309' : '#475569' }}>
                      {weatherData.rainChancePct > 40 ? 'Rain Expected' : 'Dry Forecast'}
                    </span>
                  </div>
                </div>

                {/* Practical Agricultural Spray Advisory */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  backgroundColor: weatherData.windSpeedKm > 15 || weatherData.rainChancePct > 40 ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${weatherData.windSpeedKm > 15 || weatherData.rainChancePct > 40 ? '#fde68a' : '#bbf7d0'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🎯</span>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                      Actionable Farm Work & Spray Advisory:
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                    {weatherData.advisory}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: BUYER ENQUIRY DRAFT CREATOR                          */}
      {/* ============================================================ */}
      {showBuyerModal && buyerDraftTargetMarket && (
        <div className="farming-modal-backdrop" onClick={() => setShowBuyerModal(false)}>
          <div className="farming-modal" onClick={(e) => e.stopPropagation()}>
            <div className="farming-modal-header">
              <h3 className="farming-modal-title">Create Buyer Enquiry Draft</h3>
              <button className="farming-modal-close" onClick={() => setShowBuyerModal(false)}>✕</button>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', marginBottom: '1rem' }}>
              <strong>Notice:</strong> This draft is stored locally on your device for your records and negotiation prep. It will NOT be sent to buyers over the internet.
            </div>

            <div className="farming-form-group">
              <label className="farming-label">Produce & Target Quantity</label>
              <input
                type="text"
                className="farming-input"
                readOnly
                value={`${quantity} Quintals of ${currentCrop.name}`}
              />
            </div>

            <div className="farming-form-group">
              <label className="farming-label">Target Mandi / Trade Point</label>
              <input
                type="text"
                className="farming-input"
                readOnly
                value={`${buyerDraftTargetMarket.name} (Benchmark: ₹${buyerDraftTargetMarket.sellingPrice}/q)`}
              />
            </div>

            <div className="farming-form-group">
              <label className="farming-label">Enquiry Notes & Terms</label>
              <textarea
                className="farming-textarea"
                rows="4"
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="farming-btn farming-btn-secondary"
                onClick={() => setShowBuyerModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="farming-btn farming-btn-primary"
                onClick={handleSaveBuyerDraft}
              >
                💾 Save Draft Locally
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SAVED BUYER DRAFTS VIEWER                             */}
      {/* ============================================================ */}
      {showDraftsListModal && (
        <div className="farming-modal-backdrop" onClick={() => setShowDraftsListModal(false)}>
          <div className="farming-modal" onClick={(e) => e.stopPropagation()}>
            <div className="farming-modal-header">
              <h3 className="farming-modal-title">Saved Buyer Enquiry Drafts ({savedDrafts.length})</h3>
              <button className="farming-modal-close" onClick={() => setShowDraftsListModal(false)}>✕</button>
            </div>

            {savedDrafts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280' }}>
                No buyer drafts saved on this device yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {savedDrafts.map(draft => (
                  <div key={draft.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.85rem', background: '#f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#111827' }}>{draft.cropName} &bull; {draft.quantityQuintals} Quintals</strong>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Target: {draft.targetMarket} (Rate: ₹{draft.benchmarkRate}/q)</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Saved: {draft.createdAt}</div>
                      </div>
                      <span className="farming-badge farming-badge-neutral">{draft.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#374151', marginTop: '0.5rem', background: '#ffffff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #f3f4f6' }}>
                      {draft.notes}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        className="farming-btn farming-btn-outline farming-btn-sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(draft.notes);
                          alert('Draft text copied to clipboard!');
                        }}
                      >
                        Copy Notes
                      </button>
                      <button
                        className="farming-btn farming-btn-danger farming-btn-sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REOPEN FULL CROP HEALTH REPORT                        */}
      {/* ============================================================ */}
      {viewingReport && (
        <div className="farming-modal-backdrop" onClick={() => setViewingReport(null)}>
          <div className="farming-modal" onClick={(e) => e.stopPropagation()}>
            <div className="farming-modal-header">
              <h3 className="farming-modal-title">
                Field Health Observation: {viewingReport.cropName}
              </h3>
              <button className="farming-modal-close" onClick={() => setViewingReport(null)}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Observed on: <strong>{viewingReport.date}</strong> &bull; Location: <strong>{viewingReport.location}</strong>
              </div>
            </div>

            {viewingReport.photo && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img
                  src={viewingReport.photo}
                  alt="Saved report specimen"
                  style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}

            <div className="farming-form-group">
              <label className="farming-label">Recorded Symptoms</label>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                {viewingReport.symptoms}
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#166534', marginTop: '1rem' }}>
              <strong>Recommended Next Step:</strong> Present this saved record to your block KVK agronomist or district plant protection officer for formal physical diagnosis.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                className="farming-btn farming-btn-secondary"
                onClick={() => setViewingReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
