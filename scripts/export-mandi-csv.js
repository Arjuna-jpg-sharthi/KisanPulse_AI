import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiKey = process.env.DATA_GOV_IN_API_KEY?.trim();
if (!apiKey) {
  console.error('Set DATA_GOV_IN_API_KEY in your local .env before exporting. Do not commit .env.');
  process.exit(1);
}

const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
const limit = 1000;
const fields = ['arrival_date', 'state', 'district', 'market', 'commodity', 'variety', 'grade', 'min_price', 'max_price', 'modal_price'];
const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const rows = [];

for (let offset = 0; ; offset += limit) {
  const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  } catch (error) {
    console.error(`Could not connect to data.gov.in at offset ${offset} (${error?.cause?.code || error?.name || 'network error'}).`);
    process.exit(1);
  }
  if (!response.ok) {
    console.error(`data.gov.in returned HTTP ${response.status} at offset ${offset}. Check your API key and try again.`);
    process.exit(1);
  }

  const body = await response.json();
  if (body.status && body.status !== 'ok') {
    console.error(`data.gov.in did not return records: ${String(body.message || body.status).slice(0, 200)}`);
    process.exit(1);
  }
  const batch = Array.isArray(body.records) ? body.records : [];
  rows.push(...batch);
  console.log(`Fetched ${rows.length} records...`);
  if (batch.length < limit || rows.length >= Number(body.total || Infinity)) break;
  await new Promise((resolve) => setTimeout(resolve, 250));
}

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputPath = path.join(projectRoot, 'data', 'mandi-prices.csv');
const csv = [
  ['date', 'state', 'district', 'market', 'commodity', 'variety', 'grade', 'min_price', 'max_price', 'modal_price'].join(','),
  ...rows.map((record) => fields.map((field) => quote(record[field])).join(','))
].join('\n') + '\n';

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, csv, 'utf8');
console.log(`Saved ${rows.length} records to data/mandi-prices.csv. Prices are the source's daily reports, not live quotes.`);
