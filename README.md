# KisanPulse AI

## Live mandi prices

The dashboard and Smart Mandi view read reported prices from the data.gov.in mandi resource through the Node server. The API key stays on the server and is never included in the browser bundle.

### Render configuration

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variable: `DATA_GOV_IN_API_KEY` (add the key as the value in Render's Environment settings)

The app's `/api/mandi-prices` endpoint returns the latest available government records and caches each query for 15 minutes. AGMARKNET records are daily reports, not second-by-second market quotes. The UI displays each record's reported date and does not invent arrivals, price trends, or MSP comparisons.

### Local development

Run `npm run dev:api` in one terminal and `npm run dev` in another. The Vite development server proxies `/api` requests to the local Node server. Set `DATA_GOV_IN_API_KEY` in a local `.env` file (never commit it).
