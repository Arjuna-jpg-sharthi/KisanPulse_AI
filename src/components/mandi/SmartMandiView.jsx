import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Calculator,
  RefreshCw,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../shared/Card';
import { Button } from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useMandiPrices } from '../../hooks/useMandiPrices';

export const SmartMandiView = () => {
  const { t, language } = useLanguage();
  const { isOffline, refreshSync } = useNetwork();
  const { records: mandiRecords, loading, error, fetchedAt, source, snapshotAsOf, staleSnapshot, refresh } = useMandiPrices();

  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profit Calculator State
  const [calcAcreage, setCalcAcreage] = useState(5);
  const [calcYield, setCalcYield] = useState(20); // quintals per acre
  const [calcPrice, setCalcPrice] = useState(0); // ₹ per quintal
  const [calcCost, setCalcCost] = useState(18000); // ₹ cost per acre

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshSync();
    await refresh({ force: true });
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
        item.market.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query);

      return matchesCrop && matchesQuery && item.modalPrice !== null;
    });
  }, [mandiRecords, selectedCropFilter, searchQuery]);

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
            {t('mandiPageSubtitle', 'Compare the latest daily-reported mandi prices and estimate farm profitability.')}
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
              {loading ? 'Loading reported mandi prices…' : `${filteredMandiList.length} Mandi Records Found`}
            </span>
            {isOffline && (
              <span className="kp-badge kp-badge-warning">
                Cached Mandi Telemetry
              </span>
            )}
          </div>

          <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
            Source: {source} · prices are daily reports
            {fetchedAt ? ` · fetched ${new Date(fetchedAt).toLocaleString()}` : ''}
            {snapshotAsOf ? ` · snapshot through ${snapshotAsOf}` : ''}
          </p>

          {staleSnapshot && (
            <Card style={{ marginBottom: '16px' }}>
              <CardBody style={{ color: 'var(--kp-warning)' }}>
                Showing a CSV snapshot because the live data provider is unavailable. Check the reported date before relying on these prices.
              </CardBody>
            </Card>
          )}

          {error && (
            <Card style={{ marginBottom: '16px' }}>
              <CardBody style={{ color: 'var(--kp-warning)' }}>
                {error}
              </CardBody>
            </Card>
          )}

          <div className="kp-flex kp-flex-col kp-gap-4">
            {filteredMandiList.map((item) => {
              return (
                <Card key={item.id} hoverable>
                  <CardBody style={{ padding: '20px 24px' }}>
                    <div className="kp-flex kp-justify-between kp-items-center" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div className="kp-flex kp-items-center kp-gap-2">
                          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
                            {language === 'hi' ? item.cropHi : item.cropEn}
                          </h3>
                        </div>
                        <div className="kp-flex kp-items-center kp-gap-2" style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
                          <MapPin size={14} />
                          <span>{item.market}{item.district ? `, ${item.district}` : ''}, {item.state}</span>
                          <span>•</span>
                          <Calendar size={13} />
                          <span>Reported: {item.arrivalDate || 'date unavailable'}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--kp-primary-800)', lineHeight: '1.1' }}>
                          ₹{item.modalPrice.toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--kp-text-muted)', marginLeft: '4px' }}>
                            {t('perQuintal', '/ quintal')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                          Min ₹{item.minPrice?.toLocaleString('en-IN') ?? '—'} · Max ₹{item.maxPrice?.toLocaleString('en-IN') ?? '—'}
                          {item.grade ? ` · Grade ${item.grade}` : ''}
                        </div>
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
                        <span><strong>Reported modal price:</strong> based on the selected mandi record. Check grade and date before selling.</span>
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
