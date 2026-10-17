# KisanPulse AI — Smart Farming & Crop Health Module (`src/modules/farming`)

## 🌾 Overview
The **Smart Farming & Crop Health Module** is a core sub-system of **KisanPulse AI**, engineered to empower smallholder and commercial farmers with high-integrity agronomic decision support and profit-maximizing market intelligence.

Built within a shared React + Vite repository, this module is strictly self-contained within `src/modules/farming/**` and exports `FarmingModule` as its default component. All styling is strictly isolated using the `farming-` CSS namespace.

---

## 🚀 Key Modules & Capabilities

### Part A: Smart Mandi and Farm Profit Engine
1. **Dynamic Multi-Mandi Comparison**: Select from 10+ standard Indian crops (Wheat, Paddy, Mustard, Cotton, Potato, Tomato, Onion, Soybean, Maize, Gram) or enter a custom crop. Input quantity in quintals and compare two or more market channels.
2. **Comprehensive Cost Breakdown**: Editable itemized expenses for every market:
   - Transit / Freight (₹)
   - Labor Loading & Unloading (₹)
   - APMC Mandi Fee / Cess (₹)
   - Weighbridge & Miscellaneous Overheads (₹)
3. **Transparent Financial Formulas**:
   $$\text{Gross Revenue} = \text{Quantity (q)} \times \text{Selling Price per Quintal}$$
   $$\text{Total Costs} = \text{Transport} + \text{Loading} + \text{Mandi Fees} + \text{Other Costs}$$
   $$\text{Estimated Net Proceeds} = \text{Gross Revenue} - \text{Total Costs}$$
   $$\text{Net Proceeds per Quintal} = \frac{\text{Estimated Net Proceeds}}{\text{Quantity (q)}}$$
4. **Ranking & "Why This Market Ranks Higher" Explanatory Engine**:
   - Automatically sorts markets in descending order of **Estimated Net Proceeds**.
   - Solves the deceptive sticker price problem: explicitly demonstrates when a market with a lower headline price delivers *higher take-home profit* than a higher-priced market burdened with heavy freight or mandi cess.
5. **Interactive Comparison Bar Chart**: Accessible pure SVG horizontal bar chart visually contrasting Gross Revenue, Total Costs, and In-hand Net Proceeds across all compared options.
6. **Data Integrity & Benchmark Transparency**:
   - Pre-loaded with realistic benchmark data so the module functions immediately without requiring an API key.
   - Distinct badges identify data origin (`e-NAM Verified Mandi Rate` vs `Agmarknet Illustrative Benchmark`).
   - Stale data alerts when offline or using cached figures older than 24 hours.
   - **No fabricated live prices**: benchmark assumptions are explicitly disclosed.
7. **Local Buyer Enquiry Drafts**:
   - Farmers can draft negotiation terms and target delivery points.
   - Saved locally in browser `localStorage`.
   - Explicit disclaimer: *"Draft saved locally on this device. This enquiry has not been sent over the network."*

---

### Part B: Crop Health Observation & Reporting
1. **Field Symptom Recording**: Select crop and describe observed conditions or tap quick-select agronomic symptom chips (e.g., chlorosis, rust spots, wilting, powdery mildew).
2. **Photo Capture with Automatic Offline Compression**:
   - Camera and file upload support (`accept="image/*"`).
   - In-browser HTML5 Canvas compression (`compressImageFile`) scales photos to 800px max dimension and compresses JPEG quality to 70%, preserving device `localStorage` quota.
   - Live photo preview with one-tap removal.
3. **Report History & Reopening**: Saved observation logs can be reopened, reviewed with full photo previews, and shared during physical consultations.
4. **Diagnostic Integrity & Cautious Guidance**:
   - **Strictly refuses to claim automated disease diagnosis**: visual symptoms frequently overlap across fungal, viral, and abiotic soil deficiencies.
   - Provides systematic quarantine and observational guidance (isolating infected plots, disinfecting shears, checking leaf undersides).
   - Directs farmers to their local **Krishi Vigyan Kendra (KVK)** or block agricultural officer for physical sample pathology testing.

---

### Part C: Basic Irrigation Guidance
1. **Crop Physiological Stages**: Dynamic growth stage selector calibrated to crop-specific water sensitivity (e.g., Crown Root Initiation in Wheat, Panicle Initiation in Rice).
2. **Transparent Agronomic Rule Matrix**: Integrates rainfall in the last 48 hours, qualitative soil hand-feel checks (15 cm depth), and days since last watering.
3. **No Sensor Overclaims & No Pseudo-Precise Volumes**:
   - Explicit callout: **Smartphones do NOT have sensors that measure physical soil moisture.**
   - Avoids unsupported arbitrary volume recommendations (e.g. "apply 37.4 liters"); provides actionable operational windows (e.g. "Priority irrigation within 24-48 hours", "Postpone 4-7 days due to heavy rain").
4. **Model Assumptions Disclosed**: Discloses assumed loamy soil profile, root depth (40-60 cm), and average evapotranspiration.

---

### Part D: Agricultural Weather & Spray Window Panel
1. **Multi-Hub Selection**: Pre-configured for prominent agricultural regions (Karnal, Ludhiana, Nashik, Guntur, Indore, Jaipur, Varanasi).
2. **Live Open-Meteo Integration with Graceful Fallback**:
   - When online, fetches live non-commercial meteorological forecasts without requiring an API key.
   - When offline or during network dropouts, seamlessly falls back to pre-configured illustrative benchmark weather data with clear source badges.
3. **Actionable Farm Advisories**:
   - Wind speed drift warnings (> 15 km/h: delay spraying).
   - Humidity fungal pressure indicators (> 70% RH).
   - Rain probability top-dressing cautions (> 40% rain probability).

---

### Part E: Offline Support & Resilience
- **Offline First**: Calculations, irrigation rules, report history, and buyer drafts operate 100% client-side without network calls.
- **Persistent Storage**: Uses `localStorage` with quota-safe keys (`kisanpulse_crop_reports`, `kisanpulse_market_drafts`).
- **Connection Awareness**: Reacts in real-time to `window.online` and `window.offline` events, displaying descriptive cached-data warnings.
- **Honest Communications**: Never claims an enquiry or report reached an external server unless genuine transmission occurred.

---

## 📁 Files Created

| File | Purpose |
|---|---|
| `src/modules/farming/FarmingModule.jsx` | Main React module component with tabs for Mandi, Health, Irrigation, and Weather. |
| `src/modules/farming/farming.css` | Scoped CSS stylesheet using `farming-` namespace. |
| `src/modules/farming/farmingUtils.js` | Financial calculation formulas, validation, explanation generator, irrigation rules, and storage utils. |
| `src/modules/farming/farmingData.js` | Crops catalog (MSP, stages), default mandi benchmarks, symptom chips, and weather hubs. |
| `src/modules/farming/README.md` | Module technical documentation, formulas, and usage guide. |

---

## 🛠️ Setup & Running

```bash
# 1. Navigate to the project directory
cd kisanpulse

# 2. Install dependencies (React, React-DOM, Vite)
npm install

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build

# 5. Preview production build
npm run preview
```

---

## 🌿 Git Branch & Pull Request Instructions

1. **Current Working Branch**: `feature/smart-farming`
2. **Reviewing Changes**:
   ```bash
   git status
   git log --oneline -n 5
   ```
3. **Pushing to Remote & Creating PR**:
   ```bash
   # Add your team's remote if not already added
   git remote add origin <YOUR_GITHUB_REPOSITORY_URL>

   # Push the feature branch
   git push -u origin feature/smart-farming
   ```
4. **Open Pull Request**:
   - Go to GitHub repository page.
   - Click **"Compare & pull request"** from branch `feature/smart-farming` into `main`.
   - Title: `feat(farming): implement smart mandi engine, crop health logs, irrigation guide & weather panel`.
   - Request review from teammate (Member 1 / Schemes module maintainer).

---

## ⚠️ Known Limitations & Future Roadmap
1. **Soil Moisture Sensing**: Requires physical IoT tensiometer probes or LoRaWAN soil capacitance sensors for automated moisture telemetry; smartphone apps can only accept manual farmer hand-feel observations.
2. **Live Mandi Rates**: Live daily mandi rates require integration with official Government of India Agmarknet / e-NAM APIs (which require departmental API credentials and IP whitelisting). Current figures are benchmark averages.
3. **Computer Vision Disease Model**: Automated disease identification is deliberately disabled to avoid false positives. Future versions will integrate on-device TensorFlow Lite models trained on ICAR plant pathology datasets with confidence intervals.
