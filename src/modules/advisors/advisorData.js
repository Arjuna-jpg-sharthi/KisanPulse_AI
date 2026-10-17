/**
 * KisanPulse AI - Farm Decision Advisors
 * Static datasets, baseline shelf-life parameters, storage modifiers,
 * and agronomic rule matrices for short-duration crop windows.
 *
 * NOTE ON DATA INTEGRITY:
 * Baseline storage values are derived from standard ICAR / post-harvest agronomic benchmarks.
 * Real-time price trends are NOT fabricated; price momentum is flagged as unavailable
 * whenever a live ticker is not connected.
 */

// ============================================================================
// PART 1: STORED CROP SHELF-LIFE & PERISHABILITY CATALOG
// ============================================================================

export const STORAGE_CONDITIONS = [
  {
    id: 'ambient_shed',
    labelEn: 'Ambient Traditional Room / Open Shed',
    labelHi: 'पारंपरिक कमरा / खुला शेड (साधारण तापमान)',
    modifier: 1.0,
    descEn: 'Subject to ambient room temperature and humidity fluctuations. Standard baseline.',
    descHi: 'सामान्य तापमान और आर्द्रता। मानक आधारभूत स्थिति।'
  },
  {
    id: 'uncovered_field',
    labelEn: 'Farm Yard / Uncovered / Tarpaulin',
    labelHi: 'खेत / तिरपाल के नीचे (खुला)',
    modifier: 0.6,
    descEn: 'Exposed to sun, night dew, pests, and moisture. Spoilage accelerates significantly.',
    descHi: 'धूप, ओस और कीटों का जोखिम। फसल जल्दी खराब होती है।'
  },
  {
    id: 'ventilated_godown',
    labelEn: 'Ventilated Pucca Godown / Warehouse',
    labelHi: 'हवादार पक्का गोदाम / भंडार गृह',
    modifier: 1.4,
    descEn: 'Good cross-ventilation, rodent protection, raised wooden crates/pallets.',
    descHi: 'अच्छा वेंटिलेशन, चूहों से बचाव, जमीन से ऊपर क्रेट्स।'
  },
  {
    id: 'hermetic_bag',
    labelEn: 'Hermetic Bag / PICS Bag / Sealed Silo',
    labelHi: 'एयर-टाइट बैग (PICS / हर्मेटिक साइलो)',
    modifier: 2.2,
    descEn: 'Oxygen-depleting hermetic storage. Stops insect pests in dry grains without chemicals.',
    descHi: 'कीट-मुक्त वायुरोधी बैग। अनाज और दालों के लिए उत्कृष्ट।'
  },
  {
    id: 'cold_storage',
    labelEn: 'Commercial Cold Storage (Chilled)',
    labelHi: 'कोल्ड स्टोरेज (प्रशीतित)',
    modifier: 3.5,
    descEn: 'Controlled temperature (2°C - 8°C) and relative humidity for horticultural perishables.',
    descHi: 'नियंत्रित तापमान और नमी। आलू और बागवानी फसलों के लिए।'
  }
];

export const CROP_PERISHABILITY_CATALOG = [
  {
    id: 'tomato',
    nameEn: 'Tomato (टमाटर)',
    nameHi: 'टमाटर',
    category: 'horticulture',
    perishability: 'high', // high | medium | low
    baseAmbientShelfLifeDays: 8,
    benchmarkMsp: 1200,
    supportedStorageTypes: ['ambient_shed', 'uncovered_field', 'ventilated_godown', 'cold_storage'],
    damageRisksEn: 'Skin wrinkling, black mold, rotting, softening, fruit fly infestation.',
    damageRisksHi: 'झुर्रियां, सड़न, फफूंद, छिलके का मुलायम होना, मक्खी का प्रकोप।',
    holdingAdvisoryEn: 'Extremely perishable. Holding in non-cold conditions beyond 5-7 days leads to massive distress discount.',
    holdingAdvisoryHi: 'अति-संवेदनशील। साधारण शेड में 5-7 दिन से अधिक रोकने पर भारी नुकसान हो सकता है।'
  },
  {
    id: 'green_chilli',
    nameEn: 'Green Chilli (हरी मिर्च)',
    nameHi: 'हरी मिर्च',
    category: 'horticulture',
    perishability: 'high',
    baseAmbientShelfLifeDays: 10,
    benchmarkMsp: 2200,
    supportedStorageTypes: ['ambient_shed', 'uncovered_field', 'ventilated_godown', 'cold_storage'],
    damageRisksEn: 'Weight loss, moisture shrinkage, reddening/turning ripe, stem rot.',
    damageRisksHi: 'वजन में कमी, सूखना, लाल पड़ना, डंठल का सड़ना।',
    holdingAdvisoryEn: 'Moisture loss reduces market weight and visual crispness quickly.',
    holdingAdvisoryHi: 'तेजी से वजन और ताजगी खोती है। तुरंत बेचना हितकर है।'
  },
  {
    id: 'onion',
    nameEn: 'Onion (प्याज)',
    nameHi: 'प्याज',
    category: 'semi_perishable',
    perishability: 'medium',
    baseAmbientShelfLifeDays: 60,
    benchmarkMsp: 1600,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'uncovered_field'],
    damageRisksEn: 'Sprouting in high humidity, black mold (Aspergillus), neck rot, weight shrinkage.',
    damageRisksHi: 'अंकुरण (उगना), काली फफूंद, गर्दन सड़न, वजन का घटना।',
    holdingAdvisoryEn: 'Needs dry cross-ventilation. High humidity or damp floors trigger sprouting and rapid weight loss.',
    holdingAdvisoryHi: 'सूखी और हवादार जगह अनिवार्य। सीलन से अंकुरण और सड़न बढ़ती है।'
  },
  {
    id: 'potato',
    nameEn: 'Potato (आलू)',
    nameHi: 'आलू',
    category: 'semi_perishable',
    perishability: 'medium',
    baseAmbientShelfLifeDays: 45,
    benchmarkMsp: 1250,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'cold_storage'],
    damageRisksEn: 'Greening from direct light exposure (solanine buildup), sprouting, soft rot.',
    damageRisksHi: 'रोशनी से हरा होना (सोलेनाइन), अंकुरण, मुलायम सड़न।',
    holdingAdvisoryEn: 'Keep in dark, cool storage. Avoid light exposure which turns tubers green and unmarketable.',
    holdingAdvisoryHi: 'अंधेरे और ठंडे स्थान पर रखें। सीधी रोशनी से आलू हरा और अयोग्य हो जाता है।'
  },
  {
    id: 'wheat',
    nameEn: 'Wheat (गेहूं)',
    nameHi: 'गेहूं',
    category: 'cereal',
    perishability: 'low',
    baseAmbientShelfLifeDays: 300,
    benchmarkMsp: 2275,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Lesser grain borer, khapra beetle, moisture condensation, fungal heating.',
    damageRisksHi: 'घुन (कीट), खपरा बीटल, नमी से फफूंद लगना।',
    holdingAdvisoryEn: 'Safe for extended holding if grain moisture is strictly below 12%. Regular aeration needed.',
    holdingAdvisoryHi: 'यदि दानों में नमी 12% से कम है तो लंबे समय तक सुरक्षित रखा जा सकता है।'
  },
  {
    id: 'paddy',
    nameEn: 'Paddy / Basmati Rice (धान / बासमती)',
    nameHi: 'धान / बासमती',
    category: 'cereal',
    perishability: 'low',
    baseAmbientShelfLifeDays: 270,
    benchmarkMsp: 2320,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Grain discoloration, rice weevil, rancidity in high humidity.',
    damageRisksHi: 'दानों का रंग उड़ना, सुंडी/घुन, दुर्गंध।',
    holdingAdvisoryEn: 'Maintain below 13% moisture. Basmati aging can increase value if kept pest-free.',
    holdingAdvisoryHi: '13% से कम नमी रखें। उचित भंडार में बासमती पुरानी होने पर मूल्य बढ़ सकता है।'
  },
  {
    id: 'mustard',
    nameEn: 'Mustard / Rapeseed (सरसों)',
    nameHi: 'सरसों / राई',
    category: 'oilseed',
    perishability: 'low',
    baseAmbientShelfLifeDays: 240,
    benchmarkMsp: 5650,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Oil acidification (free fatty acids rise), heating in high-moisture heaps.',
    damageRisksHi: 'तेल की गुणवत्ता घटना (खट्टापन), ढेर में गर्मी पैदा होना।',
    holdingAdvisoryEn: 'Moisture must be below 8% to prevent fungal heating and seed deterioration.',
    holdingAdvisoryHi: '8% से कम नमी सुनिश्चित करें ताकि दानों में गर्मी और तेल गिरावट न हो।'
  },
  {
    id: 'gram',
    nameEn: 'Gram / Chickpea (चना)',
    nameHi: 'चना',
    category: 'pulse',
    perishability: 'low',
    baseAmbientShelfLifeDays: 240,
    benchmarkMsp: 5440,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Pulse beetle (Callosobruchus), hollow seeds, powdery residue.',
    damageRisksHi: 'ढोरा/दाल का कीट, दानों का खोखला होना।',
    holdingAdvisoryEn: 'Extremely prone to pulse beetle attack in traditional jute bags. Hermetic bags recommended.',
    holdingAdvisoryHi: 'जूट की बोरियों में कीटों का भारी खतरा रहता है। वायुरोधी बैग में रखना सर्वोत्तम है।'
  },
  {
    id: 'soybean',
    nameEn: 'Soybean (सोयाबीन)',
    nameHi: 'सोयाबीन',
    category: 'oilseed',
    perishability: 'low',
    baseAmbientShelfLifeDays: 210,
    benchmarkMsp: 4892,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Seed coat cracking, loss of germination vigor, oil rancidity.',
    damageRisksHi: 'छिलका फटना, अंकुरण क्षमता घटना, तेल में खराबी।',
    holdingAdvisoryEn: 'Sensitive to mechanical handling and ambient humidity swings.',
    holdingAdvisoryHi: 'नमी के उतार-चढ़ाव से बीज की गुणवत्ता तेजी से गिरती है।'
  },
  {
    id: 'maize',
    nameEn: 'Maize / Corn (मक्का)',
    nameHi: 'मक्का',
    category: 'cereal',
    perishability: 'low',
    baseAmbientShelfLifeDays: 240,
    benchmarkMsp: 2225,
    supportedStorageTypes: ['ambient_shed', 'ventilated_godown', 'hermetic_bag'],
    damageRisksEn: 'Aflatoxin mold, grain weevil, moisture rot.',
    damageRisksHi: 'एफ्लाटॉक्सिन फफूंद, घुन, सीलन।',
    holdingAdvisoryEn: 'Dry thoroughly to 12% moisture before bagging. Mold growth causes severe market rejection.',
    holdingAdvisoryHi: 'बोरी में भरने से पहले 12% नमी तक सुखाएं। फफूंद लगने पर मंडी में अस्वीकार हो सकता है।'
  }
];

// Sample benchmark dataset for 1-click test drive
export const INITIAL_SAMPLE_STORED_CROPS = [
  {
    id: 'lot-1',
    cropId: 'tomato',
    cropNameCustom: '',
    quantity: 35,
    quantityUnit: 'Quintals',
    harvestDate: '2026-10-12', // 6 days ago (assuming current date 2026-10-18)
    storageCondition: 'ambient_shed',
    customShelfLifeDays: '',
    hasBuyerOffer: true,
    buyerName: 'Aggregator Sharma Trading',
    offeredPrice: 1550, // ₹/quintal
    offerExpiresInDays: 2,
    storageNotes: 'Stored in plastic crates inside semi-open shade.'
  },
  {
    id: 'lot-2',
    cropId: 'onion',
    cropNameCustom: '',
    quantity: 80,
    quantityUnit: 'Quintals',
    harvestDate: '2026-09-03', // 45 days ago
    storageCondition: 'ventilated_godown',
    customShelfLifeDays: '',
    hasBuyerOffer: false,
    buyerName: '',
    offeredPrice: '',
    offerExpiresInDays: '',
    storageNotes: 'Raised bamboo racks with ceiling fans running.'
  },
  {
    id: 'lot-3',
    cropId: 'wheat',
    cropNameCustom: '',
    quantity: 120,
    quantityUnit: 'Quintals',
    harvestDate: '2026-05-15', // ~155 days ago
    storageCondition: 'ventilated_godown',
    customShelfLifeDays: '',
    hasBuyerOffer: true,
    buyerName: 'National Flour Mill Co.',
    offeredPrice: 2450,
    offerExpiresInDays: 7,
    storageNotes: 'Double-stitched jute bags stacked on wooden dunnage.'
  },
  {
    id: 'lot-4',
    cropId: 'potato',
    cropNameCustom: '',
    quantity: 150,
    quantityUnit: 'Quintals',
    harvestDate: '2026-03-20',
    storageCondition: 'cold_storage',
    customShelfLifeDays: 180,
    hasBuyerOffer: false,
    buyerName: '',
    offeredPrice: '',
    offerExpiresInDays: '',
    storageNotes: 'Commercial facility; storage rent ₹30/bag/month accumulating.'
  }
];

// ============================================================================
// PART 2: SHORT-DURATION CROP-WINDOW RULES & CATALOG
// ============================================================================

export const REGIONS_CATALOG = [
  { id: 'north_plains', labelEn: 'Northern Plains (PB, HR, Western UP, North RJ)', labelHi: 'उत्तरी मैदानी क्षेत्र (पंजाब, हरियाणा, प. उप्र, राजस्थान)' },
  { id: 'central_india', labelEn: 'Central India (MP, Bundelkhand, Vidarbha)', labelHi: 'मध्य भारत (मप्र, बुंदेलखंड, विदर्भ)' },
  { id: 'western_arid', labelEn: 'Western Semi-Arid / Coastal (GJ, Marathwada)', labelHi: 'पश्चिमी शुष्क / तटीय (गुजरात, मराठवाड़ा)' },
  { id: 'eastern_plains', labelEn: 'Eastern Indo-Gangetic Plains (Bihar, Eastern UP, WB)', labelHi: 'पूर्वी मैदानी क्षेत्र (बिहार, पू. उप्र, प. बंगाल)' },
  { id: 'southern_peninsula', labelEn: 'Southern Deccan & Coastal (AP, Telangana, KA, TN)', labelHi: 'दक्षिण प्रायद्वीप (आंध्र, तेलंगाना, कर्नाटक, तमिलनाडु)' }
];

export const SEASONS_CATALOG = [
  { id: 'zaid_summer', labelEn: 'Summer / Zaid Window (March – June, between Rabi & Kharif)', labelHi: 'जायद / ग्रीष्मकालीन विंडो (मार्च – जून, रबी और खरीफ के बीच)' },
  { id: 'early_kharif', labelEn: 'Pre-Kharif / Early Monsoon (May – July)', labelHi: 'प्री-खरीफ / मानसूनी शुरुआत (मई – जुलाई)' },
  { id: 'post_kharif', labelEn: 'Post-Kharif / Pre-Rabi Window (October – November)', labelHi: 'खरीफ बाद / रबी पूर्व विंडो (अक्टूबर – नवंबर)' },
  { id: 'winter_short', labelEn: 'Short Winter Window (November – January)', labelHi: 'लघु शीतकालीन विंडो (नवंबर – जनवरी)' }
];

export const SOIL_TYPES = [
  { id: 'sandy_loam', labelEn: 'Sandy Loam (Light, well-draining, warms fast)', labelHi: 'बलुई दोमट (हल्की, अच्छा जल निकास)' },
  { id: 'clay_loam', labelEn: 'Clay Loam / Alluvial (Fertile, moisture-retentive)', labelHi: 'दोमट / जलोढ़ (उपजाऊ, नमी रोकने वाली)' },
  { id: 'black_cotton', labelEn: 'Deep Black Soil (Heavy clay, cracks on drying, high CEC)', labelHi: 'काली मिट्टी (चिकनी, भारी, जल धारण क्षमता)' },
  { id: 'red_laterite', labelEn: 'Red / Lateritic Soil (Porous, acidic/neutral, low organic)', labelHi: 'लाल / लेटराइट मिट्टी (हल्की अम्लीय)' }
];

export const WATER_LEVELS = [
  { id: 'assured_tube', labelEn: 'Assured Irrigation (Tube-well / Borewell / Canal on demand)', labelHi: 'सुनिश्चित सिंचाई (ट्यूबवेल / नहर उपलब्ध)' },
  { id: 'limited_protective', labelEn: 'Limited Irrigation (1 to 2 protective waterings available)', labelHi: 'सीमित सिंचाई (1 से 2 बार पानी संभव)' },
  { id: 'rainfed_residual', labelEn: 'Rainfed / Soil Residual Moisture Only (No assured pump)', labelHi: 'वर्षा आधारित / केवल बची हुई नमी (पंप नहीं)' }
];

export const SHORT_DURATION_CROPS = [
  {
    id: 'moong_summer',
    nameEn: 'Summer Moong / Green Gram (ग्रीष्मकालीन मूंग)',
    nameHi: 'ग्रीष्मकालीन मूंग',
    minDays: 60,
    maxDays: 68,
    benchmarkYieldQuintalPerAcre: '4 - 6',
    suitableSeasons: ['zaid_summer'],
    suitableRegions: ['north_plains', 'central_india', 'eastern_plains', 'western_arid'],
    suitableSoils: ['sandy_loam', 'clay_loam'],
    minWaterLevel: 'limited_protective',
    nitrogenFixationKgPerHa: '30 - 35 kg N/ha',
    seedVarieties: ['SML 668', 'IPM 205-7 (Virat)', 'Pusa Vishal', 'GAM 5'],
    benefitsEn: 'Adds biological nitrogen to soil for next paddy/maize crop. High market demand for pulses. 60-day turnaround.',
    benefitsHi: 'अगली फसल के लिए मिट्टी में 30-35 किलो नाइट्रोजन जोड़ती है। दलहन का अच्छा बाजार भाव।',
    cautionsEn: 'Susceptible to Yellow Mosaic Virus (YMV); select YMV-resistant certified seed. Requires at least 2-3 irrigations in summer heat.',
    cautionsHi: 'पीला मोजेक वायरस (YMV) का खतरा रहता है; प्रमाणित प्रतिरोधी बीज ही लें। तेज गर्मी में 2-3 पानी जरूरी।'
  },
  {
    id: 'urad_short',
    nameEn: 'Short-Duration Urad / Black Gram (उड़द)',
    nameHi: 'लघु अवधि उड़द',
    minDays: 65,
    maxDays: 75,
    benchmarkYieldQuintalPerAcre: '3.5 - 5.5',
    suitableSeasons: ['zaid_summer', 'post_kharif'],
    suitableRegions: ['central_india', 'north_plains', 'southern_peninsula'],
    suitableSoils: ['clay_loam', 'black_cotton'],
    minWaterLevel: 'limited_protective',
    nitrogenFixationKgPerHa: '25 - 30 kg N/ha',
    seedVarieties: ['Pant U-31', 'Mash 114', 'IPU 2-43'],
    benefitsEn: 'Improves soil physical structure, fixes nitrogen, stable local dal mill demand.',
    benefitsHi: 'मिट्टी की बनावट सुधारती है, नाइट्रोजन स्थिरीकरण करती है, दाल मिलों में निरंतर मांग।',
    cautionsEn: 'Extremely sensitive to waterlogging. Ensure field slope and surface drainage.',
    cautionsHi: 'जलभराव बिल्कुल सहन नहीं कर सकती। खेत में जल निकासी का पूरा प्रबंध रखें।'
  },
  {
    id: 'cowpea_lobia',
    nameEn: 'Cowpea / Lobia (लोबिया / चंवला)',
    nameHi: 'लोबिया / चंवला',
    minDays: 45,
    maxDays: 60,
    benchmarkYieldQuintalPerAcre: '20 - 35 (green pods)',
    suitableSeasons: ['zaid_summer', 'early_kharif'],
    suitableRegions: ['north_plains', 'western_arid', 'central_india', 'southern_peninsula'],
    suitableSoils: ['sandy_loam', 'red_laterite', 'clay_loam'],
    minWaterLevel: 'limited_protective',
    nitrogenFixationKgPerHa: '40 - 50 kg N/ha',
    seedVarieties: ['Pusa Komal', 'Kashi Kanchan', 'CP-4'],
    benefitsEn: 'Dual utility: green vegetable pods harvestable from day 45, remainder can be incorporated as green manure.',
    benefitsHi: 'दोहरा लाभ: 45 दिन से हरी फलियों की तुड़ाई, बची हुई बेल को हरी खाद के रूप में जोत सकते हैं।',
    cautionsEn: 'Aphids and pod borers attack during flowering; regular monitoring needed.',
    cautionsHi: 'फूल आते समय माहू (एफिड) और फली छेदक का खतरा; समय-समय पर निरीक्षण करें।'
  },
  {
    id: 'cucumber_cucurbits',
    nameEn: 'Short-Window Cucumber / Kakri (खीरा / ककड़ी)',
    nameHi: 'खीरा / ककड़ी (सब्जी)',
    minDays: 50,
    maxDays: 65,
    benchmarkYieldQuintalPerAcre: '40 - 70',
    suitableSeasons: ['zaid_summer'],
    suitableRegions: ['north_plains', 'central_india', 'eastern_plains', 'western_arid'],
    suitableSoils: ['sandy_loam'],
    minWaterLevel: 'assured_tube',
    nitrogenFixationKgPerHa: 'None (Requires potassium & compost)',
    seedVarieties: ['Pusa Uday', 'Pusa Barkha', 'Local early hybrid varieties'],
    benefitsEn: 'High cash realization in summer urban mandis. Continuous pickings over 2-3 weeks.',
    benefitsHi: 'गर्मियों में शहर की मंडियों में तुरंत नकद आय। 2-3 हफ्ते तक लगातार तुड़ाई।',
    cautionsEn: 'High water requirement (drip or frequent furrow). Red pumpkin beetle and powdery mildew require prompt organic/chemical control.',
    cautionsHi: 'लगातार सिंचाई आवश्यक। लाल भृंग (बीटल) और चूर्णिल आसिता (पाउडरी मिल्ड्यू) से बचाव जरूरी।'
  },
  {
    id: 'spinach_palak',
    nameEn: 'Fast-Cycle Spinach / Palak (पालक)',
    nameHi: 'देसी पालक',
    minDays: 30,
    maxDays: 45,
    benchmarkYieldQuintalPerAcre: '25 - 40',
    suitableSeasons: ['zaid_summer', 'post_kharif', 'winter_short'],
    suitableRegions: ['north_plains', 'eastern_plains', 'central_india', 'southern_peninsula'],
    suitableSoils: ['clay_loam', 'sandy_loam', 'black_cotton'],
    minWaterLevel: 'assured_tube',
    nitrogenFixationKgPerHa: 'None',
    seedVarieties: ['Pusa All Green', 'All Green Punjab', 'Pusa Bharati'],
    benefitsEn: 'Fastest possible cash-crop cycle (first cutting at 30 days). Excellent catch crop for small vacant plots near peri-urban mandis.',
    benefitsHi: 'सबसे तेज नकद चक्र (30 दिन में पहली कटाई)। शहरों के नजदीक की मंडियों के लिए आदर्श।',
    cautionsEn: 'In peak summer (>42°C), plants bolt to premature flowering. Needs shade netting or light frequent sprinkler misting.',
    cautionsHi: 'भीषण गर्मी (>42°C) में पौधे समय से पहले बीज बनाने लगते हैं। हल्की नियमित सिंचाई चाहिए।'
  },
  {
    id: 'sesame_til',
    nameEn: 'Summer Sesame / Til (तिल)',
    nameHi: 'ग्रीष्मकालीन तिल',
    minDays: 75,
    maxDays: 85,
    benchmarkYieldQuintalPerAcre: '2.5 - 4',
    suitableSeasons: ['zaid_summer'],
    suitableRegions: ['western_arid', 'central_india', 'southern_peninsula'],
    suitableSoils: ['sandy_loam', 'red_laterite'],
    minWaterLevel: 'limited_protective',
    nitrogenFixationKgPerHa: 'Low',
    seedVarieties: ['RT 351', 'Pragati', 'Gujarat Til 2'],
    benefitsEn: 'Very drought tolerant after establishment. High price per quintal (₹8,000 - ₹12,000/q benchmark).',
    benefitsHi: 'जमने के बाद सूखा सहन करने की शानदार क्षमता। प्रति क्विंटल ऊंचा बाजार भाव।',
    cautionsEn: 'Needs minimum 75 days to mature. Do not plant if your Kharif sowing window starts within 60 days.',
    cautionsHi: 'पकने के लिए कम से कम 75 दिन चाहिए। यदि खरीफ बुवाई 60 दिन में है तो इसे न चुनें।'
  },
  {
    id: 'dhaincha_green_manure',
    nameEn: 'Dhaincha Green Manuring (ढैंचा हरी खाद)',
    nameHi: 'ढैंचा हरी खाद',
    minDays: 40,
    maxDays: 50,
    benchmarkYieldQuintalPerAcre: '80 - 100 q green biomass',
    suitableSeasons: ['zaid_summer', 'early_kharif'],
    suitableRegions: ['north_plains', 'eastern_plains', 'central_india', 'western_arid', 'southern_peninsula'],
    suitableSoils: ['sandy_loam', 'clay_loam', 'black_cotton', 'red_laterite'],
    minWaterLevel: 'limited_protective',
    nitrogenFixationKgPerHa: '60 - 80 kg N/ha + Organic Carbon',
    seedVarieties: ['Sesbania aculeata (Local certified seed)'],
    benefitsEn: 'Replaces 40-50% chemical urea for subsequent paddy crop. Reclaims sodic/saline soils and improves soil microbial health.',
    benefitsHi: 'अगली धान की फसल में यूरिया की 40-50% बचत। उसर/खारी मिट्टी को सुधारता है और जीवांश बढ़ाता है।',
    cautionsEn: 'Must be ploughed in before 50 DAS while stems are succulent. If allowed to turn woody, decomposition slows down drastically.',
    cautionsHi: 'तना कड़ा होने से पहले (45-50 दिन पर) खेत में दबाना अनिवार्य है, अन्यथा सड़ने में समय लेता है।'
  }
];
