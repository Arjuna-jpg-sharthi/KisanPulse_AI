import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Calculator,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  BadgePercent,
  Coins,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../shared/Card';
import { Button } from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useMandiPrices } from '../../hooks/useMandiPrices';

export const MOCK_MANDI_DATA = [
  {
    id: 1,
    cropKey: 'wheat',
    cropEn: 'Wheat (Sharbati)',
    cropHi: 'गेहूं (शरबती)',
    mandi: 'Indore APMC',
    state: 'Madhya Pradesh',
    modalPrice: 2480,
    minPrice: 2350,
    maxPrice: 2600,
    msp: 2275,
    arrivalQty: '1,420 Quintals',
    trend: 'up',
    trendPct: '+3.4%',
    advisory: 'Strong mill demand. Good time to offload 50% stock.'
  },
  {
    id: 2,
    cropKey: 'paddy',
    cropEn: 'Basmati Paddy (1121)',
    cropHi: 'बासमती धान (1121)',
    mandi: 'Karnal APMC',
    state: 'Haryana',
    modalPrice: 3650,
    minPrice: 3400,
    maxPrice: 3820,
    msp: 2320,
    arrivalQty: '2,800 Quintals',
    trend: 'up',
    trendPct: '+1.8%',
    advisory: 'Export inquiries rising. Hold for higher prices.'
  },
  {
    id: 3,
    cropKey: 'mustard',
    cropEn: 'Mustard / Rapeseed',
    cropHi: 'सरसों / राई',
    mandi: 'Alwar APMC',
    state: 'Rajasthan',
    modalPrice: 5450,
    minPrice: 5200,
    maxPrice: 5600,
    msp: 5650,
    arrivalQty: '950 Quintals',
    trend: 'down',
    trendPct: '-1.2%',
    advisory: 'Trading slightly below MSP. Wait for NAFED procurement.'
  },
  {
    id: 4,
    cropKey: 'cotton',
    cropEn: 'Cotton (Medium Staple)',
    cropHi: 'कपास (मध्यम रेशा)',
    mandi: 'Rajkot APMC',
    state: 'Gujarat',
    modalPrice: 7200,
    minPrice: 6900,
    maxPrice: 7450,
    msp: 7122,
    arrivalQty: '1,120 Quintals',
    trend: 'up',
    trendPct: '+0.9%',
    advisory: 'Spinning mill demand steady above government MSP.'
  },
  {
    id: 5,
    cropKey: 'soybean',
    cropEn: 'Yellow Soybean',
    cropHi: 'पीली सोयाबीन',
    mandi: 'Ujjain APMC',
    state: 'Madhya Pradesh',
    modalPrice: 4720,
    minPrice: 4500,
    maxPrice: 4900,
    msp: 4892,
    arrivalQty: '1,650 Quintals',
    trend: 'up',
    trendPct: '+2.1%',
    advisory: 'Edible oil processors active. Price moving toward MSP.'
  },
  {
    id: 6,
    cropKey: 'chana',
    cropEn: 'Gram / Chana',
    cropHi: 'चना / देशी',
    mandi: 'Bikaner APMC',
    state: 'Rajasthan',
    modalPrice: 6100,
    minPrice: 5800,
    maxPrice: 6350,
    msp: 5440,
    arrivalQty: '830 Quintals',
    trend: 'up',
    trendPct: '+4.5%',
    advisory: 'Substantial festival and pulse demand. Highly profitable.'
  },
  {
    id: 7,
    cropKey: 'potato',
    cropEn: 'Potato (Jyoti)',
    cropHi: 'आलू (ज्योति)',
    mandi: 'Agra Mandi',
    state: 'Uttar Pradesh',
    modalPrice: 1650,
    minPrice: 1450,
    maxPrice: 1800,
    msp: 0,
    arrivalQty: '4,500 Quintals',
    trend: 'down',
    trendPct: '-2.4%',
    advisory: 'Heavy cold storage arrivals. Consider staggered selling.'
  },
  {
    id: 8,
    cropKey: 'onion',
    cropEn: 'Red Onion (Nasik)',
    cropHi: 'लाल प्याज (नासिक)',
    mandi: 'Lasalgaon APMC',
    state: 'Maharashtra',
    modalPrice: 2850,
    minPrice: 2600,
    maxPrice: 3200,
    msp: 0,
    arrivalQty: '3,200 Quintals',
    trend: 'up',
    trendPct: '+6.1%',
    advisory: 'Tight supplies from early kharif. Bullish trend.'
  }
];

export const SmartMandiView = () => {
  const { t, language } = useLanguage();
  const { isOffline, refreshSync } = useNetwork();
  const { records: officialRecords, loading: officialLoading, error: officialError, source: mandiSource, snapshotAsOf, staleSnapshot, fetchedAt: mandiFetchedAt, notice: mandiNotice, refresh: refreshOfficialRates } = useMandiPrices();
  const mandiRecords = officialRecords;

  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sellCrop, setSellCrop] = useState('');
  const [sellState, setSellState] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellCostPerQuintal, setSellCostPerQuintal] = useState('');

  // Profit Calculator State
  const [calcAcreage, setCalcAcreage] = useState('');
  const [calcYield, setCalcYield] = useState(''); // farmer-entered quintals per acre
  const [calcPrice, setCalcPrice] = useState(''); // farmer-entered ₹ per quintal
  const [calcCost, setCalcCost] = useState(''); // farmer-entered ₹ cost per acre

  const profitInputsComplete = [calcAcreage, calcYield, calcPrice, calcCost].every((value) => Number(value) > 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshSync();
    await refreshOfficialRates({ force: true });
    setIsRefreshing(false);
  };

  // Filtered Mandi Items
  const filteredMandiList = useMemo(() => {
    return mandiRecords.filter((item) => {
      const matchesCrop =
        selectedCropFilter === 'all' || item.cropKey === selectedCropFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.cropEn.toLowerCase().includes(query) ||
        item.cropHi.toLowerCase().includes(query) ||
        item.mandi.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query);

      return matchesCrop && matchesQuery;
    });
  }, [selectedCropFilter, searchQuery, mandiRecords]);

  // Farm Profit Calculations
  const profitResults = useMemo(() => {
    const totalYieldQuintals = Number(calcAcreage) * Number(calcYield);
    const grossRevenue = totalYieldQuintals * Number(calcPrice);
    const totalCost = Number(calcAcreage) * Number(calcCost);
    const netProfit = grossRevenue - totalCost;
    const marginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

    return {
      totalYieldQuintals,
      grossRevenue,
      totalCost,
      netProfit,
      marginPct
    };
  }, [calcAcreage, calcYield, calcPrice, calcCost]);

  const sellCropOptions = useMemo(() => [...new Set(officialRecords.map((item) => item.commodity).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [officialRecords]);
  const sellStateOptions = useMemo(() => [...new Set(officialRecords.map((item) => item.state).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [officialRecords]);
  const chosenSellCrop = sellCropOptions.includes(sellCrop) ? sellCrop : (sellCropOptions[0] || '');
  const sellRecommendations = useMemo(() => {
    if (!chosenSellCrop) return [];
    const matching = officialRecords.filter((item) => item.commodity === chosenSellCrop && (!sellState || item.state === sellState));
    const latestByMarket = new Map();
    matching.forEach((item) => {
      const key = [item.market, item.district, item.state].join('|');
      const previous = latestByMarket.get(key);
      if (!previous || item.arrivalDate > previous.arrivalDate || (item.arrivalDate === previous.arrivalDate && item.modalPrice > previous.modalPrice)) latestByMarket.set(key, item);
    });
    const costPerQuintal = Math.max(0, Number(sellCostPerQuintal) || 0);
    return [...latestByMarket.values()].map((item) => ({
      ...item,
      estimatedNetPerQuintal: Math.max(0, item.modalPrice - costPerQuintal),
      estimatedNetTotal: Math.max(0, item.modalPrice - costPerQuintal) * Math.max(0, Number(sellQuantity) || 0)
    })).sort((a, b) => b.estimatedNetPerQuintal - a.estimatedNetPerQuintal || b.arrivalDate.localeCompare(a.arrivalDate)).slice(0, 5);
  }, [officialRecords, chosenSellCrop, sellState, sellCostPerQuintal, sellQuantity]);

  return (
    <div className="kp-mandi-engine-view">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
            {t('mandiPageTitle', 'Smart Mandi & Farm Profit Engine')}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: 'var(--kp-text-muted)' }}>
            {t('mandiPageSubtitle', 'Track commodity prices, predict price swings, and compute your net farm profitability.')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="md"
            icon={<RefreshCw size={15} className={isRefreshing ? 'kp-spinner' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {t('refreshRates', 'Refresh Live Rates')}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <CardBody style={{ padding: '16px 20px' }}>
          <div className="kp-grid kp-grid-cols-2 kp-gap-4">
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--kp-text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder={t('searchMandiPlaceholder', 'Search by Mandi, State, or Crop...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  borderRadius: 'var(--kp-radius-md)',
                  border: '1px solid var(--kp-border)',
                  backgroundColor: 'var(--kp-slate-50)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Crop Select Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} style={{ color: 'var(--kp-text-muted)', flexShrink: 0 }} />
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: 'var(--kp-radius-md)',
                  border: '1px solid var(--kp-border)',
                  backgroundColor: 'var(--kp-slate-50)',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <option value="all">{t('allCrops', 'All Crops (सभी फसलें)')}</option>
                <option value="wheat">{t('wheat', 'Wheat (गेहूं)')}</option>
                <option value="paddy">{t('paddy', 'Paddy / Rice (धान)')}</option>
                <option value="mustard">{t('mustard', 'Mustard (सरसों)')}</option>
                <option value="cotton">{t('cotton', 'Cotton (कपास)')}</option>
                <option value="soybean">{t('soybean', 'Soybean (सोयाबीन)')}</option>
                <option value="chana">{t('chana', 'Chana (चना)')}</option>
                <option value="potato">{t('potato', 'Potato (आलू)')}</option>
                <option value="onion">{t('onion', 'Onion (प्याज)')}</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginBottom: '24px', border: '1px solid #bbf7d0', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 72%)' }}>
        <CardHeader
          icon={<Coins size={20} />}
          iconVariant="accent"
          title={language === 'hi' ? 'फसल बेचने की कमाई सलाहकार' : 'Sell-Smart Revenue Advisor'}
          subtitle={language === 'hi' ? 'अपनी फसल और राज्य चुनें—आधिकारिक मंडी भाव के आधार पर बेहतर मंडी देखें।' : 'Choose your crop and state to compare reported mandis and estimated proceeds.'}
        />
        <CardBody>
          <div className="kp-grid kp-grid-cols-2 kp-gap-4" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)' }}>
              {language === 'hi' ? 'आप कौन सी फसल बेचना चाहते हैं?' : 'Which crop are you looking to sell?'}
              <select value={chosenSellCrop} onChange={(event) => setSellCrop(event.target.value)} disabled={!sellCropOptions.length} style={{ display: 'block', width: '100%', height: '42px', marginTop: '6px', padding: '0 12px', borderRadius: 'var(--kp-radius-md)', border: '1px solid var(--kp-border)', background: '#fff' }}>
                {!sellCropOptions.length && <option value="">{officialLoading ? 'Loading official crops…' : 'No official crop data available'}</option>}
                {sellCropOptions.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
              </select>
            </label>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)' }}>
              {language === 'hi' ? 'राज्य (बेहतर स्थानीय तुलना के लिए)' : 'Your state (for a more relevant comparison)'}
              <select value={sellState} onChange={(event) => setSellState(event.target.value)} disabled={!sellStateOptions.length} style={{ display: 'block', width: '100%', height: '42px', marginTop: '6px', padding: '0 12px', borderRadius: 'var(--kp-radius-md)', border: '1px solid var(--kp-border)', background: '#fff' }}>
                <option value="">{language === 'hi' ? 'सभी राज्य' : 'Compare all states'}</option>
                {sellStateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </label>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)' }}>
              {language === 'hi' ? 'बेचने की मात्रा (क्विंटल)' : 'Quantity to sell (quintals)'}
              <input type="number" min="0.1" step="0.1" value={sellQuantity} onChange={(event) => setSellQuantity(event.target.value)} placeholder={language === 'hi' ? 'जैसे 20' : 'e.g. 20'} style={{ display: 'block', width: '100%', height: '42px', marginTop: '6px', padding: '0 12px', borderRadius: 'var(--kp-radius-md)', border: '1px solid var(--kp-border)' }} />
            </label>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)' }}>
              {language === 'hi' ? 'ढुलाई/अन्य खर्च (₹ प्रति क्विंटल)' : 'Transport/other cost (₹ per quintal)'}
              <input type="number" min="0" step="1" value={sellCostPerQuintal} onChange={(event) => setSellCostPerQuintal(event.target.value)} placeholder="0" style={{ display: 'block', width: '100%', height: '42px', marginTop: '6px', padding: '0 12px', borderRadius: 'var(--kp-radius-md)', border: '1px solid var(--kp-border)' }} />
            </label>
          </div>
          {sellRecommendations.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {sellRecommendations.slice(0, 3).map((item, index) => (
                <div key={`${item.state}-${item.district}-${item.market}`} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${index === 0 ? '#86efac' : 'var(--kp-border)'}`, background: index === 0 ? '#f0fdf4' : '#fff' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: index === 0 ? '#15803d' : 'var(--kp-text-muted)', marginBottom: '6px' }}>{index === 0 ? (language === 'hi' ? 'सबसे अच्छा अनुमानित विकल्प' : 'BEST ESTIMATED OPTION') : `${language === 'hi' ? 'विकल्प' : 'OPTION'} #${index + 1}`}</div>
                  <strong style={{ display: 'block', color: 'var(--kp-text-primary)' }}>{item.market}</strong>
                  <span style={{ display: 'block', margin: '3px 0 10px', color: 'var(--kp-text-muted)', fontSize: '0.8rem' }}>{item.district}, {item.state} · {item.arrivalDate}</span>
                  <div style={{ fontWeight: '800', color: '#166534' }}>₹{item.estimatedNetPerQuintal.toLocaleString('en-IN')} <span style={{ fontSize: '0.78rem', fontWeight: '500' }}>/ quintal estimated after entered cost</span></div>
                  {Number(sellQuantity) > 0 && <div style={{ marginTop: '4px', color: 'var(--kp-text-secondary)', fontSize: '0.84rem' }}>Est. total: <strong>₹{item.estimatedNetTotal.toLocaleString('en-IN')}</strong></div>}
                  <div style={{ marginTop: '5px', color: 'var(--kp-text-muted)', fontSize: '0.78rem' }}>Reported modal rate ₹{item.modalPrice.toLocaleString('en-IN')} · range ₹{Number(item.minPrice || 0).toLocaleString('en-IN')}–₹{Number(item.maxPrice || 0).toLocaleString('en-IN')}</div>
                  <button type="button" onClick={() => setCalcPrice(item.modalPrice)} style={{ marginTop: '10px', border: 0, padding: 0, background: 'transparent', color: 'var(--kp-primary-700)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>Use rate in profit calculator</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#fff7ed', color: '#9a3412', fontSize: '0.86rem' }}>
              {officialLoading ? 'Loading official mandi rates…' : officialRecords.length ? 'No reported mandi rate matches this crop and state in the current official snapshot. Try another state or refresh later.' : 'No official price snapshot is available yet. Add the data.gov.in API key and refresh rates; this advisor will not invent a recommendation.'}
            </div>
          )}
          <p style={{ margin: '12px 0 0', color: 'var(--kp-text-muted)', fontSize: '0.76rem' }}>
            {staleSnapshot ? 'Saved historical snapshot; ' : ''}Ranking uses the latest official modal rate available per mandi minus only the transport/other cost you enter. It does not know distance, quality deductions, taxes, or buyer availability—confirm with the mandi before dispatch.
          </p>
        </CardBody>
      </Card>

      {/* Main Grid: Mandi Rates on Left (2 cols), Profit Engine on Right (1 col) */}
      <div className="kp-grid kp-grid-cols-3 kp-gap-6" style={{ marginBottom: '32px' }}>
        {/* Mandi Rates List (2 Columns) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="kp-flex kp-justify-between kp-items-center" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--kp-text-muted)', textTransform: 'uppercase' }}>
              {filteredMandiList.length} Mandi Records Found
            </span>
            <span className={`kp-badge ${officialRecords.length ? 'kp-badge-success' : 'kp-badge-warning'}`} title={mandiSource || 'Demonstration data'}>
              {officialLoading ? 'Checking official rates…' : officialRecords.length ? `${mandiSource}${snapshotAsOf ? ` · through ${snapshotAsOf}` : ''}${staleSnapshot ? ' · cached' : ''}` : 'No official mandi rates available'}
            </span>
            {isOffline && (
              <span className="kp-badge kp-badge-warning">
                Cached Mandi Telemetry
              </span>
            )}
          </div>

          {mandiNotice && <div role="status" style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: '#fff7ed', color: '#9a3412', fontSize: '0.82rem' }}>{mandiNotice}</div>}
          <div style={{ margin: '-4px 0 12px', color: 'var(--kp-text-muted)', fontSize: '0.78rem' }}>
            Prices are official daily wholesale reports (₹/quintal), not guaranteed farm-gate offers. {mandiFetchedAt ? `Fetched ${new Date(mandiFetchedAt).toLocaleString('en-IN')}.` : snapshotAsOf ? `Latest saved market date: ${snapshotAsOf}.` : ''} Confirm the rate with the mandi before transporting produce.
          </div>
          <div className="kp-flex kp-flex-col kp-gap-4">
            {!officialLoading && filteredMandiList.length === 0 && (
              <Card><CardBody style={{ padding: '24px', color: 'var(--kp-text-muted)' }}>
                {officialRecords.length ? 'No official rates match these filters.' : (officialError || 'Official mandi rates are unavailable. Add DATA_GOV_IN_API_KEY to the server .env and restart to load AGMARKNET data. No demo rates are presented as live prices.')}
              </CardBody></Card>
            )}
            {filteredMandiList.map((item) => {
              const isAboveMsp = item.msp > 0 ? item.modalPrice >= item.msp : true;
              return (
                <Card key={item.id} hoverable>
                  <CardBody style={{ padding: '20px 24px' }}>
                    <div className="kp-flex kp-justify-between kp-items-center" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div className="kp-flex kp-items-center kp-gap-2">
                          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
                            {language === 'hi' ? item.cropHi : item.cropEn}
                          </h3>
                          {item.trendPct && <span className={`kp-badge ${item.trend === 'up' ? 'kp-badge-success' : item.trend === 'down' ? 'kp-badge-danger' : ''}`}>
                            {item.trend === 'up' ? <ArrowUpRight size={13} /> : item.trend === 'down' ? <ArrowDownRight size={13} /> : null}
                            {item.trendPct}
                          </span>}
                        </div>
                        <div className="kp-flex kp-items-center kp-gap-2" style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
                          <MapPin size={14} />
                          <span>{item.mandi}, {item.state}</span>
                          <span>•</span>
                          <span>Arrivals: {item.arrivalQty}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--kp-primary-800)', lineHeight: '1.1' }}>
                          ₹{item.modalPrice.toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--kp-text-muted)', marginLeft: '4px' }}>
                            {t('perQuintal', '/ quintal')}
                          </span>
                        </div>
                        {item.msp > 0 ? (
                          <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                            <span style={{ color: 'var(--kp-text-muted)' }}>Govt MSP: ₹{item.msp} </span>
                            <strong style={{ color: isAboveMsp ? 'var(--kp-success)' : 'var(--kp-warning)' }}>
                              ({isAboveMsp ? '+₹' + (item.modalPrice - item.msp) : '-₹' + (item.msp - item.modalPrice)})
                            </strong>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                            Range: ₹{item.minPrice} - ₹{item.maxPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: 'var(--kp-radius-md)',
                        fontSize: '0.82rem',
                        color: 'var(--kp-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div className="kp-flex kp-items-center kp-gap-2">
                        <Sparkles size={14} style={{ color: 'var(--kp-accent-600)', flexShrink: 0 }} />
                        <span><strong>Mandi Pulse:</strong> {item.advisory}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCalcPrice(item.modalPrice);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--kp-primary-700)',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Use in Calculator
                      </button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Farm Profit Engine / Calculator (1 Column) */}
        <div>
          <Card style={{ position: 'sticky', top: '80px' }}>
            <CardHeader
              icon={<Calculator size={20} />}
              iconVariant="accent"
              title={t('profitCalcTitle', 'Farm Profit Estimator')}
              subtitle="Calculate net yield and operational margins"
            />
            <CardBody>
              <div className="kp-flex kp-flex-col kp-gap-4">
                {/* Land Area */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)', marginBottom: '4px' }}>
                    {t('landArea', 'Land Area (Acres)')}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter your land area"
                    value={calcAcreage}
                    onChange={(e) => setCalcAcreage(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--kp-radius-md)',
                      border: '1px solid var(--kp-border)',
                      fontWeight: '700'
                    }}
                  />
                </div>

                {/* Expected Yield */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)', marginBottom: '4px' }}>
                    {t('expectedYield', 'Expected Yield (Quintals/Acre)')}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter expected yield"
                    value={calcYield}
                    onChange={(e) => setCalcYield(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--kp-radius-md)',
                      border: '1px solid var(--kp-border)',
                      fontWeight: '700'
                    }}
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)', marginBottom: '4px' }}>
                    {t('expectedPrice', 'Selling Price (₹/Quintal)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter a quoted price"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--kp-radius-md)',
                      border: '1px solid var(--kp-border)',
                      fontWeight: '700'
                    }}
                  />
                </div>

                {/* Cultivation Cost */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--kp-text-secondary)', marginBottom: '4px' }}>
                    {t('costOfCultivation', 'Cultivation Cost (₹/Acre)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Enter cultivation cost"
                    value={calcCost}
                    onChange={(e) => setCalcCost(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--kp-radius-md)',
                      border: '1px solid var(--kp-border)',
                      fontWeight: '700'
                    }}
                  />
                </div>

                <div className="kp-divider" />

                {/* Profit Result Display Box */}
                {profitInputsComplete ? <div
                  style={{
                    background: profitResults.netProfit >= 0 ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${profitResults.netProfit >= 0 ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: 'var(--kp-radius-lg)',
                    padding: '16px'
                  }}
                >
                  <div className="kp-flex kp-justify-between kp-items-center" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--kp-text-muted)' }}>
                      {t('estGrossRevenue', 'Gross Revenue')}:
                    </span>
                    <strong style={{ fontSize: '0.92rem' }}>
                      ₹{profitResults.grossRevenue.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="kp-flex kp-justify-between kp-items-center" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--kp-text-muted)' }}>
                      {t('estTotalCost', 'Total Cost')}:
                    </span>
                    <span style={{ fontSize: '0.92rem', color: 'var(--kp-danger)' }}>
                      -₹{profitResults.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="kp-divider" style={{ margin: '8px 0' }} />

                  <div className="kp-flex kp-justify-between kp-items-center">
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: profitResults.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                        {t('estNetProfit', 'Projected Net Profit')}
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: profitResults.netProfit >= 0 ? '#166534' : '#991b1b', lineHeight: '1.2' }}>
                        ₹{profitResults.netProfit.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`kp-badge ${profitResults.netProfit >= 0 ? 'kp-badge-success' : 'kp-badge-danger'}`}>
                        {profitResults.marginPct}% Margin
                      </span>
                    </div>
                  </div>
                </div> : <div style={{ border: '1px dashed var(--kp-border)', borderRadius: 'var(--kp-radius-lg)', padding: 16, color: 'var(--kp-text-muted)', fontSize: 13 }}>Enter your own land area, expected yield, selling price, and cultivation cost to see an estimate. Results are only estimates, not guaranteed returns.</div>}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartMandiView;
