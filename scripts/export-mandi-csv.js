import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiKey = process.env.DATA_GOV_IN_API_KEY?.trim();
if (!apiKey) {
  console.error('Set DATA_GOV_IN_API_KEY in your local .env before exporting. Do not commit .env.');
  process.exit(1);
}

const resourceId = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const limit = 1000;
const maxRecords = 20000;
const fields = ['Arrival_Date', 'State', 'District', 'Market', 'Commodity', 'Variety', 'Grade', 'Min_Price', 'Max_Price', 'Modal_Price'];
const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const rows = [];

for (let offset = 0; ; offset += limit) {
  const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('sort[Arrival_Date]', 'desc');

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
  rows.push(...batch.slice(0, maxRecords - rows.length));
  console.log(`Fetched ${rows.length} records...`);
  if (batch.length < limit || rows.length >= maxRecords || rows.length >= Number(body.total || Infinity)) break;
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
const latestDate = String(rows[0]?.Arrival_Date ?? '');
console.log(`Saved ${rows.length} newest records (latest report date ${latestDate}) to data/mandi-prices.csv from the variety-wise daily market price resource.`);
