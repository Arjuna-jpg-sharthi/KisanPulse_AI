import { useCallback, useEffect, useState } from 'react';

const getCropKey = (commodity) => {
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
  const cropEn = [record.commodity, record.variety && record.variety !== record.commodity ? record.variety : '']
    .filter(Boolean)
    .join(' · ');

  return {
    id: [record.state, record.district, record.market, record.commodity, record.variety, record.arrivalDate, index].join('|'),
    cropKey: getCropKey(record.commodity),
    cropEn,
    cropHi: cropEn,
    market: record.market,
    state: record.state,
    district: record.district,
    variety: record.variety,
    grade: record.grade,
    arrivalDate: record.arrivalDate,
    modalPrice: record.modalPrice,
    minPrice: record.minPrice,
    maxPrice: record.maxPrice
  };
};

export const useMandiPrices = (limit = 1000) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchedAt, setFetchedAt] = useState('');

  const refresh = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ limit: String(limit) });
      if (force) query.set('refresh', '1');
      const response = await fetch(`/api/mandi-prices?${query.toString()}`);
      const payload = await response.json();
      if (!response.ok) {
        const message = payload.code === 'API_KEY_MISSING'
          ? 'Add DATA_GOV_IN_API_KEY in Render Environment settings to enable official mandi prices.'
          : payload.error || 'Mandi prices are unavailable.';
        throw new Error(message);
      }
      setRecords((payload.records || []).map(normalizeRecord));
      setFetchedAt(payload.fetchedAt || '');
    } catch (requestError) {
      setRecords([]);
      setError(requestError.message || 'Mandi prices are unavailable.');
      setFetchedAt('');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, error, fetchedAt, refresh };
};
