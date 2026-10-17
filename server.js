import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
const sourceUrl = 'https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi';
const cacheTtlMs = 15 * 60 * 1000;
const responseCache = new Map();
const allowedFilters = ['state', 'district', 'market', 'commodity', 'arrival_date'];

const logProviderFailure = (kind, details = {}) => {
  // Never log the request URL or API key. Keep only provider diagnostics that
  // help distinguish a rejected key from rate limits and upstream failures.
  console.error('[mandi-provider]', JSON.stringify({ kind, ...details }));
};

const providerMessage = (body, apiKey) => {
  const candidate = [body?.message, body?.error, body?.error_description, body?.status]
    .find((value) => typeof value === 'string' && value.trim());
  if (!candidate) return undefined;
  return candidate.replaceAll(apiKey, '[redacted]').slice(0, 240);
};

const parsePrice = (value) => {
  const parsed = Number(String(value ?? '').replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value) => {
  const match = String(value ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00Z`).getTime() : 0;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mandiApiConfigured: Boolean(process.env.DATA_GOV_IN_API_KEY) });
});

app.get('/api/mandi-prices', async (req, res) => {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      code: 'API_KEY_MISSING',
      error: 'Mandi API key is not configured on the server.'
    });
  }

  const filters = {};
  for (const field of allowedFilters) {
    const value = String(req.query[field] ?? '').trim();
    if (value) {
      if (value.length > 100) return res.status(400).json({ error: `Invalid ${field} filter.` });
      filters[field] = value;
    }
  }

  const requestedLimit = Number.parseInt(String(req.query.limit ?? '1000'), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 1000;
  const cacheKey = JSON.stringify({ filters, limit });
  const forceRefresh = req.query.refresh === '1';
  const cached = responseCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.cachedAt < cacheTtlMs) {
    return res.json({ ...cached.payload, cached: true });
  }

  const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  for (const [field, value] of Object.entries(filters)) {
    url.searchParams.set(`filters[${field}]`, value);
  }

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) {
      let diagnostic;
      try {
        diagnostic = await upstream.json();
      } catch {
        // Some upstream failures return HTML or an empty body.
      }
      logProviderFailure('http_error', {
        httpStatus: upstream.status,
        providerMessage: providerMessage(diagnostic, apiKey)
      });
      return res.status(502).json({ error: 'The mandi data provider returned an error. Please try again later.' });
    }

    const body = await upstream.json();
    if (body.status && body.status !== 'ok') {
      logProviderFailure('provider_rejected_request', {
        httpStatus: upstream.status,
        providerMessage: providerMessage(body, apiKey)
      });
      return res.status(502).json({ error: 'The mandi data provider could not return records.' });
    }

    const records = (Array.isArray(body.records) ? body.records : [])
      .map((record) => ({
        state: String(record.state ?? ''),
        district: String(record.district ?? ''),
        market: String(record.market ?? ''),
        commodity: String(record.commodity ?? ''),
        variety: String(record.variety ?? ''),
        grade: String(record.grade ?? ''),
        arrivalDate: String(record.arrival_date ?? ''),
        minPrice: parsePrice(record.min_price),
        maxPrice: parsePrice(record.max_price),
        modalPrice: parsePrice(record.modal_price)
      }))
      .sort((a, b) => parseDate(b.arrivalDate) - parseDate(a.arrivalDate));

    const payload = {
      source: 'data.gov.in / AGMARKNET',
      sourceUrl,
      fetchedAt: new Date().toISOString(),
      total: Number(body.total) || records.length,
      records
    };
    responseCache.set(cacheKey, { cachedAt: Date.now(), payload });
    if (responseCache.size > 100) responseCache.delete(responseCache.keys().next().value);
    res.set('Cache-Control', 'no-store');
    return res.json(payload);
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    logProviderFailure(timedOut ? 'timeout' : 'request_or_parse_error', {
      errorName: String(error?.name || 'Error').slice(0, 80),
      errorCode: String(error?.cause?.code || '').slice(0, 80)
    });
    return res.status(502).json({
      error: timedOut
        ? 'The mandi data provider did not respond in time. Please try again later.'
        : 'Could not retrieve mandi data. Please try again later.'
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(projectRoot, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, '0.0.0.0', () => {
  console.log(`KisanPulse server listening on port ${port}`);
});
