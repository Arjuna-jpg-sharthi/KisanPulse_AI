# KisanPulse AI

## Live mandi prices

The dashboard and Smart Mandi view read reported prices from the data.gov.in mandi resource through the Node server. The API key stays on the server and is never included in the browser bundle.

### Render configuration

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variable: `DATA_GOV_IN_API_KEY` (add the key as the value in Render's Environment settings)

The app's `/api/mandi-prices` endpoint reads the [Variety-wise Daily Market Prices Data of Commodity](https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity) resource, sorts the records newest first, and caches each query for 15 minutes. The resource contains extensive historical data, so the CSV exporter stores only the newest 20,000 records. AGMARKNET records are daily reports, not second-by-second market quotes. The UI displays each record's reported date and does not invent arrivals, price trends, or MSP comparisons.

### CSV snapshot fallback

If the Render service cannot reach the live provider, the server can return records from `data/mandi-prices.csv`. The file is a daily snapshot and must be refreshed; it is not live data. To generate it from a computer that can reach data.gov.in:

1. Copy `.env.example` to `.env` and enter the key you already have in Render in the local `.env` file. Keep `.env` private; it is ignored by Git.
2. Run `npm install`, then `npm run export:mandi`. This writes up to the 20,000 newest source records to `data/mandi-prices.csv` without printing the key.
3. Commit and push the updated CSV. Render will redeploy and use the snapshot when the live request detects failure.

The source provides daily wholesale min, max, and modal prices. Always show the record date and verify prices with AGMARKNET before transactions.

### Local development

Run `npm run dev:api` in one terminal and `npm run dev` in another. The Vite development server proxies `/api` requests to the local Node server. Set `DATA_GOV_IN_API_KEY` in a local `.env` file (never commit it).
