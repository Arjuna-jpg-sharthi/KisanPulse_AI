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

const MOCK_MANDI_DATA = [
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

  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profit Calculator State
  const [calcAcreage, setCalcAcreage] = useState(5);
  const [calcYield, setCalcYield] = useState(20); // quintals per acre
  const [calcPrice, setCalcPrice] = useState(2480); // ₹ per quintal
  const [calcCost, setCalcCost] = useState(18000); // ₹ cost per acre

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshSync();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Filtered Mandi Items
  const filteredMandiList = useMemo(() => {
    return MOCK_MANDI_DATA.filter((item) => {
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
  }, [selectedCropFilter, searchQuery]);

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

      {/* Main Grid: Mandi Rates on Left (2 cols), Profit Engine on Right (1 col) */}
      <div className="kp-grid kp-grid-cols-3 kp-gap-6" style={{ marginBottom: '32px' }}>
        {/* Mandi Rates List (2 Columns) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="kp-flex kp-justify-between kp-items-center" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--kp-text-muted)', textTransform: 'uppercase' }}>
              {filteredMandiList.length} Mandi Records Found
            </span>
            {isOffline && (
              <span className="kp-badge kp-badge-warning">
                Cached Mandi Telemetry
              </span>
            )}
          </div>

          <div className="kp-flex kp-flex-col kp-gap-4">
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
                          <span className={`kp-badge ${item.trend === 'up' ? 'kp-badge-success' : 'kp-badge-danger'}`}>
                            {item.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {item.trendPct}
                          </span>
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
                    min="0.5"
                    step="0.5"
                    value={calcAcreage}
                    onChange={(e) => setCalcAcreage(Math.max(0.1, Number(e.target.value)))}
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
                    min="1"
                    value={calcYield}
                    onChange={(e) => setCalcYield(Math.max(1, Number(e.target.value)))}
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
                    min="500"
                    step="50"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(Math.max(100, Number(e.target.value)))}
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
                    min="1000"
                    step="500"
                    value={calcCost}
                    onChange={(e) => setCalcCost(Math.max(0, Number(e.target.value)))}
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
                <div
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
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartMandiView;
