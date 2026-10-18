import { useCallback, useEffect, useState } from 'react';

const cropKeyFor = (commodity = '') => {
  const crop = commodity.toLowerCase();
  if (crop.includes('wheat')) return 'wheat';
  if (crop.includes('paddy') || crop.includes('rice')) return 'paddy';
  if (crop.includes('mustard') || crop.includes('rapeseed')) return 'mustard';
  if (crop.includes('cotton')) return 'cotton';
  if (crop.includes('soybean') || crop.includes('soya')) return 'soybean';
  if (crop.includes('gram') || crop.includes('chana')) return 'chana';
  if (crop.includes('potato')) return 'potato';
  if (crop.includes('onion')) return 'onion';
  return 'other';
};

const normalizeRecord = (record, index) => {
  const crop = [record.commodity, record.variety && record.variety !== record.commodity ? record.variety : '']
    .filter(Boolean).join(' · ');
  return {
    id: [record.state, record.district, record.market, crop, record.arrivalDate, index].join('|'),
    commodity: record.commodity, variety: record.variety || '',
    cropKey: cropKeyFor(record.commodity), cropEn: crop, cropHi: crop,
    mandi: record.market, state: record.state, district: record.district,
    modalPrice: record.modalPrice, minPrice: record.minPrice, maxPrice: record.maxPrice,
    arrivalDate: record.arrivalDate, msp: 0, arrivalQty: '—', trend: 'flat', trendPct: '',
    advisory: 'Reported mandi rate. Compare quality, transport costs and nearby offers before selling.'
  };
};

export function useMandiPrices(limit = 1000) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const [snapshotAsOf, setSnapshotAsOf] = useState('');
  const [staleSnapshot, setStaleSnapshot] = useState(false);
  const [fetchedAt, setFetchedAt] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ limit: String(Math.max(limit, 10000)) });
      if (force) query.set('refresh', '1');
      const response = await fetch(`/api/mandi-prices?${query}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Official mandi prices are unavailable.');
      setRecords((payload.records || []).map(normalizeRecord));
      setSource(payload.source || 'data.gov.in / AGMARKNET');
      setSnapshotAsOf(payload.snapshotAsOf || '');
      setStaleSnapshot(Boolean(payload.staleSnapshot));
      setFetchedAt(payload.fetchedAt || '');
      setNotice(payload.notice || '');
    } catch (requestError) {
      setRecords([]);
      setError(requestError.message || 'Official mandi prices are unavailable.');
      setSource('');
      setSnapshotAsOf('');
      setStaleSnapshot(false);
      setFetchedAt('');
      setNotice('');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { refresh(); }, [refresh]);
  return { records, loading, error, source, snapshotAsOf, staleSnapshot, fetchedAt, notice, refresh };
}
