/**
 * KisanPulse AI Farming Knowledge Engine & Voice Command Parser
 * Comprehensive agricultural data, app navigation, and multi-language support.
 */

import { CROPS_CATALOG, INITIAL_SAMPLE_MARKETS, COMMON_SYMPTOMS, SAMPLE_WEATHER_HUBS } from '../modules/farming/farmingData';
import { ALL_SCHEMES } from '../modules/schemes/schemesData';
import { MOCK_MANDI_DATA } from '../components/mandi/SmartMandiView';

// In-depth Agricultural Knowledge Base across Indian crops, diseases, nutrients, and weather
const AGRONOMY_KNOWLEDGE = [
  {
    topics: ['wheat', 'गेहूं', 'gehu', 'कनक', 'gehun'],
    advice: {
      hi: `🌾 **गेहूं (Wheat) सम्पूर्ण कृषि सलाह:**
• **बुवाई का सही समय:** 1 से 25 नवंबर (अगेती), 25 नवंबर से 10 दिसंबर (मध्यम)।
• **खाद एवं उर्वरक प्रति एकड़:** 55-60 किग्रा DAP, 25 किग्रा पोटाश (MOP) बुवाई पर, तथा 65 किग्रा यूरिया दो बार में (पहली व दूसरी सिंचाई पर)।
• **महत्वपूर्ण सिंचाई अवस्थाएं:** 
  1. CRI अवस्था (ताज मूल विकास - 21 दिन) - यह सबसे आवश्यक सिंचाई है!
  2. कल्ले फूटते समय (40-45 दिन)
  3. गाभा व बाली बनते समय (60-65 दिन)
• **प्रमुख रोग:** पीला रतुआ (Yellow Rust) दिखने पर तुरंत प्रोपिकोनाज़ोल (Propiconazole 25% EC) 200 मिली प्रति 200 लीटर पानी में छिड़कें।`,
      en: `🌾 **Wheat Crop Complete Advisory:**
• **Sowing Time:** Nov 1 to Nov 25 (Optimal), late sowing up to Dec 10.
• **Fertilizer per Acre:** 55-60 kg DAP, 25 kg MOP at sowing, plus 65 kg Urea split across 1st and 2nd irrigations.
• **Critical Irrigation Stages:**
  1. CRI Stage (Crown Root Initiation, 21 days after sowing) — Never miss this irrigation!
  2. Tillering stage (40-45 days)
  3. Booting / Ear head emergence (60-65 days)
• **Disease Alert:** Yellow Rust — at first sign, spray Propiconazole 25% EC @ 1 ml/L (200 ml/acre in 200L water).`
    },
    page: 'farming',
    labelHi: 'फसल स्वास्थ्य व सिंचाई खोलें',
    labelEn: 'Open Wheat Health Guide'
  },
  {
    topics: ['yellow rust', 'रतुआ', 'पीला रतुआ', 'rust', 'haldi rog'],
    advice: {
      hi: `⚠️ **गेहूं का पीला रतुआ (Yellow Rust) निदान एवं उपचार:**
• **लक्षण:** पत्तियों पर पीले रंग की धारियाँ या हल्दी जैसा चूर्ण बनता है जो हाथ लगाने पर उंगलियों पर चिपकता है।
• **रासायनिक उपचार:** प्रोपिकोनाज़ोल (Tilt 25% EC) 200 मिली या टेबुकोनाज़ोल (Tebuconazole) 200 मिली को 200 लीटर पानी में मिलाकर प्रति एकड़ छिड़काव करें।
• **सतर्कता:** ठंडे और नम मौसम में यह तेज़ी से फैलता है। छिड़काव करते समय मौसम सूखा और हवा की गति 12 किमी/घंटा से कम होनी चाहिए।`,
      en: `⚠️ **Wheat Yellow Rust (Stripe Rust) Diagnosis & Remedy:**
• **Symptoms:** Yellow pustules arranged in linear stripes on leaves; leaves powdery yellow when touched.
• **Chemical Remedy:** Spray Propiconazole 25% EC (e.g. Tilt) @ 200 ml or Tebuconazole @ 200 ml in 200 litres of water per acre.
• **Warning:** Disease spreads rapidly in cool, humid conditions. Spray when weather is clear and wind speed < 12 km/h.`
    },
    page: 'farming',
    labelHi: 'फसल रोग निदान में देखें',
    labelEn: 'View in Crop Health'
  },
  {
    topics: ['mustard', 'सरसों', 'sarson', 'rai', 'राई'],
    advice: {
      hi: `🌼 **सरसों की उन्नत खेती एवं कीट प्रबंधन:**
• **माहू / चेपा (Aphids) नियंत्रण:** फूल और फलियां बनते समय माहू का प्रकोप होता है। नियंत्रण हेतु डाईमेथोएट (Dimethoate 30% EC) 1.5 मिली/लीटर या इमिडाक्लोप्रिड (Imidacloprid 17.8% SL) 50-60 मिली प्रति एकड़ 150 लीटर पानी में छिड़कें।
• **जैविक विकल्प:** 1500 ppm नीम का तेल 5 मिली प्रति लीटर पानी में मिलाकर छिड़कें।
• **सिंचाई:** पहली सिंचाई फूल आने से पहले (30-35 दिन) और दूसरी फलियां बनते समय (60-65 दिन) करें।`,
      en: `🌼 **Mustard Farming & Aphid Protection:**
• **Aphid (Mahu) Control:** Serious at flowering and pod filling. Spray Dimethoate 30% EC @ 1.5 ml/L or Imidacloprid 17.8% SL @ 50-60 ml/acre in 150L water.
• **Organic Alternative:** Spray 1500 ppm Neem Seed Kernel Extract (Neem oil) @ 5 ml per litre.
• **Irrigation:** 1st irrigation at 30-35 days (pre-flowering), 2nd at 60-65 days (siliquae formation).`
    },
    page: 'farming',
    labelHi: 'फसल कीट नियंत्रण खोलें',
    labelEn: 'Open Pest Advisory'
  },
  {
    topics: ['paddy', 'धान', 'rice', 'chawal', 'चावल', 'dhan'],
    advice: {
      hi: `🌱 **धान / बासमती फसल सलाह:**
• **तना छेदक (Stem Borer):** डेड हार्ट (Dead heart) दिखने पर कारटाप हाइड्रोक्लोराइड (Cartap Hydrochloride 4G) 7-8 किग्रा प्रति एकड़ बुरकें या क्लोरेंट्रानिलिप्रोल (Coragen) 60 मिली प्रति एकड़ 150 लीटर पानी में छिड़कें।
• **ब्लास्ट / झुलसा रोग:** ट्राईसाइक्लाज़ोल (Tricyclazole 75% WP) 120 ग्राम प्रति एकड़ 200 लीटर पानी में छिड़कें।
• **उर्वरक प्रबंधन:** जिंक सल्फेट (21%) 10 किग्रा प्रति एकड़ रोपाई के समय अवश्य दें।`,
      en: `🌱 **Paddy / Rice Complete Agronomy:**
• **Stem Borer Control:** Apply Cartap Hydrochloride 4G @ 7-8 kg/acre or spray Chlorantraniliprole 18.5% SC (Coragen) @ 60 ml/acre in 150L water.
• **Blast Disease:** Spray Tricyclazole 75% WP @ 120 g per acre in 200L water.
• **Micro-nutrients:** Apply Zinc Sulphate 21% @ 10 kg/acre at transplanting to prevent Khaira disease.`
    },
    page: 'farming',
    labelHi: 'धान रोग व सिंचाई गाइड',
    labelEn: 'Rice Health Guide'
  },
  {
    topics: ['cotton', 'कपास', 'kapas', 'narma', 'नरमा'],
    advice: {
      hi: `🌿 **कपास (Cotton) सुरक्षा सलाह:**
• **गुलाबी सुंडी (Pink Bollworm):** फेरोमोन ट्रैप (Pheromone traps) 5-8 प्रति एकड़ लगाएं। फूल खिलने के समय प्रोफेनोफॉस 50% EC 400 मिली प्रति एकड़ छिड़कें।
• **सफेद मक्खी (Whitefly):** डायफेंथियूरॉन (Diafenthiuron 50% WP) 200 ग्राम या पायरीप्रॉक्सीफेन 10% EC 400 मिली प्रति एकड़ छिड़कें। पीले चिपचिपे कार्ड (Yellow sticky traps) लगाएं।`,
      en: `🌿 **Cotton Pest & Bollworm Management:**
• **Pink Bollworm:** Install 5-8 Pheromone traps per acre. Spray Profenofos 50% EC @ 400 ml/acre during flowering/boll stage.
• **Whitefly & Sucking Pests:** Spray Diafenthiuron 50% WP @ 200 g or Pyriproxyfen 10% EC @ 400 ml/acre. Install yellow sticky traps.`
    },
    page: 'farming',
    labelHi: 'कपास स्वास्थ्य जांचें',
    labelEn: 'Check Cotton Health'
  },
  {
    topics: ['fertilizer', 'dap', 'urea', 'npk', 'खाद', 'यूरिया', 'डीएपी', 'पोटाश'],
    advice: {
      hi: `🧪 **संतुलित उर्वरक एवं खाद प्रबंधन (Balanced Nutrition):**
• **अनाज वाली फसलें (गेहूं, धान):** सामान्यतः NPK अनुपात 4:2:1 (120:60:40 किग्रा/हेक्टेयर) सर्वश्रेष्ठ है।
• **दलहन (चना, मूंग, उड़द):** NPK 1:2:2 (20:40:40 किग्रा/हेक्टेयर) - दलहन स्वयं नाइट्रोजन बनाती हैं, इसलिए फास्फोरस पर अधिक ध्यान दें।
• **तिलहन (सरसों, सोयाबीन):** सल्फर (गंधक) 10-15 किग्रा प्रति एकड़ बेंटोनाइट सल्फर अवश्य दें, इससे तेल की मात्रा बढ़ती है।
• **जैविक संवर्धन:** 2 टन गोबर की सड़ी खाद में ट्राइकोडर्मा (2 किग्रा) मिलाकर खेत की तैयारी में डालें।`,
      en: `🧪 **Balanced Fertilizer & Nutrient Management:**
• **Cereals (Wheat, Rice):** Standard NPK ratio 4:2:1 (approx 120:60:40 kg/ha).
• **Pulses (Gram, Moong, Urad):** Ratio 1:2:2 (20:40:40 kg/ha) — pulses fix their own nitrogen; focus on phosphorus and Rhizobium culture.
• **Oilseeds (Mustard, Soybean):** Apply 10-15 kg/acre Bentonite Sulphur to significantly boost oil percentage and grain weight.
• **Soil Enrichment:** Incorporate 2 tons of FYM enriched with Trichoderma (2 kg) during land preparation.`
    },
    page: 'farming',
    labelHi: 'खेती मॉड्यूल देखें',
    labelEn: 'Farming Modules'
  },
  {
    topics: ['potato', 'आलू', 'aaloo', 'tomato', 'टमाटर', 'tamatar', 'blight', 'झुलसा'],
    advice: {
      hi: `🥔 **आलू एवं टमाटर का अगेती व पछेती झुलसा (Early & Late Blight):**
• **लक्षण:** पत्तियों पर भूरे-काले छल्लेदार धब्बे और नम मौसम में पत्तियां झुलस कर काली पड़ जाती हैं।
• **नियंत्रण:** 
  1. रोकथाम के लिए मेंकोज़ेब (Mancozeb 75% WP) 2.5 ग्राम प्रति लीटर पानी का छिड़काव करें।
  2. रोग फैलने पर साइमोक्सानिल + मेंकोज़ेब (Curzate) 3 ग्राम/लीटर या मेटालैक्सिल + मेंकोज़ेब (Ridomil MZ) 2 ग्राम/लीटर का छिड़काव करें।`,
      en: `🥔 **Potato & Tomato Early/Late Blight Management:**
• **Symptoms:** Concentric dark target spots on leaves; rapid browning and water-soaked rotting in foggy, humid conditions.
• **Remedy:** Preventive spray of Mancozeb 75% WP @ 2.5 g/L. If active blight is observed, spray Cymoxanil + Mancozeb (Curzate) @ 3 g/L or Metalaxyl + Mancozeb (Ridomil Gold) @ 2 g/L.`
    },
    page: 'farming',
    labelHi: 'फसल रोग गाइड',
    labelEn: 'Crop Disease Guide'
  },
  {
    topics: ['pm kisan', 'pm-kisan', '6000', 'सम्मान निधि', 'subsidy', 'योजना', 'scheme'],
    advice: {
      hi: `🏛️ **पीएम-किसान सम्मान निधि (PM-KISAN) व सरकारी योजनाएं:**
• **लाभ:** सभी पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता (₹2,000 की 3 समान किस्तों में) सीधे बैंक खाते (DBT) में दी जाती है।
• **आवश्यक शर्तें:** 
  1. भू-अभिलेख (Land Seeding) पोर्टल पर सत्यापित होना चाहिए।
  2. आधार से बैंक खाता लिंक और NPCI DBT सक्रिय होना चाहिए।
  3. eKYC पूरा होना अनिवार्य है (OTP या बायोमेट्रिक द्वारा)।
• **सहायता:** KisanPulse के सरकारी योजना मैच में अन्य 15+ केंद्रीय व राज्य योजनाओं की पात्रता जांचें!`,
      en: `🏛️ **PM-KISAN & Government Agricultural Subsidies:**
• **Benefit:** ₹6,000 per year directly credited in 3 equal installments of ₹2,000 via Direct Benefit Transfer (DBT).
• **Mandatory Prerequisites:**
  1. Land records seeded on the PM-Kisan portal.
  2. Bank account linked with Aadhaar and NPCI DBT-enabled.
  3. eKYC completion via Aadhaar OTP or CSC biometric.
• Explore 15+ central & state farmer subsidies in SchemeMatch AI!`
    },
    page: 'schemes',
    labelHi: 'सरकारी योजना मैच खोलें',
    labelEn: 'Open SchemeMatch AI'
  }
];

// App Navigation Command Rules
const NAV_PATTERNS = [
  {
    regex: /(advisor|sell.?first|alternate crop|what to grow|कब बेच|पहले बेच|वैकल्पिक फसल|क्या उगाएं|सलाहकार)/i,
    page: 'advisors',
    replyHi: 'मैं आपको फसल बिक्री और वैकल्पिक फसल सलाह पर ले जा रहा हूँ।',
    replyEn: 'Opening Farm Advisors for sell-first and alternate-crop guidance.',
    labelHi: 'फार्म सलाह खोलें',
    labelEn: 'Open Farm Advisors'
  },
  {
    regex: /(land area|area calculator|plot area|भूमि क्षेत्र|जमीन का क्षेत्र|खेत का क्षेत्रफल)/i,
    page: 'land',
    replyHi: 'मैं आपको भूमि क्षेत्र कैलकुलेटर पर ले जा रहा हूँ।',
    replyEn: 'Opening the land-area calculator.',
    labelHi: 'भूमि कैलकुलेटर खोलें',
    labelEn: 'Open Land Calculator'
  },
  {
    regex: /(account|log.?in|sign.?in|register|खाता|लॉग.?इन|पंजीकरण)/i,
    page: 'account',
    replyHi: 'मैं आपको सुरक्षित किसान खाते के पेज पर ले जा रहा हूँ।',
    replyEn: 'Opening the secure farmer account page.',
    labelHi: 'खाता खोलें',
    labelEn: 'Open Account'
  },
  {
    regex: /(mandi|price|rate|bhav|market rate|मंडी|भाव|दाम|बाजार भाव|दर)/i,
    page: 'mandi',
    replyHi: 'मैं आपको स्मार्ट मंडी एवं लाभ कैलकुलेटर पर ले जा रहा हूँ। यहाँ आप सभी फसलों के ताज़ा एपीएमसी भाव और शुद्ध मुनाफ़ा देख सकते हैं।',
    replyEn: 'Navigating you to Smart Mandi & Profit Engine to check live APMC market prices and calculate your net margins.',
    labelHi: 'स्मार्ट मंडी खोलें',
    labelEn: 'Open Smart Mandi'
  },
  {
    regex: /(weather|forecast|rain|spray window|barish|mausam|तापमान|मौसम|बारिश|वर्षा|पूर्वानुमान|हवा)/i,
    page: 'weather',
    replyHi: 'मैं आपको 7-दिवसीय कृषि मौसम स्टेशन पर ले जा रहा हूँ। यहाँ आप उपग्रह पूर्वानुमान, बारिश की सम्भावना और कीटनाशक छिड़काव की सुरक्षा देख सकते हैं।',
    replyEn: 'Navigating you to the 7-Day Agri-Weather & Spray Forecast. Here you can inspect rainfall probability, wind velocity, and optimal spraying windows.',
    labelHi: '7-दिन मौसम देखें',
    labelEn: 'Open 7-Day Weather'
  },
  {
    regex: /(marketplace|vyapar|buyer|trade|demand|व्यापार|खरीदार|फसल बेचनी|बेचना|सौदा)/i,
    page: 'marketplace',
    replyHi: 'मैं आपको किसान व्यापार बाज़ार पर ले जा रहा हूँ। यहाँ आप अपनी फसल बेचने की लिस्टिंग डाल सकते हैं और खरीदारों से संपर्क कर सकते हैं।',
    replyEn: 'Opening Kisan Vyapar Marketplace where you can list produce, connect with wholesale buyers, and browse purchase demands.',
    labelHi: 'किसान व्यापार खोलें',
    labelEn: 'Open Marketplace'
  },
  {
    regex: /(disease|pest|insect|leaf|health|symptom|doctor|कीड़ा|रोग|पत्ती|बीमारी|दवा|फसल स्वास्थ्य|इलाज)/i,
    page: 'farming',
    replyHi: 'मैं आपको फसल स्वास्थ्य एवं कीट निदान पर ले जा रहा हूँ। यहाँ आप रोग के लक्षण दर्ज कर सकते हैं और कृषि वैज्ञानिक सलाह पा सकते हैं।',
    replyEn: 'Navigating to Crop Health & Agronomy where you can record symptoms, inspect disease treatments, and view stage-based irrigation advice.',
    labelHi: 'फसल स्वास्थ्य खोलें',
    labelEn: 'Open Crop Health'
  },
  {
    regex: /(scheme|subsidy|pm kisan|yojana|योजना|सब्सिडी|अनुदान|सरकारी)/i,
    page: 'schemes',
    replyHi: 'मैं आपको सरकारी योजना मैच मॉड्यूल पर ले जा रहा हूँ। यहाँ आप पीएम-किसान, फसल बीमा, सोलर पंप और ट्रैक्टर सब्सिडी की पात्रता जांच सकते हैं।',
    replyEn: 'Navigating to SchemeMatch AI to check your eligibility for PM-KISAN, crop insurance (PMFBY), solar pumps, and farm machinery subsidies.',
    labelHi: 'सरकारी योजनाएं खोलें',
    labelEn: 'Open SchemeMatch'
  },
  {
    regex: /(setting|language|sync|offline|भाषा|सेटिंग्स|सिंक)/i,
    page: 'settings',
    replyHi: 'मैं आपको सेटिंग्स और भाषा चयन पृष्ठ पर ले जा रहा हूँ। यहाँ आप भारत की 22 अनुसूचित भाषाओं में से चुन सकते हैं।',
    replyEn: 'Opening Settings & Localization. Choose from India’s 22 scheduled languages and manage offline sync here.',
    labelHi: 'सेटिंग्स खोलें',
    labelEn: 'Open Settings'
  },
  {
    regex: /(dashboard|home|main page|डैशबोर्ड|होम|मुख्य पेज)/i,
    page: 'dashboard',
    replyHi: 'डैशबोर्ड पर आपका स्वागत है। यहाँ आपके खेत की सभी मुख्य रिपोर्ट, मंडी भाव और अलर्ट एक साथ दिखाई देते हैं।',
    replyEn: 'Welcome back to the KisanPulse Dashboard. Here is your farm operational summary, live ticker, and weather indicators.',
    labelHi: 'डैशबोर्ड खोलें',
    labelEn: 'Open Dashboard'
  }
];

function readLocalData(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

const PAGE_HELP = [
  { page: 'dashboard', terms: /dashboard|home|डैशबोर्ड|होम|मुख्य पेज/, en: 'The Dashboard summarizes farm indicators and links to mandi rates, profit calculation, crop health, weather, schemes, and tools.', hi: 'डैशबोर्ड पर खेती के मुख्य संकेतक और मंडी भाव, लाभ कैलकुलेटर, फसल स्वास्थ्य, मौसम, योजनाओं और औज़ारों के लिंक मिलते हैं।' },
  { page: 'mandi', terms: /mandi|market price|msp|price|rate|भाव|मंडी|न्यूनतम समर्थन मूल्य|दाम/, en: 'Smart Mandi uses an official data feed when configured and available; otherwise it clearly labels demonstration sample prices. Use its profit calculator to enter yield, selling price, and cultivation costs.', hi: 'स्मार्ट मंडी में आधिकारिक डेटा फीड उपलब्ध और कॉन्फ़िगर होने पर उसका उपयोग होता है; अन्यथा उदाहरण वाले भाव स्पष्ट रूप से नमूना बताए जाते हैं। लाभ कैलकुलेटर में उपज, बिक्री मूल्य और खेती की लागत भरें।' },
  { page: 'marketplace', terms: /marketplace|buyer|listing|trade|व्यापार|खरीदार|लिस्टिंग|बेचना|बेचूं/, en: 'Kisan Vyapar Marketplace contains demo farmer listings and buyer requests. Add crop, quantity, expected price, location, and harvest date to list produce. Demo entries are not verified offers.', hi: 'किसान व्यापार बाज़ार में किसान की नमूना लिस्टिंग और खरीदारों की मांगें हैं। फसल, मात्रा, अपेक्षित मूल्य, स्थान और कटाई की तारीख भरकर लिस्टिंग जोड़ें। नमूना प्रविष्टियाँ सत्यापित खरीद प्रस्ताव नहीं हैं।' },
  { page: 'weather', terms: /weather|forecast|rain|temperature|wind|मौसम|पूर्वानुमान|बारिश|हवा|तापमान/, en: 'The Weather page shows a 7-day forecast, rain and wind information, and spray guidance. Choose a location or use Detect My Farm to request GPS weather. I can summarize the latest forecast loaded there; I do not generate live weather myself.', hi: 'मौसम पेज पर 7-दिन का पूर्वानुमान, बारिश और हवा की जानकारी तथा छिड़काव सलाह मिलती है। स्थान चुनें या GPS मौसम के लिए “Detect My Farm” दबाएँ। मैं वहाँ लोड हुआ नवीनतम पूर्वानुमान बता सकता हूँ; खुद लाइव मौसम नहीं बनाता।' },
  { page: 'farming', terms: /crop health|farming|irrigation|crop guide|disease|pest|फसल स्वास्थ्य|खेती|सिंचाई|रोग|कीट/, en: 'Crop Health & Farming contains crop guides, growth stages, symptom and observation tools, irrigation guidance, and market comparisons. Share the crop, its growth stage, and symptoms for more specific help.', hi: 'फसल स्वास्थ्य और खेती मॉड्यूल में फसल गाइड, वृद्धि अवस्थाएँ, लक्षण दर्ज करने के औज़ार, सिंचाई सलाह और बाज़ार तुलना है। बेहतर सलाह के लिए फसल, अवस्था और लक्षण बताएँ।' },
  { page: 'schemes', terms: /scheme|subsidy|pm.?kisan|pmfby|yojana|योजना|सब्सिडी|अनुदान|फसल बीमा/, en: 'Schemes lists benefits, eligibility, documents, and official portals for schemes in the app catalogue. Open SchemeMatch to compare eligibility. Confirm current rules on the linked official government portal.', hi: 'योजना पेज पर ऐप की सूची में मौजूद योजनाओं के लाभ, पात्रता, दस्तावेज़ और आधिकारिक पोर्टल मिलते हैं। पात्रता तुलना के लिए SchemeMatch खोलें। वर्तमान नियम संबंधित सरकारी पोर्टल पर जाँचें।' },
  { page: 'land', terms: /land area|area calculator|acre|hectare|guntha|बीघा|एकड़|हेक्टेयर|भूमि क्षेत्र|क्षेत्रफल/, en: 'Land Area Calculator multiplies a rectangular plot’s length by width. It converts the result among acres, hectares, square metres, square feet, and gunthas. Bigha is omitted because its size differs by region.', hi: 'भूमि क्षेत्र कैलकुलेटर आयताकार खेत की लंबाई × चौड़ाई करता है और परिणाम को एकड़, हेक्टेयर, वर्ग मीटर, वर्ग फुट और गुंठा में बदलता है। बीघा शामिल नहीं है क्योंकि उसका माप क्षेत्र के अनुसार बदलता है।' },
  { page: 'settings', terms: /setting|language|offline|भाषा|सेटिंग|ऑफलाइन/, en: 'Settings lets you choose the interface language and manage weather and offline preferences. Chat answers locally in English or Hindi; it does not need a Gemini key.', hi: 'सेटिंग्स में ऐप की भाषा चुनें और मौसम तथा ऑफलाइन विकल्प संभालें। चैट अब स्थानीय डेटा से हिंदी या अंग्रेज़ी में जवाब देती है और Gemini key की जरूरत नहीं है।' }
];

const GREETING = /^(hi|hello|hey|namaste|नमस्ते|हेलो|राम राम|sat sri akal|aadab|pranam)[!?.\s]*$/i;
const CROP_ALIASES = {
  wheat: ['gehun', 'gehu', 'गेहूं', 'कनक'], paddy: ['rice', 'dhan', 'chawal', 'धान', 'चावल'],
  mustard: ['sarson', 'rai', 'सरसों', 'राई'], cotton: ['kapas', 'कपास'], potato: ['aaloo', 'आलू'],
  tomato: ['tamatar', 'टमाटर'], onion: ['pyaz', 'प्याज'], soybean: ['सोयाबीन'], maize: ['corn', 'मक्का'],
  gram: ['chickpea', 'chana', 'चना'], groundnut: ['peanut', 'मूंगफली'],
};


function clean(value) {
  return String(value ?? '').toLocaleLowerCase().replace(/[.,!?;:'"()[\]{}\/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatScheme(scheme, isHi) {
  const name = isHi ? (scheme.nameHi || scheme.nameEn) : (scheme.nameEn || scheme.name || scheme.id);
  const benefit = isHi ? (scheme.benefitHi || scheme.benefit) : (scheme.benefit || scheme.purpose);
  const eligibility = isHi ? (scheme.eligibilityHi || scheme.eligibility) : (scheme.eligibility || scheme.eligibilityHi);
  const docs = Array.isArray(scheme.documents) ? scheme.documents.join(isHi ? '، ' : ', ') : scheme.documents;
  const steps = isHi
    ? (scheme.applicationStepsHi || scheme.stepsHi || scheme.applicationSteps || scheme.steps)
    : (scheme.applicationSteps || scheme.steps || scheme.applicationStepsHi);
  const stepText = Array.isArray(steps) ? steps.join(isHi ? '؛ ' : '; ') : steps;
  const registrationFields = Array.isArray(scheme.registrationFields)
    ? scheme.registrationFields.map((field) => isHi ? (field.labelHi || field.labelEn) : (field.labelEn || field.labelHi)).filter(Boolean).join(isHi ? '، ' : ', ')
    : '';
  const fee = scheme.serviceFee != null ? `\n${isHi ? 'ऐप सुविधा शुल्क' : 'App facilitation fee'}: ₹${scheme.serviceFee}` : '';
  const state = scheme.state || scheme.states;
  const stateLine = state ? `\n${isHi ? 'क्षेत्र' : 'Area'}: ${Array.isArray(state) ? state.join(', ') : state}` : '';
  return `${isHi ? '🏛️ योजना' : '🏛️ Scheme'}: ${name}\n${isHi ? 'श्रेणी' : 'Category'}: ${isHi ? (scheme.categoryHi || scheme.category || 'सूची में नहीं') : (scheme.category || 'Not listed')}\n${isHi ? 'लाभ' : 'Benefit'}: ${benefit || (isHi ? 'सूची में नहीं' : 'Not listed in app data')}\n${isHi ? 'पात्रता' : 'Eligibility'}: ${eligibility || (isHi ? 'आधिकारिक पोर्टल पर जाँचें' : 'Check the official portal')}\n${isHi ? 'दस्तावेज़' : 'Documents'}: ${docs || (isHi ? 'आधिकारिक पोर्टल पर जाँचें' : 'Check the official portal')}${stepText ? `\n${isHi ? 'आवेदन' : 'Application'}: ${stepText}` : ''}${registrationFields ? `\n${isHi ? 'फॉर्म में मांगी गई जानकारी' : 'Information requested by the app form'}: ${registrationFields}` : ''}${fee}${stateLine}\n${isHi ? 'आधिकारिक पोर्टल' : 'Official portal'}: ${scheme.portalUrl || (isHi ? 'ऐप डेटा में लिंक नहीं' : 'No link listed in app data')}\n${isHi ? 'नोट: नियम बदल सकते हैं; आधिकारिक पोर्टल पर पुष्टि करें।' : 'Note: rules can change; confirm details on the official portal.'}`;
}

function matchScheme(query, preferredScheme) {
  if (preferredScheme) return preferredScheme;
  const q = clean(query);
  return ALL_SCHEMES.find((item) => {
    const names = [item.nameEn, item.nameHi, item.id, ...(item.aliases || [])].filter(Boolean).map(clean);
    return names.some((name) => name.length > 2 && (q.includes(name) || name.includes(q) || name.split(' ').filter((part) => part.length > 2).every((part) => q.includes(part))));
  });
}

function formatCrop(crop, isHi) {
  const stages = (crop.stages || []).map((stage) => `• ${stage.label}: ${stage.desc}`).join('\n');
  return `${isHi ? '🌱 फसल' : '🌱 Crop'}: ${crop.name}\n${isHi ? 'मौसम' : 'Season'}: ${crop.category}\n${isHi ? 'कैटलॉग आधार MSP' : 'Catalogue benchmark MSP'}: ₹${Number(crop.msp2026 || 0).toLocaleString('en-IN')}/${isHi ? 'क्विंटल' : 'quintal'} (${isHi ? 'यह ऐप का संदर्भ है, वर्तमान सरकारी दर की पुष्टि नहीं' : 'app reference only, not a current verified government rate'})\n${isHi ? 'वृद्धि अवस्थाएँ' : 'Growth stages'}:\n${stages}`;
}

function formatWeather(isHi) {
  const weather = readLocalData('kisanpulse_latest_weather', null);
  if (!weather) return isHi
    ? 'अभी चैट के लिए मौसम पूर्वानुमान लोड नहीं है। Weather पेज खोलें, स्थान चुनें या “Detect My Farm” दबाएँ; फिर मैं लोड हुए 7 दिनों का सार बता सकूँगा।'
    : 'No forecast is loaded for chat yet. Open Weather, select a location or tap “Detect My Farm”; then I can summarize its loaded 7-day forecast.';
  const current = weather.current || {};
  const days = (weather.forecast || []).slice(0, 7).map((day) => {
    const rain = day.rainChance == null ? '' : `, ${isHi ? 'बारिश' : 'rain'} ${day.rainChance}%`;
    const wind = day.windSpeedKm == null ? '' : `, ${isHi ? 'हवा' : 'wind'} ${day.windSpeedKm} km/h`;
    return `• ${day.dayName || day.date || day.fullDate || ''}: ${day.condition || ''}, ${day.minTemp ?? '–'}–${day.maxTemp ?? '–'}°C${rain}${wind}`;
  });
  return `${isHi ? '⛅ मौसम स्थान' : '⛅ Weather location'}: ${weather.locationName || (isHi ? 'चयनित स्थान' : 'selected location')} ${weather.isLive ? (isHi ? '(लाइव)' : '(live)') : (isHi ? '(ऑफलाइन अनुमान)' : '(offline estimate)')}\n${current.temp != null ? `${isHi ? 'अभी' : 'Current'}: ${current.temp}°C, ${current.condition || ''}, ${isHi ? 'नमी' : 'humidity'} ${current.humidity ?? '–'}%\n` : ''}${weather.summaryAdvisory || ''}\n${days.join('\n') || (isHi ? 'दिनवार जानकारी अभी उपलब्ध नहीं।' : 'Daily details are not available yet.')}`;
}

function formatMandi(query, isHi) {
  const q = clean(query);
  const rows = MOCK_MANDI_DATA.filter((row) => {
    const rowText = clean(`${row.cropEn} ${row.cropHi} ${row.cropKey} ${row.mandi} ${row.state}`);
    return q.split(' ').some((word) => word.length > 2 && rowText.includes(word));
  });
  const chosen = rows.length ? rows : MOCK_MANDI_DATA.slice(0, 6);
  const list = chosen.map((row) => `• ${isHi ? row.cropHi : row.cropEn} — ${row.mandi}, ${row.state}: ₹${row.modalPrice}/${isHi ? 'क्विंटल' : 'quintal'} (MSP ₹${row.msp})`).join('\n');
  return `${isHi ? 'ऐप का नमूना मंडी डेटा (लाइव सत्यापित भाव नहीं):' : 'App sample mandi data (not live verified prices):'}\n${list}\n${isHi ? 'लाभ देखने के लिए Smart Mandi पेज खोलें।' : 'Open Smart Mandi to calculate profit.'}`;
}

function findCrop(query) {
  const q = clean(query);
  return CROPS_CATALOG.find((crop) => {
    const aliases = CROP_ALIASES[crop.id] || [];
    return [crop.id, crop.name, ...aliases].map(clean).some((term) => term.length > 2 && q.includes(term));
  });
}

const WEBSITE_GUIDE = [
  { terms: /\b(buyer|farmer|seller) account|account type|user role|भूमिका|खरीदार खाता|किसान खाता/i, page: 'account', en: 'Choose the account role that matches how you will use KisanPulse. Farmer accounts get the farming tools; buyer accounts focus on marketplace browsing and demand posts; admin pages require an admin account. You can open Account to review your signed-in profile.', hi: 'KisanPulse का उपयोग जिस तरह करना है, उसी के अनुसार खाता भूमिका चुनें। किसान खाते में खेती के औज़ार होते हैं; खरीदार खाता बाज़ार और मांग पोस्ट पर केंद्रित है; एडमिन पेज के लिए एडमिन खाता चाहिए। साइन-इन प्रोफ़ाइल देखने के लिए खाता खोलें।' },
  { terms: /admin portal|admin panel|publish.*scheme|upload.*scheme|योजना.*अपलोड|एडमिन पैनल|प्रशासक/i, page: 'admin', en: 'The admin portal is restricted to signed-in admin accounts. Admins can publish bilingual scheme entries with official links, upload scheme explainer videos, and review farmer registration-help requests. Admin access must be configured by the project owner; never share an admin key in chat.', hi: 'एडमिन पोर्टल केवल साइन-इन एडमिन खातों के लिए है। एडमिन आधिकारिक लिंक सहित हिंदी-अंग्रेज़ी योजना प्रकाशित कर सकते हैं, योजना समझाने वाले वीडियो अपलोड कर सकते हैं और किसानों के सहायता अनुरोध देख सकते हैं। एडमिन पहुँच प्रोजेक्ट मालिक सेट करता है; एडमिन key चैट में साझा न करें।' },
  { terms: /demo payment|fake payment|real payment|upi pin|payment safe|डेमो भुगतान|नकली भुगतान|यूपीआई पिन|असली भुगतान/i, page: 'schemes', en: 'Scheme registration-help checkout is a simulation. It does not contact a bank or UPI app and does not charge real money. Never enter a UPI PIN, OTP, card PIN, or bank password. Real payment processing is not connected.', hi: 'योजना सहायता का भुगतान चरण केवल सिमुलेशन है। यह बैंक या UPI ऐप से संपर्क नहीं करता और असली पैसे नहीं काटता। UPI PIN, OTP, कार्ड PIN या बैंक पासवर्ड कभी न डालें। वास्तविक भुगतान सुविधा जुड़ी नहीं है।' },
  { terms: /registration.?help|help request|request status|payment history|my schemes|registered scheme|अनुरोध.*स्थिति|भुगतान इतिहास|मेरी योजन|पंजीकरण सहायता/i, page: 'schemes', en: 'After submitting a scheme-help request, keep the request ID and the same phone number you entered. Use the request-history section in Schemes to check its status and demo receipt. Approval means follow-up help; it does not mean the government application was submitted.', hi: 'योजना सहायता अनुरोध भेजने के बाद अनुरोध ID और वही मोबाइल नंबर सुरक्षित रखें। स्थिति और डेमो रसीद देखने के लिए योजनाओं में अनुरोध इतिहास खोलें। स्वीकृति का अर्थ सहायता के लिए संपर्क है; इससे सरकारी आवेदन जमा नहीं होता।' },
  { terms: /new scheme alert|scheme notification|scheme alert|नई योजना.*सूचना|योजना अलर्ट|योजना नोटिफिकेशन/i, page: 'schemes', en: 'Matching in-app scheme alerts are created when an admin adds a scheme and your saved state/crop profile matches it, if alerts are enabled. This is not an automatic live government-news crawler; new schemes must first be added to the catalogue.', hi: 'एडमिन द्वारा योजना जोड़ने पर, यदि आपका सहेजा राज्य/फसल प्रोफ़ाइल उससे मेल खाता है और अलर्ट चालू हैं, तो ऐप में सूचना बनती है। यह सरकार की खबरें अपने-आप खोजने वाला लाइव crawler नहीं है; योजना पहले कैटलॉग में जोड़ी जानी चाहिए।' },
  { terms: /marketplace match|matching rule|10 percent|10%|price match|व्यापार.*मिलान|10 प्रतिशत|दस प्रतिशत/i, page: 'marketplace', en: 'Marketplace matching compares crop and quantity compatibility and allows price ranges up to 10% apart for negotiation. A match is an introduction, not a confirmed sale. Review quality, quantity, delivery, and payment terms directly before agreeing.', hi: 'बाज़ार मिलान फसल और मात्रा की अनुकूलता देखता है और बातचीत के लिए मूल्य सीमा में 10% तक का अंतर स्वीकार करता है। मिलान केवल संपर्क का अवसर है, पक्की बिक्री नहीं। सहमति से पहले गुणवत्ता, मात्रा, डिलीवरी और भुगतान शर्तें जाँचें।' },
  { terms: /marketplace chat|chat feature|voice message|voice note|buyer.*message|किसान.*चैट|आवाज़ संदेश|वॉइस नोट/i, page: 'marketplace', en: 'Matched listing owners can open the marketplace chat and exchange text or recorded voice notes. The chat is limited to owners of the matched listings; notifications are associated with incoming messages. Use the app’s authenticated account and do not share sensitive banking details.', hi: 'मिले हुए पोस्ट के मालिक बाज़ार चैट खोलकर टेक्स्ट या रिकॉर्ड किए गए आवाज़ संदेश भेज सकते हैं। चैट केवल मिलान वाले पोस्ट के मालिकों के लिए है; नए संदेश पर सूचना जुड़ती है। ऐप खाते का उपयोग करें और बैंक की गोपनीय जानकारी साझा न करें।' },
  { terms: /live mandi|mandi api|data.gov|agmarknet|mandi data|मंडी डेटा|लाइव मंडी/i, page: 'mandi', en: 'Smart Mandi can use the official data.gov.in daily mandi-price feed when its API key is configured and the service responds. Otherwise it shows clearly labelled sample/benchmark values. Gemini is not the mandi-price source; check the displayed source and update time before deciding to sell.', hi: 'Smart Mandi में data.gov.in का दैनिक मंडी भाव feed तभी उपयोग होता है जब API key सेट हो और सेवा जवाब दे। अन्यथा स्पष्ट रूप से नमूना/बेंचमार्क भाव दिखते हैं। Gemini मंडी भाव का स्रोत नहीं है; बिक्री निर्णय से पहले दिखाई गई स्रोत जानकारी और अपडेट समय जाँचें।' },
  { terms: /openweather|weather api|live weather|मौसम api|लाइव मौसम/i, page: 'weather', en: 'Live weather depends on the weather provider key, internet access, and a selected or detected location. The assistant can summarize a forecast already loaded by the Weather page; it does not invent forecasts when none are available.', hi: 'लाइव मौसम के लिए मौसम सेवा की key, इंटरनेट और चुना या पहचाना गया स्थान आवश्यक है। मौसम पेज पर लोड पूर्वानुमान को सहायक संक्षेप में बता सकता है; डेटा न हो तो वह पूर्वानुमान नहीं गढ़ता।' },
  { terms: /does.*bot.*need.*api|assistant.*api key|gemini key|bot.*offline|बॉट.*एपीआई|जेमिनी key|बिना एपीआई/i, page: 'settings', en: 'The floating KisanPulse Assistant answers from built-in website data without Gemini. Its answers are limited to the app catalogue and local data. The separate Scheme AI chat still uses Gemini; live weather and mandi data use their own external services.', hi: 'KisanPulse का floating सहायक Gemini के बिना वेबसाइट के अंतर्निहित डेटा से जवाब देता है। जवाब ऐप कैटलॉग और स्थानीय डेटा तक सीमित हैं। अलग Scheme AI चैट अभी Gemini उपयोग करती है; लाइव मौसम और मंडी डेटा अपनी बाहरी सेवाओं पर निर्भर हैं।' },
  { terms: /speech recognition|voice input|microphone|mic not|आवाज़ से लिख|माइक्रोफोन|माइक/i, page: 'settings', en: 'The floating assistant uses the browser’s speech-recognition feature for voice input, then lets you review the transcript before sending. Browser support and internet access vary. If it cannot connect, try Chrome or Edge, or use Windows voice typing with Win + H. Reply audio uses your device’s built-in speech voices.', hi: 'सहायक आवाज़ इनपुट के लिए ब्राउज़र की speech-recognition सुविधा उपयोग करता है और भेजने से पहले लिखे शब्द जाँचने देता है। ब्राउज़र समर्थन और इंटरनेट उपलब्धता अलग-अलग हो सकती है। कनेक्शन न हो तो Chrome/Edge या Windows Win + H आज़माएँ। जवाब की आवाज़ डिवाइस की speech सुविधा से आती है।' },
];
async function answerAppData(question, isHi) {
  const q = clean(question);
  const siteFact = WEBSITE_GUIDE.find((item) => item.terms.test(q));
  if (siteFact) return { text: isHi ? siteFact.hi : siteFact.en, page: siteFact.page, label: isHi ? 'यह पेज खोलें' : 'Open this page' };
  if (/(symptom|symptoms|लक्षण|रोग के संकेत)/i.test(q)) {
    return { text: `${isHi ? 'फसल स्वास्थ्य मॉड्यूल में उदाहरण लक्षण:' : 'Example symptoms supported by Crop Health:'}\n${COMMON_SYMPTOMS.map((item) => `• ${item}`).join('\n')}`, page: 'farming', label: isHi ? 'फसल स्वास्थ्य खोलें' : 'Open Crop Health' };
  }
  if (/(weather location|weather city|supported location|मौसम के शहर|कौन से शहर|स्थान उपलब्ध)/i.test(q)) {
    return { text: `${isHi ? 'मौसम स्टेशन में उपलब्ध स्थान:' : 'Locations listed in the weather station:'} ${SAMPLE_WEATHER_HUBS.map((item) => item.name).join(', ')}`, page: 'weather', label: isHi ? 'मौसम खोलें' : 'Open Weather' };
  }
  if (/(sample market|market comparison|mandi locations|बाजार तुलना|मंडी स्थान)/i.test(q)) {
    const markets = INITIAL_SAMPLE_MARKETS.map((item) => `• ${item.name}: ₹${item.sellingPrice}/qtl; ${item.distanceKm} km; ${item.verified ? (isHi ? 'सत्यापित नमूना' : 'verified sample') : (isHi ? 'बेंचमार्क नमूना' : 'benchmark sample')}`).join('\n');
    return { text: `${isHi ? 'स्मार्ट मंडी के तुलना बाजार:' : 'Smart Mandi comparison markets:'}\n${markets}`, page: 'mandi', label: isHi ? 'स्मार्ट मंडी खोलें' : 'Open Smart Mandi' };
  }
  if (/(all schemes|list schemes|which schemes|सभी योजन|योजनाओं की सूची)/i.test(q)) {
    const list = ALL_SCHEMES.map((item) => `• ${isHi ? (item.nameHi || item.nameEn) : (item.nameEn || item.name)} — ${isHi ? (item.benefitHi || item.benefit || '') : (item.benefit || '')}`).join('\n');
    return { text: `${isHi ? 'ऐप में उपलब्ध योजनाएँ:' : 'Schemes listed in the app:'}\n${list}`, page: 'schemes', label: isHi ? 'योजनाएँ खोलें' : 'Open Schemes' };
  }
  if (/(weather|forecast|rain|मौसम|पूर्वानुमान|बारिश|तापमान)/i.test(q)) return { text: formatWeather(isHi), page: 'weather', label: isHi ? 'मौसम खोलें' : 'Open Weather' };
  if (/(mandi|msp|market price|price|rate|भाव|मंडी|दाम)/i.test(q)) return { text: formatMandi(q, isHi), page: 'mandi', label: isHi ? 'स्मार्ट मंडी खोलें' : 'Open Smart Mandi' };

  const scheme = matchScheme(question);
  if (scheme || /(scheme|subsidy|yojana|योजना|सब्सिडी|अनुदान|pm.?kisan|pmfby|फसल बीमा)/i.test(q)) {
    if (scheme) return { text: formatScheme(scheme, isHi), page: 'schemes', label: isHi ? 'योजना देखें' : 'View scheme' };
    return { text: isHi ? `ऐप में ${ALL_SCHEMES.length} योजनाओं का कैटलॉग है। किसी योजना का नाम पूछें, जैसे PM-KISAN या फसल बीमा। कैटलॉग जानकारी आधिकारिक पोर्टल पर जाँचें।` : `The app has a catalogue of ${ALL_SCHEMES.length} schemes. Ask for one by name, such as PM-KISAN or crop insurance. Confirm catalogue details on the official portal.`, page: 'schemes', label: isHi ? 'योजनाएँ खोलें' : 'Open schemes' };
  }

  if (/(all crops|list crops|which crops|सभी फसल|फसलों की सूची|कौन सी फसल)/i.test(q)) {
    return { text: `${isHi ? 'ऐप फसल कैटलॉग:' : 'App crop catalogue:'} ${CROPS_CATALOG.map((crop) => crop.name).join(', ')}`, page: 'farming', label: isHi ? 'फसल गाइड खोलें' : 'Open crop guides' };
  }
  const crop = findCrop(question);
  if (crop && /(stage|season|crop|variety|irrigat|water|msp|फसल|अवस्था|मौसम|सिंचाई|पानी|उपज|जानकारी|बारे में|what is|about|tell me|क्या है|बताओ)/i.test(q)) {
    return { text: formatCrop(crop, isHi), page: 'farming', label: isHi ? 'फसल गाइड खोलें' : 'Open crop guide' };
  }

  if (/(calculator|convert|conversion|acre|hectare|guntha|land area|क्षेत्रफल|एकड़|हेक्टेयर|गुंठा)/i.test(q)) {
    return { text: isHi
      ? 'भूमि कैलकुलेटर में खेत की लंबाई और चौड़ाई समान इकाई में डालें। क्षेत्रफल = लंबाई × चौड़ाई। परिणाम एकड़, हेक्टेयर, वर्ग मीटर, वर्ग फुट और गुंठा में आता है। 1 एकड़ = 4,046.8564 वर्ग मीटर; 1 हेक्टेयर = 10,000 वर्ग मीटर; 1 गुंठा = 101.1714 वर्ग मीटर। बीघा का माप क्षेत्र के अनुसार बदलता है।'
      : 'In Land Area Calculator, enter the plot’s length and width in the same unit. Area = length × width. Results are shown in acres, hectares, square metres, square feet, and gunthas. 1 acre = 4,046.8564 m²; 1 hectare = 10,000 m²; 1 guntha = 101.1714 m². Bigha varies by region.', page: 'land', label: isHi ? 'भूमि कैलकुलेटर खोलें' : 'Open land calculator' };
  }

  if (/(marketplace|buyer|listing|व्यापार|खरीदार|बेचने|लिस्टिंग)/i.test(q)) {
    try {
      const response = await fetch('/api/marketplace/listings');
      const payload = response.ok ? await response.json() : {};
      const listings = Array.isArray(payload.listings) ? payload.listings : [];
      if (/(show|list|which|all|कौन|सूची|दिखाओ|लिस्ट)/i.test(q) && listings.length) {
        const rows = listings.slice(0, 6).map((item) => `• ${item.role === 'buyer' ? (isHi ? 'खरीदार मांग' : 'Buyer demand') : (isHi ? 'किसान फसल' : 'Farmer crop')} — ${item.crop}: ${item.quantityQuintals} qtl, ₹${item.expectedPricePerQuintal}/qtl, ${item.district}, ${item.state}`).join('\n');
        return { text: `${isHi ? 'बाज़ार की हाल की पोस्ट:' : 'Recent marketplace posts:'}\n${rows}`, page: 'marketplace', label: isHi ? 'बाज़ार खोलें' : 'Open marketplace' };
      }
      return { text: isHi ? `किसान व्यापार में अभी ${listings.length} सक्रिय पोस्ट हैं। फसल सूची या खरीदार की मांग पोस्ट करें; उपयुक्त मिलान पर संपर्क विकल्प उपलब्ध होते हैं।` : `Kisan Vyapar currently has ${listings.length} active posts. Publish a crop listing or buyer demand; contact options appear for compatible matches.`, page: 'marketplace', label: isHi ? 'बाज़ार खोलें' : 'Open marketplace' };
    } catch { return { text: isHi ? 'बाज़ार पोस्ट अभी लोड नहीं हो सकीं। किसान व्यापार पेज खोलकर फिर प्रयास करें।' : 'Marketplace posts could not be loaded just now. Open Kisan Vyapar and try again.', page: 'marketplace', label: isHi ? 'बाज़ार खोलें' : 'Open marketplace' }; }
  }

  if (/(advisor|sell.?first|alternate crop|what to grow|कब बेच|पहले बेच|वैकल्पिक फसल|क्या उगाएं|फार्म सलाह)/i.test(q)) {
    return { text: isHi ? 'फार्म सलाहकार में फसल बेचने की प्राथमिकता और कम अवधि वाली वैकल्पिक फसलों के सुझाव देखें। सुझाव स्थानीय मौसम और परिस्थितियों के अनुसार कृषि विशेषज्ञ से जाँचें।' : 'Farm Advisors ranks stored crops for selling priority and suggests short-duration alternate crops. Check recommendations against local weather and an agriculture expert’s advice.', page: 'advisors', label: isHi ? 'फार्म सलाह खोलें' : 'Open Farm Advisors' };
  }

  if (/(my report|my observation|saved crop|crop report|मेरी रिपोर्ट|मेरे निरीक्षण|सहेजे निरीक्षण)/i.test(q)) {
    const reports = readLocalData('kisanpulse_crop_reports', []);
    if (!reports.length) return { text: isHi ? 'इस ब्राउज़र में अभी कोई सहेजा हुआ फसल निरीक्षण नहीं मिला। Crop Health पेज में निरीक्षण दर्ज करें।' : 'No saved crop observations were found in this browser. Add one in Crop Health.', page: 'farming', label: isHi ? 'फसल स्वास्थ्य खोलें' : 'Open Crop Health' };
    const summary = reports.slice(0, 8).map((item) => `• ${item.crop || item.cropName || 'Crop'}: ${item.symptoms || item.notes || item.description || 'Observation saved'}`).join('\n');
    return { text: `${isHi ? 'सहेजे फसल निरीक्षण:' : 'Saved crop observations:'}\n${summary}`, page: 'farming', label: isHi ? 'फसल स्वास्थ्य खोलें' : 'Open Crop Health' };
  }

  if (/(login|log in|account|register|password|खाता|लॉग.?इन|पासवर्ड|पंजीकरण)/i.test(q)) {
    return { text: isHi
      ? 'KisanPulse खाते इस ऐप सर्वर की SQLite डेटाबेस में सहेजे जाते हैं। पासवर्ड केवल सुरक्षित hash के रूप में रखा जाता है; सादा पासवर्ड नहीं। स्थानीय विकास में डेटा इसी कंप्यूटर की data/kisanpulse.sqlite फ़ाइल में रहता है।'
      : 'KisanPulse accounts are saved in this app server’s SQLite database. Passwords are stored only as secure hashes, never as plain text. In local development, the database file is data/kisanpulse.sqlite on this computer.', page: 'account', label: isHi ? 'खाता खोलें' : 'Open Account' };
  }

  if (/(language|languages|hindi|english|भाषा|हिंदी|अंग्रेज़ी)/i.test(q)) {
    return { text: isHi
      ? 'ऐप में भाषा बदलने के लिए ऊपर भाषा चयन खोलें या Settings में जाएँ। इस चैट के स्थानीय जवाब हिंदी या अंग्रेज़ी में आते हैं। Gemini API key की जरूरत नहीं है।'
      : 'Open the language selector in the app header or go to Settings to change the interface language. This local chat answers in English or Hindi and does not need a Gemini API key.' };
  }

  if (/(website|app|feature|help|what can you|how to use|किसानपल्स|वेबसाइट|ऐप में क्या|मदद|कैसे इस्तेमाल)/i.test(q)) {
    return { text: isHi
      ? 'KisanPulse में डैशबोर्ड; स्मार्ट मंडी व लाभ कैलकुलेटर; किसान व्यापार बाज़ार; फसल स्वास्थ्य व खेती गाइड; 7-दिन मौसम व छिड़काव सलाह; सरकारी योजनाएँ; भूमि क्षेत्र कैलकुलेटर; भाषा और ऑफलाइन सेटिंग्स हैं। किसी सुविधा का नाम पूछें या कहें “मंडी खोलो”।'
      : 'KisanPulse includes a Dashboard; Smart Mandi and profit calculator; farmer marketplace; Crop Health & Farming guides; 7-day weather and spray advice; government schemes; land-area calculator; and language/offline settings. Ask about a feature or say “Open Mandi”.' };
  }
  return null;
}

function isExplicitNavigation(question) {
  return /^(open|show|go to|navigate to|take me to)|(?:खोलो|खोलें|दिखाओ|पेज पर जाओ|ले चलो)/i.test(question.trim());
}

export async function processFarmingQuery(question, language = 'hi') {
  const q = clean(question);
  const isHi = language === 'hi';
  if (isExplicitNavigation(question)) {
    for (const item of NAV_PATTERNS) {
      if (item.regex.test(q)) return { text: isHi ? item.replyHi : item.replyEn, page: item.page, label: isHi ? item.labelHi : item.labelEn, isNavigation: true };
    }
  }
  if (GREETING.test(q)) {
    return { text: isHi
      ? 'राम-राम किसान भाई! मैं KisanPulse के स्थानीय डेटा से मदद करता हूँ। फसल, कीट-रोग, नमूना मंडी भाव, योजना, मौसम पेज या ऐप इस्तेमाल करने के बारे में पूछें।'
      : 'Namaste! I answer from KisanPulse’s built-in website data. Ask about crops, pests, sample mandi prices, schemes, the weather page, or how to use a feature.' };
  }

  // Use specific crop advice when the question is about cultivation, symptoms or treatment.
  const diagnosisIntent = /(disease|pest|symptom|diagnos|treat|remed|spray|pesticide|fungicide|dose|dosage|how much|quantity|मात्रा|कितना|कीट|रोग|लक्षण|इलाज|दवा|छिड़काव|निदान)/i.test(q);
  if (diagnosisIntent) return { text: isHi ? 'मैं फोटो या संदेश से फसल रोग की पुष्टि या कीटनाशक/दवा की मात्रा सुरक्षित रूप से तय नहीं कर सकता। Crop Health में फसल, लक्षण और फोटो दर्ज करें; उपचार से पहले नज़दीकी कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से सलाह लें और केवल उत्पाद के आधिकारिक लेबल का पालन करें।' : 'I can’t confirm a crop disease or safely prescribe a pesticide or dose from a message or photo. Record the crop, symptoms and photo in Crop Health, then consult your local KVK or agriculture officer before treatment and follow the product label.' , page: 'farming', label: isHi ? 'फसल स्वास्थ्य खोलें' : 'Open Crop Health' };
  const agricultureIntent = /(farm|grow|cultivat|sow|seed|fertiliz|irrigat|water|कीट|रोग|लक्षण|उपचार|खाद|सिंचाई|बुवाई|खेती)/i.test(q);
  if (agricultureIntent) {
    for (const item of AGRONOMY_KNOWLEDGE) {
      if (item.topics.some((keyword) => q.includes(clean(keyword)))) return { text: isHi ? item.advice.hi : item.advice.en, page: item.page, label: isHi ? item.labelHi : item.labelEn };
    }
  }

  const appAnswer = await answerAppData(question, isHi);
  if (appAnswer) return appAnswer;

  const page = PAGE_HELP.find((item) => item.terms.test(q));
  if (page) return { text: isHi ? page.hi : page.en, page: page.page, label: isHi ? 'यह पेज खोलें' : 'Open this page' };

  return { text: isHi
    ? `मैं बिना Gemini या इंटरनेट AI के KisanPulse के स्थानीय डेटा और गाइड से उत्तर देता हूँ। इस सवाल का सटीक विवरण साइट डेटा में नहीं मिला। फसल, योजना या फीचर का नाम और थोड़ा संदर्भ दें। मैं ${CROPS_CATALOG.length} फसल प्रविष्टियों, ${ALL_SCHEMES.length} योजनाओं, नमूना मंडी डेटा, मौसम पेज, बाज़ार और कैलकुलेटर की जानकारी दे सकता हूँ।`
    : `I answer without Gemini or an external AI service, using KisanPulse’s built-in data and guides. I couldn’t find this exact detail in the website data. Add the crop, scheme, or feature name and a little context. I can explain ${CROPS_CATALOG.length} crop entries, ${ALL_SCHEMES.length} schemes, sample mandi data, weather, the marketplace, and calculators.` };
}

export async function processSchemeQuery(question, language = 'en', currentScheme = null) {
  const scheme = matchScheme(question, currentScheme);
  if (!scheme) return processFarmingQuery(question, language);
  return { text: formatScheme(scheme, language === 'hi'), page: 'schemes', label: language === 'hi' ? 'योजना देखें' : 'View scheme' };
}


// Local scheme advisor: answer from the selected scheme and the bundled catalogue,
// without calling a hosted generative-AI API.
export async function answerSchemeQuestion(question, language = 'en', currentScheme = null) {
  const isHi = language === 'hi';
  const scheme = matchScheme(question, currentScheme);
  if (!scheme) {
    const res = await processSchemeQuery(question, language);
    return res?.text || (isHi ? 'माफ़ करें, कोई जानकारी नहीं मिली।' : 'Sorry, no information found.');
  }

  const q = clean(question);
  const name = isHi ? (scheme.nameHi || scheme.nameEn || scheme.name) : (scheme.nameEn || scheme.name || scheme.id);
  const benefit = isHi ? (scheme.benefitHi || scheme.benefit) : (scheme.benefit || scheme.purpose);
  const eligibility = isHi ? (scheme.eligibilityHi || scheme.eligibility) : (scheme.eligibility || scheme.eligibilityHi);
  const docs = Array.isArray(scheme.documents) ? scheme.documents.join(isHi ? '、 ' : ', ') : scheme.documents;
  const portal = scheme.portalUrl;
  const disclaimer = isHi
    ? '\n\nयह जानकारी KisanPulse के योजना कैटलॉग से है। अंतिम पात्रता और मौजूदा नियम आधिकारिक स्रोत पर जाँचें।'
    : '\n\nThis answer uses KisanPulse’s scheme catalogue. Confirm current rules and eligibility with the official source.';

  if (/benefit|advantage|what.*get|amount|how much|support|लाभ|फायदे|राशि|कितना|क्या मिलेगा/.test(q)) {
    return `${isHi ? `इस योजना (${name}) का कैटलॉग में दिया लाभ` : `Catalogue benefit for ${name}`}: ${benefit || (isHi ? 'लाभ का विवरण कैटलॉग में उपलब्ध नहीं है।' : 'A benefit description is not available in the catalogue.')}${disclaimer}`;
  }
  if (/eligible|eligibility|who can|tenant|sharecropper|पात्र|पात्रता|कौन आवेदन/.test(q)) {
    return `${isHi ? `इस योजना (${name}) की कैटलॉग पात्रता` : `Catalogue eligibility for ${name}`}: ${eligibility || (isHi ? 'पात्रता कैटलॉग में उपलब्ध नहीं है। आधिकारिक स्रोत पर जाँचें।' : 'Eligibility is not listed in the catalogue. Check the official source.')}${disclaimer}`;
  }
  if (/document|paper|aadhaar|proof|कागजात|दस्तावेज़|दस्तावेज|क्या चाहिए/.test(q)) {
    return `${isHi ? `इस योजना (${name}) के लिए कैटलॉग में दिए दस्तावेज़` : `Documents listed for ${name}`}: ${docs || (isHi ? 'दस्तावेज़ कैटलॉग में सूचीबद्ध नहीं हैं। आधिकारिक स्रोत पर जाँचें।' : 'Documents are not listed in the catalogue. Check the official source.')}${disclaimer}`;
  }
  if (/apply|application|online|office|visit|register|registration|आवेदन|ऑनलाइन|कार्यालय|जाना|पंजीकरण/.test(q)) {
    const steps = scheme.applicationSteps || scheme.steps || scheme.applicationStepsHi || scheme.stepsHi;
    const stepText = Array.isArray(steps) ? steps.join(isHi ? '؛ ' : '; ') : steps;
    if (isHi) {
      return `इस योजना (${name}) के लिए ${portal ? `आधिकारिक पोर्टल ${portal} कैटलॉग में दिया गया है` : 'आधिकारिक आवेदन लिंक कैटलॉग में नहीं दिया गया है'}।${stepText ? ` कैटलॉग में दिए कदम: ${stepText}।` : ' कैटलॉग यह पुष्टि नहीं करता कि आवेदन पूरी तरह ऑनलाइन हो सकता है या कार्यालय जाना जरूरी है। पोर्टल के मौजूदा निर्देश देखें; यदि स्थानीय सत्यापन मांगा जाए तो संबंधित CSC या कृषि कार्यालय से संपर्क करें।'} KisanPulse की “पंजीकरण सहायता” केवल सहायता अनुरोध भेजती है; यह सरकारी आवेदन जमा नहीं करती।${disclaimer}`;
    }
    return `For ${name}, ${portal ? `the catalogue lists this official portal: ${portal}` : 'the catalogue does not list an official application link'}.${stepText ? ` Listed steps: ${stepText}.` : ' The catalogue does not confirm whether the full application is online or requires an office visit. Check the portal’s current instructions; if local verification is required, contact the listed CSC or agriculture office.'} KisanPulse’s “Request Registration Help” only sends a help request; it does not submit a government application.${disclaimer}`;
  }
  if (/deadline|last date|closing|अंतिम तारीख|आखिरी तारीख|कब तक/.test(q)) {
    return isHi
      ? `${name} की अंतिम तारीख KisanPulse कैटलॉग में उपलब्ध नहीं है। आधिकारिक पोर्टल ${portal || 'या संबंधित विभाग'} पर वर्तमान तारीख जाँचें।`
      : `The KisanPulse catalogue does not list a current deadline for ${name}. Check ${portal || 'the relevant department'} for the latest date.`;
  }
  return `${formatScheme(scheme, isHi)}${disclaimer}`;
}
