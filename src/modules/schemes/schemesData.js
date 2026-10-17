/**
 * KisanPulse AI — Government Schemes Data
 *
 * Structure per scheme:
 *  - Core bilingual metadata (name, category, benefit, eligibility, documents)
 *  - videoUrl: YouTube embed for a ~40-60s official explainer (or null if unavailable)
 *  - registrationFields: questions we ask the farmer to collect before submitting on their behalf
 *  - serviceFee: our facilitation fee in ₹ (displayed transparently)
 *  - source: 'static' | 'live-feed'   (live-feed entries come from schemeService.js)
 *  - dateAdded: ISO date string
 */

export const STATIC_SCHEMES = [
  // ── 1 ────────────────────────────────────────────────────────────────────
  {
    id: 'pm-kisan',
    nameEn: 'PM-KISAN Samman Nidhi',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    category: 'Direct Income Support',
    categoryHi: 'प्रत्यक्ष आय सहायता',
    benefit: '₹6,000 / year paid in 3 installments of ₹2,000 directly to bank account.',
    benefitHi: '₹6,000 प्रति वर्ष, ₹2,000 की 3 किस्तों में सीधे बैंक खाते में।',
    eligibility: 'All small & marginal landholder farmer families with cultivable landholding.',
    eligibilityHi: 'कृषि योग्य भूमि वाले सभी छोटे और सीमांत किसान परिवार।',
    documents: ['Aadhaar Card', 'Land Ownership Records (Khatauni / 7-12)', 'Active Bank Passbook (Aadhaar-linked)'],
    portalUrl: 'https://pmkisan.gov.in',
    status: 'Active',
    state: 'Central (All India)',
    // YouTube embed (official PM-KISAN Ministry overview — publicly listed)
    videoUrl: 'https://www.youtube.com/embed/7UNF2MBgRoQ',
    videoTitleEn: 'PM-KISAN: How to Register & Check Beneficiary Status',
    videoTitleHi: 'पीएम किसान: पंजीकरण और लाभार्थी स्थिति कैसे जांचें',
    serviceFee: 199,
    dateAdded: '2024-01-01',
    source: 'static',
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name (as on Aadhaar)', labelHi: 'पूरा नाम (आधार अनुसार)', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number (12 digits)', labelHi: 'आधार नंबर (12 अंक)', type: 'text', required: true, pattern: '\\d{12}', hint: 'Will be used only for scheme registration on pmkisan.gov.in' },
      { id: 'phone', labelEn: 'Mobile Number (registered with Aadhaar)', labelHi: 'मोबाइल नंबर (आधार से जुड़ा)', type: 'tel', required: true },
      { id: 'bankAccount', labelEn: 'Bank Account Number', labelHi: 'बैंक खाता नंबर', type: 'text', required: true },
      { id: 'ifsc', labelEn: 'IFSC Code', labelHi: 'IFSC कोड', type: 'text', required: true },
      { id: 'state', labelEn: 'State', labelHi: 'राज्य', type: 'text', required: true },
      { id: 'district', labelEn: 'District', labelHi: 'जिला', type: 'text', required: true },
      { id: 'landKhasra', labelEn: 'Khasra / Survey Number of Land', labelHi: 'खसरा / सर्वे नंबर', type: 'text', required: true },
    ]
  },

  // ── 2 ────────────────────────────────────────────────────────────────────
  {
    id: 'pmfby',
    nameEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    category: 'Crop Insurance',
    categoryHi: 'फसल बीमा',
    benefit: 'Full coverage against flood, drought & pests. Farmer premium only 1.5%–2% of sum insured.',
    benefitHi: 'बाढ़, सूखे और कीटों से पूर्ण बीमा सुरक्षा। किसान प्रीमियम मात्र 1.5%–2%।',
    eligibility: 'All farmers growing notified crops in notified areas (loanee & non-loanee).',
    eligibilityHi: 'अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान।',
    documents: ['Land Possession Certificate (LPC)', 'Sowing Certificate', 'Bank Account Details', 'Aadhaar'],
    portalUrl: 'https://pmfby.gov.in',
    status: 'Active',
    state: 'Central (All India)',
    videoUrl: 'https://www.youtube.com/embed/i6aB9kHMYT4',
    videoTitleEn: 'PMFBY: Crop Insurance Explained in Simple Steps',
    videoTitleHi: 'PMFBY: फसल बीमा — सरल भाषा में पूरी जानकारी',
    serviceFee: 149,
    dateAdded: '2024-01-01',
    source: 'static',
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'tel', required: true },
      { id: 'cropName', labelEn: 'Crop Name to Insure', labelHi: 'बीमा करवाने वाली फसल', type: 'text', required: true },
      { id: 'sowingDate', labelEn: 'Sowing Date', labelHi: 'बुवाई की तारीख', type: 'date', required: true },
      { id: 'landArea', labelEn: 'Land Area (in Hectares)', labelHi: 'भूमि क्षेत्र (हेक्टेयर में)', type: 'number', required: true },
      { id: 'bankAccount', labelEn: 'Bank Account Number', labelHi: 'बैंक खाता नंबर', type: 'text', required: true },
      { id: 'ifsc', labelEn: 'IFSC Code', labelHi: 'IFSC कोड', type: 'text', required: true },
    ]
  },

  // ── 3 ────────────────────────────────────────────────────────────────────
  {
    id: 'soil-health',
    nameEn: 'Soil Health Card Scheme',
    nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'Nutrient Management',
    categoryHi: 'पोषक तत्व प्रबंधन',
    benefit: 'Free soil testing for 12 essential nutrients + customized fertilizer recommendation card.',
    benefitHi: '12 पोषक तत्वों का निःशुल्क परीक्षण + अनुकूलित उर्वरक सिफारिश कार्ड।',
    eligibility: 'All agricultural landowners and operational cultivators.',
    eligibilityHi: 'सभी कृषि भूमि मालिक और काश्तकार।',
    documents: ['Aadhaar Card', 'Field Geo-coordinates', 'Survey / Khasra Number'],
    portalUrl: 'https://soilhealth.dac.gov.in',
    status: 'Active',
    state: 'Central (All India)',
    videoUrl: 'https://www.youtube.com/embed/cOFEb1sJ9HY',
    videoTitleEn: 'Soil Health Card: What It Is & How to Get One',
    videoTitleHi: 'मृदा स्वास्थ्य कार्ड: क्या है और कैसे बनवाएं',
    serviceFee: 99,
    dateAdded: '2024-01-01',
    source: 'static',
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'tel', required: true },
      { id: 'village', labelEn: 'Village / Gram Panchayat', labelHi: 'ग्राम / ग्राम पंचायत', type: 'text', required: true },
      { id: 'khasra', labelEn: 'Khasra / Plot Number', labelHi: 'खसरा / प्लॉट नंबर', type: 'text', required: true },
    ]
  },

  // ── 4 ────────────────────────────────────────────────────────────────────
  {
    id: 'pmksy',
    nameEn: 'PM Krishi Sinchayee Yojana (Per Drop More Crop)',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    category: 'Micro-Irrigation Subsidy',
    categoryHi: 'सूक्ष्म सिंचाई सब्सिडी',
    benefit: 'Up to 55% subsidy for Small/Marginal farmers on Drip & Sprinkler irrigation systems.',
    benefitHi: 'ड्रिप और स्प्रिंकलर प्रणाली पर छोटे किसानों को 55% तक सब्सिडी।',
    eligibility: 'Farmers with an assured water source on cultivable land.',
    eligibilityHi: 'जिन किसानों के पास सुनिश्चित जल स्रोत है।',
    documents: ['Land Records', 'Water Source Proof', 'Electricity / Pump Bill', 'Aadhaar'],
    portalUrl: 'https://pmksy.gov.in',
    status: 'Active',
    state: 'Central & State Co-sponsored',
    videoUrl: 'https://www.youtube.com/embed/mq3mLTCbmjA',
    videoTitleEn: 'PM Krishi Sinchayee Yojana: Drip Irrigation Subsidy Guide',
    videoTitleHi: 'PMKSY: ड्रिप सिंचाई सब्सिडी कैसे पाएं — पूरी जानकारी',
    serviceFee: 249,
    dateAdded: '2024-01-01',
    source: 'static',
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'tel', required: true },
      { id: 'landArea', labelEn: 'Land Area under Irrigation (Hectares)', labelHi: 'सिंचाई योग्य क्षेत्र (हेक्टेयर)', type: 'number', required: true },
      { id: 'irrigationType', labelEn: 'Type of System: Drip / Sprinkler', labelHi: 'प्रणाली का प्रकार: ड्रिप / स्प्रिंकलर', type: 'text', required: true },
      { id: 'state', labelEn: 'State', labelHi: 'राज्य', type: 'text', required: true },
      { id: 'district', labelEn: 'District', labelHi: 'जिला', type: 'text', required: true },
    ]
  },

  // ── 5 ────────────────────────────────────────────────────────────────────
  {
    id: 'smam',
    nameEn: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameHi: 'कृषि यंत्रीकरण उप-मिशन (SMAM)',
    category: 'Farm Machinery Subsidy',
    categoryHi: 'कृषि उपकरण सब्सिडी',
    benefit: '40%–50% subsidy on Tractors, Rotavators, Power Tillers & Laser Land Levelers.',
    benefitHi: 'ट्रैक्टर, रोटावेटर और पावर टिलर पर 40%–50% तक की सरकारी छूट।',
    eligibility: 'Individual farmers, Custom Hiring Centers (CHCs), and FPOs.',
    eligibilityHi: 'व्यक्तिगत किसान, कस्टम हायरिंग सेंटर और एफपीओ।',
    documents: ['Aadhaar', 'Bank Passbook', 'Caste Certificate (if applicable)', 'Dealer Quotation'],
    portalUrl: 'https://agrimachinery.nic.in',
    status: 'Active',
    state: 'State Agricultural Dept',
    videoUrl: 'https://www.youtube.com/embed/2BBFZ8pKmV8',
    videoTitleEn: 'SMAM Farm Machinery Subsidy: How to Apply Online',
    videoTitleHi: 'SMAM कृषि उपकरण सब्सिडी: ऑनलाइन आवेदन कैसे करें',
    serviceFee: 299,
    dateAdded: '2024-01-01',
    source: 'static',
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'tel', required: true },
      { id: 'category', labelEn: 'Farmer Category (General / SC / ST / OBC)', labelHi: 'किसान वर्ग (सामान्य/अनुसूचित जाति/जनजाति)', type: 'text', required: true },
      { id: 'machineryType', labelEn: 'Required Machinery (Tractor / Rotavator / etc.)', labelHi: 'वांछित उपकरण', type: 'text', required: true },
      { id: 'state', labelEn: 'State', labelHi: 'राज्य', type: 'text', required: true },
    ]
  },
];

/**
 * Mock "Live Feed" entries that simulate what the MyScheme.gov.in API
 * would return for recently launched schemes.
 * In production, schemeService.js replaces these with real API responses.
 */
export const MOCK_LIVE_FEED_SCHEMES = [
  {
    id: 'kcc-2025',
    nameEn: 'Kisan Credit Card (KCC) — Enhanced 2025 Edition',
    nameHi: 'किसान क्रेडिट कार्ड (KCC) — 2025 अपडेट',
    category: 'Credit & Finance',
    categoryHi: 'किसान ऋण एवं वित्त',
    benefit: 'Collateral-free crop loan up to ₹3 Lakh at 4% interest p.a. after government interest subvention.',
    benefitHi: '₹3 लाख तक का बिना गारंटी का किसान ऋण — ब्याज सब्सिडी के बाद मात्र 4% प्रतिवर्ष।',
    eligibility: 'All farmers, sharecroppers, oral lessees, self-help groups (SHGs) with agricultural operations.',
    eligibilityHi: 'सभी किसान, बटाईदार, मौखिक पट्टाधारी और स्वयं सहायता समूह।',
    documents: ['Aadhaar', 'Land Records or Tenancy Certificate', 'Passport-size Photo', 'Bank KYC Form'],
    portalUrl: 'https://pmkisan.gov.in/kcc/',
    status: 'Active',
    state: 'Central (All India)',
    videoUrl: 'https://www.youtube.com/embed/fy4RFT4bL3Q',
    videoTitleEn: 'Kisan Credit Card 2025: Full Application Process',
    videoTitleHi: 'किसान क्रेडिट कार्ड 2025: आवेदन से लेकर अप्रूवल तक',
    serviceFee: 199,
    dateAdded: '2025-03-15',
    source: 'live-feed',
    isNew: true,
    registrationFields: [
      { id: 'farmerName', labelEn: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'tel', required: true },
      { id: 'bankName', labelEn: 'Preferred Bank Name', labelHi: 'पसंदीदा बैंक का नाम', type: 'text', required: true },
      { id: 'loanAmount', labelEn: 'Loan Amount Required (₹)', labelHi: 'आवश्यक ऋण राशि (₹)', type: 'number', required: true },
      { id: 'landArea', labelEn: 'Agricultural Land Area (Hectares)', labelHi: 'कृषि भूमि (हेक्टेयर)', type: 'number', required: true },
    ]
  },
  {
    id: 'namo-drone-didi',
    nameEn: 'Namo Drone Didi Scheme (Drone Subsidy for Women SHGs)',
    nameHi: 'नमो ड्रोन दीदी योजना',
    category: 'Agricultural Technology',
    categoryHi: 'कृषि प्रौद्योगिकी',
    benefit: 'Drone provided with up to 80% grant to Women Self-Help Groups for custom hiring to farmers.',
    benefitHi: 'महिला स्वयं सहायता समूहों को किसानों को सेवा देने के लिए 80% अनुदान पर ड्रोन।',
    eligibility: 'Women SHGs linked to LAMPS / DAMul cooperatives with basic training completion.',
    eligibilityHi: 'LAMPS/डामुल सहकारी से जुड़े महिला स्वयं सहायता समूह जिन्होंने प्रशिक्षण पूरा किया है।',
    documents: ['SHG Registration Certificate', 'Bank Account of SHG', 'Aadhaar of all members', 'Training Completion Certificate'],
    portalUrl: 'https://agriwelfare.gov.in',
    status: 'Active',
    state: 'Central (All India)',
    videoUrl: 'https://www.youtube.com/embed/PY6C3J3dDPw',
    videoTitleEn: 'Namo Drone Didi: Empowering Women Farmers with Drones',
    videoTitleHi: 'नमो ड्रोन दीदी: महिला किसानों के लिए ड्रोन क्रांति',
    serviceFee: 349,
    dateAdded: '2025-06-01',
    source: 'live-feed',
    isNew: true,
    registrationFields: [
      { id: 'shgName', labelEn: 'SHG Name', labelHi: 'स्वयं सहायता समूह का नाम', type: 'text', required: true },
      { id: 'leaderName', labelEn: 'SHG Leader Full Name', labelHi: 'समूह नेता का नाम', type: 'text', required: true },
      { id: 'aadhaar', labelEn: 'Leader Aadhaar Number', labelHi: 'नेता का आधार नंबर', type: 'text', required: true, pattern: '\\d{12}' },
      { id: 'phone', labelEn: 'Contact Mobile Number', labelHi: 'संपर्क मोबाइल नंबर', type: 'tel', required: true },
      { id: 'state', labelEn: 'State', labelHi: 'राज्य', type: 'text', required: true },
      { id: 'district', labelEn: 'District', labelHi: 'जिला', type: 'text', required: true },
      { id: 'membersCount', labelEn: 'Number of SHG Members', labelHi: 'समूह में सदस्यों की संख्या', type: 'number', required: true },
    ]
  }
];

/** All schemes merged — live feed entries appear first with "NEW" badge */
export const ALL_SCHEMES = [
  ...MOCK_LIVE_FEED_SCHEMES,
  ...STATIC_SCHEMES,
];

export const SCHEME_CATEGORIES = [
  { id: 'all', labelEn: 'All Categories', labelHi: 'सभी श्रेणियां' },
  { id: 'Direct Income Support', labelEn: 'Direct Income Support', labelHi: 'प्रत्यक्ष आय सहायता' },
  { id: 'Crop Insurance', labelEn: 'Crop Insurance', labelHi: 'फसल बीमा' },
  { id: 'Nutrient Management', labelEn: 'Nutrient Management', labelHi: 'पोषक तत्व प्रबंधन' },
  { id: 'Micro-Irrigation Subsidy', labelEn: 'Irrigation Subsidy', labelHi: 'सिंचाई सब्सिडी' },
  { id: 'Farm Machinery Subsidy', labelEn: 'Farm Machinery', labelHi: 'कृषि उपकरण' },
  { id: 'Credit & Finance', labelEn: 'Credit & Finance', labelHi: 'किसान ऋण' },
  { id: 'Agricultural Technology', labelEn: 'Agriculture Technology', labelHi: 'कृषि प्रौद्योगिकी' },
];
