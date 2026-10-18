/**
 * KisanPulse AI - Smart Farming Module
 * Static datasets, baseline benchmarks, and agronomic knowledge matrices.
 * All benchmark prices are labeled as illustrative or verified per prompt guidelines.
 */

export const CROPS_CATALOG = [
  {
    id: 'wheat',
    name: 'Wheat (गेहूं)',
    category: 'Rabi',
    msp2026: 2275, // Benchmark MSP in ₹/quintal
    defaultPrice: 2350,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'sowing', label: 'Sowing & Germination (0-20 DAS)', criticalMoisture: true, desc: 'Crown root initiation (CRI) stage — most critical for moisture.' },
      { id: 'tillering', label: 'Tillering & Vegetative (21-45 DAS)', criticalMoisture: false, desc: 'Tillers branching out; requires moderate soil moisture.' },
      { id: 'jointing_booting', label: 'Jointing to Booting (46-70 DAS)', criticalMoisture: true, desc: 'Stem elongation; second critical moisture window.' },
      { id: 'flowering', label: 'Flowering / Anthesis (71-90 DAS)', criticalMoisture: true, desc: 'Heading and pollen fertilization; water stress reduces grain count.' },
      { id: 'milking_dough', label: 'Milking & Dough Stage (91-115 DAS)', criticalMoisture: false, desc: 'Grain formation; light irrigation needed if topsoil is completely dry.' },
      { id: 'maturity', label: 'Maturity / Ripening (116+ DAS)', criticalMoisture: false, desc: 'Withhold water to allow grain dry-down prior to harvesting.' }
    ]
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (धान)',
    category: 'Kharif',
    msp2026: 2300,
    defaultPrice: 2420,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'nursery', label: 'Nursery & Seedling (0-25 DAS)', criticalMoisture: true, desc: 'Maintain thin water layer in seedling beds.' },
      { id: 'transplanting', label: 'Transplanting & Tillering (26-55 DAS)', criticalMoisture: true, desc: 'Critical for root establishment; maintain 2-5 cm standing water.' },
      { id: 'panicle_initiation', label: 'Panicle Initiation (56-75 DAS)', criticalMoisture: true, desc: 'Extreme moisture sensitivity; water stress causes sterile spikelets.' },
      { id: 'flowering', label: 'Flowering (76-95 DAS)', criticalMoisture: true, desc: 'Keep soil saturated to shallow standing water.' },
      { id: 'grain_filling', label: 'Grain Filling (96-115 DAS)', criticalMoisture: false, desc: 'Maintain alternate wetting and drying (AWD) cycle.' },
      { id: 'maturity', label: 'Maturity (116+ DAS)', criticalMoisture: false, desc: 'Drain field 10-14 days before harvest.' }
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed (सरसों)',
    category: 'Rabi',
    msp2026: 5650,
    defaultPrice: 5800,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'seedling', label: 'Seedling (0-25 DAS)', criticalMoisture: false, desc: 'Requires light moisture; avoid waterlogging.' },
      { id: 'rosette_branching', label: 'Rosette & Branching (26-50 DAS)', criticalMoisture: true, desc: 'First critical irrigation stage before flowering.' },
      { id: 'flowering', label: 'Flowering (51-75 DAS)', criticalMoisture: false, desc: 'Avoid heavy flood irrigation during peak bloom to prevent lodging.' },
      { id: 'pod_formation', label: 'Siliquae / Pod Formation (76-100 DAS)', criticalMoisture: true, desc: 'Critical for seed count and oil content.' },
      { id: 'maturity', label: 'Maturity (101+ DAS)', criticalMoisture: false, desc: 'Dry condition essential for seed hardening.' }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton (कपास)',
    category: 'Kharif',
    msp2026: 7122,
    defaultPrice: 7250,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'seedling', label: 'Seedling & Early Vegetative', criticalMoisture: false, desc: 'Deep taproot developing; light watering only.' },
      { id: 'squaring', label: 'Squaring (Bud Formation)', criticalMoisture: true, desc: 'Moisture deficit leads to early square drop.' },
      { id: 'flowering_boll', label: 'Flowering & Boll Development', criticalMoisture: true, desc: 'Peak water requirement stage.' },
      { id: 'boll_opening', label: 'Boll Opening & Harvesting', criticalMoisture: false, desc: 'Stop irrigation to prevent lint discoloration and fiber rot.' }
    ]
  },
  {
    id: 'potato',
    name: 'Potato (आलू)',
    category: 'Rabi / Commercial',
    msp2026: 1250,
    defaultPrice: 1450,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'sprouting', label: 'Sprouting & Emergence', criticalMoisture: false, desc: 'Pre-emergence moisture should be moderate.' },
      { id: 'stolon_initiation', label: 'Stolon & Tuber Initiation', criticalMoisture: true, desc: 'Critical for setting number of tubers per hill.' },
      { id: 'tuber_bulking', label: 'Tuber Bulking', criticalMoisture: true, desc: 'Continuous steady moisture needed to avoid misshapen tubers.' },
      { id: 'haulm_cutting', label: 'Maturity / De-haulming', criticalMoisture: false, desc: 'Cease irrigation 10-12 days before vine killing.' }
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato (टमाटर)',
    category: 'Horticulture',
    msp2026: 1200,
    defaultPrice: 1600,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'transplanting', label: 'Transplanting & Rooting', criticalMoisture: true, desc: 'Critical for establishing root connection.' },
      { id: 'vegetative', label: 'Vegetative Growth', criticalMoisture: false, desc: 'Moderate watering; avoid wet foliage.' },
      { id: 'flowering_fruitset', label: 'Flowering & Fruit Set', criticalMoisture: true, desc: 'Uneven moisture causes blossom end rot and flower drop.' },
      { id: 'fruit_development', label: 'Fruit Development & Ripening', criticalMoisture: true, desc: 'Maintain even moisture to prevent fruit cracking.' }
    ]
  },
  {
    id: 'onion',
    name: 'Onion (प्याज)',
    category: 'Commercial / Vegetable',
    msp2026: 1600,
    defaultPrice: 2100,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'seedling', label: 'Establishment (0-30 DAS)', criticalMoisture: true, desc: 'Shallow fibrous roots require frequent light water.' },
      { id: 'vegetative', label: 'Vegetative Foliage (31-60 DAS)', criticalMoisture: false, desc: 'Steady moisture; avoid water stagnation.' },
      { id: 'bulb_formation', label: 'Bulb Initiation & Development', criticalMoisture: true, desc: 'Critical moisture window; water stress reduces bulb girth.' },
      { id: 'maturity', label: 'Neck Fall & Maturity', criticalMoisture: false, desc: 'Stop watering 15 days before harvest for proper curing.' }
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean (सोयाबीन)',
    category: 'Kharif',
    msp2026: 4892,
    defaultPrice: 4950,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'germination', label: 'Germination & Early Growth', criticalMoisture: false, desc: 'Susceptible to crusted soil and waterlogging.' },
      { id: 'flowering', label: 'Flowering & Pod Initiation', criticalMoisture: true, desc: 'Critical moisture period; stress reduces pod count.' },
      { id: 'pod_filling', label: 'Pod Filling & Seed Expansion', criticalMoisture: true, desc: 'Deficit leads to shriveled beans and yield drop.' },
      { id: 'maturity', label: 'Maturity & Leaf Senescence', criticalMoisture: false, desc: 'Dry weather required for uniform harvest.' }
    ]
  },
  {
    id: 'maize',
    name: 'Maize / Corn (मक्का)',
    category: 'Kharif / Rabi',
    msp2026: 2225,
    defaultPrice: 2280,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'seedling', label: 'Knee High Stage (Vegetative)', criticalMoisture: false, desc: 'Moderate root depth developing.' },
      { id: 'tasseling', label: 'Tasseling & Silking', criticalMoisture: true, desc: 'Most critical window; water stress impairs pollination.' },
      { id: 'grain_filling', label: 'Grain Filling & Milk Stage', criticalMoisture: true, desc: 'Moisture stress leads to poorly filled cobs.' },
      { id: 'maturity', label: 'Black Layer Maturity', criticalMoisture: false, desc: 'No further irrigation needed.' }
    ]
  },
  {
    id: 'gram',
    name: 'Gram / Chickpea (चना)',
    category: 'Rabi / Pulses',
    msp2026: 5440,
    defaultPrice: 5600,
    unit: 'Quintal (100 kg)',
    stages: [
      { id: 'branching', label: 'Pre-flowering / Branching', criticalMoisture: true, desc: 'One light irrigation promotes prolific lateral branching.' },
      { id: 'flowering', label: 'Flowering Stage', criticalMoisture: false, desc: 'DO NOT overwater during flowering; causes flower drop and vegetative surge.' },
      { id: 'pod_development', label: 'Pod Filling Stage', criticalMoisture: true, desc: 'Second light irrigation if soil moisture is severely depleted.' },
      { id: 'maturity', label: 'Pod Drying & Maturity', criticalMoisture: false, desc: 'Requires dry conditions for harvest.' }
    ]
  }
];

export const INITIAL_SAMPLE_MARKETS = [];

export const COMMON_SYMPTOMS = [
  'Yellowing of lower leaves (Chlorosis)',
  'Brown spots or necrotic rings on foliage',
  'Wilting / drooping during daytime',
  'White powdery coating on leaf surface',
  'Leaf curling or puckering',
  'Stem rot / black lesions near soil line',
  'Shot-hole punctures or chewing damage',
  'Stunted growth and poor tillering',
  'Premature fruit or flower drop'
];

export const SAMPLE_WEATHER_HUBS = [
  {
    id: 'karnal',
    name: 'Karnal, Haryana',
    lat: 29.6857,
    lon: 76.9905,
    temp: 28,
    humidity: 58,
    condition: 'Partly Cloudy',
    windSpeedKm: 9,
    rainChancePct: 15,
    advisory: 'Favorable conditions for morning spraying. Wind speed safe for boom sprayers.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 14:30 IST'
  },
  {
    id: 'ludhiana',
    name: 'Ludhiana, Punjab',
    lat: 30.9010,
    lon: 75.8573,
    temp: 29,
    humidity: 52,
    condition: 'Clear Sky',
    windSpeedKm: 12,
    rainChancePct: 5,
    advisory: 'Dry conditions favorable for harvest drying and soil preparation.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 14:00 IST'
  },
  {
    id: 'nashik',
    name: 'Nashik, Maharashtra',
    lat: 19.9975,
    lon: 73.7898,
    temp: 27,
    humidity: 65,
    condition: 'Scattered Clouds',
    windSpeedKm: 14,
    rainChancePct: 30,
    advisory: 'Moderate relative humidity. Monitor vineyards and onion plots for fungal spore pressure.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 13:45 IST'
  },
  {
    id: 'guntur',
    name: 'Guntur, Andhra Pradesh',
    lat: 16.3067,
    lon: 80.4365,
    temp: 31,
    humidity: 74,
    condition: 'Humid & Overcast',
    windSpeedKm: 16,
    rainChancePct: 45,
    advisory: 'High humidity and gusty breeze. Postpone non-systemic foliar spraying until wind settles.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 15:00 IST'
  },
  {
    id: 'indore',
    name: 'Indore, Madhya Pradesh',
    lat: 22.7196,
    lon: 75.8577,
    temp: 28,
    humidity: 55,
    condition: 'Sunny',
    windSpeedKm: 10,
    rainChancePct: 10,
    advisory: 'Ideal moisture evaporation rate. Suitable for inter-row weeding and soil aeration.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 14:15 IST'
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    lat: 26.9124,
    lon: 75.7873,
    temp: 32,
    humidity: 38,
    condition: 'Hot & Dry',
    windSpeedKm: 11,
    rainChancePct: 0,
    advisory: 'High evapotranspiration rate. Check sandy soils for rapid root-zone dry-out.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 13:30 IST'
  },
  {
    id: 'varanasi',
    name: 'Varanasi, Uttar Pradesh',
    lat: 25.3176,
    lon: 82.9739,
    temp: 29,
    humidity: 62,
    condition: 'Mild & Sunny',
    windSpeedKm: 8,
    rainChancePct: 10,
    advisory: 'Optimal light and calm winds. Excellent window for fertilizer application.',
    source: 'Illustrative Agrometeorological Benchmark',
    updatedAt: 'Today, 14:45 IST'
  }
];
