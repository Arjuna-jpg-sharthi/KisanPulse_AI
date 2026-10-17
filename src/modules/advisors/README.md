# KisanPulse AI — Farm Decision Advisors (`src/modules/advisors`)

## 🌾 Overview
The **Farm Decision Advisors** module provides high-integrity post-harvest and crop-window decision support for Indian smallholder and commercial farmers.

All code and styles are strictly self-contained within `src/modules/advisors/**` using existing project dependencies (`react`, `react-dom`, `lucide-react`) and design tokens from `src/styles/variables.css`.

---

## 📦 Exported Components & Public APIs

### 1. `FarmAdvisorsModule` (Default Export)
Unified container rendering the full advisor suite with tabbed navigation:
- **Tab 1: "Which crop should I sell first?"** (`SellFirstAdvisor`)
- **Tab 2: Short-Duration Crop Window Demo** (`AlternateCropAdvisor`)
- **Tab 3: Agronomic Methodology & Integrity Documentation**

#### Props:
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `language` | `'en' \| 'hi'` | `'en'` | Bilingual UI (English / Hindi). |
| `isOffline` | `boolean` | `false` | Offline network indicator. |
| `onNavigate` | `function` | `undefined` | App shell view router callback (e.g. `(viewId) => void`). |
| `defaultTab` | `'sellFirst' \| 'alternateCrop' \| 'methodology'` | `'sellFirst'` | Active tab on load. |

---

### 2. `SellFirstAdvisor`
Standalone component implementing the **"Which crop should I sell first?"** advisor.

#### Capabilities:
1. **Multi-Lot Inventory Input**:
   - Crop selection from ICAR catalog (Tomato, Onion, Potato, Wheat, Paddy, Mustard, Gram, Soybean, Maize) or custom crop.
   - Quantity in quintals.
   - Harvest date / storage start date.
   - Storage condition (Ambient Shed, Uncovered Field, Ventilated Godown, Hermetic Bag, Cold Storage).
   - Optional custom shelf-life override (days).
   - Optional active buyer offer details (buyer name, offered price ₹/q, expiration in days).
2. **Urgency Scoring Algorithm**:
   - Computes days elapsed in storage: $D = \max(0, \text{CurrentDate} - \text{HarvestDate})$.
   - Effective safe shelf-life: $S = \text{CustomDays} \lor (\text{BaseAmbientDays} \times \text{StorageModifier})$.
   - Safe shelf-life exhausted ratio: $R = D / S$.
   - Physiological perishability weighting (High, Medium, Low).
   - Storage hazard adjustments (e.g. $+12$ penalty for uncovered field storage).
   - Buyer offer expiration pressure (urgent decision window if offer expires in $\le 2$ days).
   - Categorizes into: `Critical (80-100)`, `High (60-79)`, `Moderate (40-59)`, `Safe (0-39)`.
3. **Transparent Explainability ("Why this rank?")**:
   - Itemized agronomic reasons displayed on every card.
   - Pairwise comparative explanations between adjacent ranked lots (e.g. Why Rank #1 must be sold before Rank #2).
4. **Strict Price Momentum Integrity Rule**:
   - Explicitly displays: *"Real-time price momentum is currently unavailable (no active Agmarknet / e-NAM ticker connected). Urgency is calculated strictly from physical perishability, storage age, and entered offers. No synthetic price curves or demand trends are fabricated."*

---

### 3. `AlternateCropAdvisor`
Short-duration catch crop window demo ("what to grow in the meanwhile").

#### Capabilities:
1. **Farm Context Filters**:
   - Agro-climatic region (Northern Plains, Central India, Western Semi-Arid, Eastern Plains, Southern Peninsula).
   - Fallow season window (Zaid / Summer March-June, Pre-Kharif May-July, Post-Kharif Oct-Nov, Short Winter Nov-Jan).
   - Available days before next primary sowing (e.g., 45, 60, 75, 90 days).
   - Soil texture context (Sandy Loam, Clay Loam / Alluvial, Deep Black Cotton, Red Laterite).
   - Water availability (Assured Tube-well/Canal, Limited Protective 1-2 waterings, Rainfed / Residual moisture).
2. **Deterministic Agronomic Shortlist**:
   - Verified short-duration crops: Summer Moong (60-68d), Short-Duration Urad (65-75d), Cowpea/Lobia (45-60d), Cucumber/Kakri (50-65d), Fast-Cycle Spinach (30-45d), Summer Sesame (75-85d), Dhaincha Green Manure (40-50d).
   - Excluded candidates drawer with transparent reasons (e.g. insufficient days, water deficit, soil mismatch).
3. **Mandatory Non-Prescription Notice & KVK Verification**:
   - Clear advisory directing farmers to verify seed varieties with their district Krishi Vigyan Kendra (KVK) or the National Kisan Call Centre (Toll-Free 1800-180-1551).

---

## 🔌 Integration Snippet for Integration Lead

To mount this module in KisanPulse AI, the integration lead can import `FarmAdvisorsModule` into `App.jsx` or `ModuleContainer.jsx`:

```jsx
// Example A: Direct inclusion in App.jsx
import FarmAdvisorsModule from './modules/advisors/FarmAdvisorsModule';

// Inside renderCurrentView() switch statement:
case 'advisors':
  return (
    <FarmAdvisorsModule
      language={language}
      isOffline={isOffline}
      onNavigate={setCurrentView}
    />
  );
```

```jsx
// Example B: In Navigation.jsx NAVIGATION_ITEMS array:
{
  id: 'advisors',
  labelKey: 'navAdvisors',
  defaultLabel: 'Farm Decision Advisors',
  icon: Clock,
  badge: 'New'
}
```

---

## ⚖️ Key Assumptions & Documented Future Work

### Verified Assumptions:
1. **ICAR Post-Harvest Baseline**: Ambient storage lifetimes are based on standard Indian agronomic baselines (e.g., ambient tomato: 7-9 days; ventilated onion: 50-70 days; dry wheat <12% moisture: 250-365 days).
2. **Storage Multipliers**: Uncovered storage decreases safe duration by $40\%$; ventilated godowns extend safe holding by $40\%$; hermetic bags eliminate insect degradation in dry grains ($2.2\times$ factor); cold storage provides $3.5\times$ life for potatoes/vegetables.
3. **No Sensor Overclaims**: Smartphones do not possess humidity sensors inside grain sacks or soil electrical conductivity probes. All inputs are farmer-reported.

### Documented Future Work:
- **Streaming Mandi Ticker**: Dynamic price momentum weighting once live Agmarknet / e-NAM WebSockets are provisioned.
- **Micro-Climate Satellite Precipitation**: Connecting IMD block-level rainfall forecasts into storage humidity alerts.
- **Relay Intercropping in Orchards**: Multi-canopy shade-tolerant catch cropping models.
