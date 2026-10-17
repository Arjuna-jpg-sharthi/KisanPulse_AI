/**
 * schemeData.js — KisanPulse AI Government SchemeMatch
 *
 * Verified scheme catalogue sourced from official government portals.
 * Each entry includes a `source` URL and `lastVerified` date.
 *
 * ⚠️  KisanPulse AI is NOT an official government service.
 *     Always refer to official portals for the latest rules and to apply.
 *
 * Sources:
 *   - https://www.myscheme.gov.in/
 *   - https://pmkisan.gov.in/
 *   - https://pmfby.gov.in/
 *   - https://soilhealth.dac.gov.in/
 */

// ---------------------------------------------------------------------------
// Categories (support types)
// ---------------------------------------------------------------------------
export const CATEGORIES = [
  { id: 'income_support', label: 'Income Support', labelHi: 'आय सहायता' },
  { id: 'crop_insurance', label: 'Crop Insurance', labelHi: 'फसल बीमा' },
  { id: 'agricultural_credit', label: 'Agricultural Credit', labelHi: 'कृषि ऋण' },
  { id: 'soil_health', label: 'Soil Health', labelHi: 'मृदा स्वास्थ्य' },
];

// ---------------------------------------------------------------------------
// Indian states / UTs (subset – extendable)
// ---------------------------------------------------------------------------
export const STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// ---------------------------------------------------------------------------
// Land holding categories
// ---------------------------------------------------------------------------
export const LAND_CATEGORIES = [
  { id: 'marginal', label: 'Marginal (< 1 hectare)', labelHi: 'सीमांत (< 1 हेक्टेयर)' },
  { id: 'small', label: 'Small (1–2 hectares)', labelHi: 'लघु (1–2 हेक्टेयर)' },
  { id: 'semi_medium', label: 'Semi-Medium (2–4 hectares)', labelHi: 'अर्ध-मध्यम (2–4 हेक्टेयर)' },
  { id: 'medium', label: 'Medium (4–10 hectares)', labelHi: 'मध्यम (4–10 हेक्टेयर)' },
  { id: 'large', label: 'Large (> 10 hectares)', labelHi: 'बड़ा (> 10 हेक्टेयर)' },
];

// ---------------------------------------------------------------------------
// Ownership / cultivation status
// ---------------------------------------------------------------------------
export const OWNERSHIP_TYPES = [
  { id: 'owner', label: 'Land Owner', labelHi: 'भूमि मालिक' },
  { id: 'tenant', label: 'Tenant Farmer', labelHi: 'किरायेदार किसान' },
  { id: 'sharecropper', label: 'Sharecropper', labelHi: 'बटाईदार' },
  { id: 'landless', label: 'Landless Labourer', labelHi: 'भूमिहीन मजदूर' },
];

// ---------------------------------------------------------------------------
// Support need types (maps to categories)
// ---------------------------------------------------------------------------
export const SUPPORT_NEEDS = [
  { id: 'income_support', label: 'Direct Income / Cash Support', labelHi: 'प्रत्यक्ष आय / नकद सहायता' },
  { id: 'crop_insurance', label: 'Crop Insurance / Risk Protection', labelHi: 'फसल बीमा / जोखिम सुरक्षा' },
  { id: 'agricultural_credit', label: 'Loan / Credit Facility', labelHi: 'ऋण / ऋण सुविधा' },
  { id: 'soil_health', label: 'Soil Testing / Health Advisory', labelHi: 'मृदा परीक्षण / स्वास्थ्य सलाह' },
];

// ---------------------------------------------------------------------------
// Scheme catalogue
// ---------------------------------------------------------------------------
export const SCHEMES = [
  // ---- 1. PM-KISAN --------------------------------------------------------
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    nameHi: 'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
    category: 'income_support',
    states: ['All India'],
    purpose:
      'Provides income support to all landholding farmer families across the country to supplement their financial needs for procuring various inputs related to agriculture.',
    purposeHi:
      'देश भर के सभी भूमिधारक किसान परिवारों को कृषि से संबंधित विभिन्न आदानों की खरीद के लिए उनकी वित्तीय जरूरतों को पूरा करने हेतु आय सहायता प्रदान करता है।',
    benefits: [
      'Rs. 6,000 per year in three equal instalments of Rs. 2,000 each',
      'Amount transferred directly to the bank account of the farmer',
    ],
    benefitsHi: [
      'प्रति वर्ष ₹6,000 — तीन समान किस्तों (₹2,000 प्रत्येक) में',
      'राशि सीधे किसान के बैंक खाते में हस्तांतरित',
    ],
    eligibility: [
      'All landholding farmer families (subject to certain exclusion criteria)',
      'Farmer families with cultivable landholding',
      'Exclusion: Institutional landholders, income-tax payers in last assessment year, constitutional post holders, serving/retired government employees drawing pension above Rs. 10,000/month (excluding Multi Tasking Staff / Class IV / Group D employees), professionals like doctors, engineers, lawyers, CAs registered with professional bodies, and retired pensioners with monthly pension of Rs. 10,000 or more',
    ],
    eligibilityHi: [
      'सभी भूमिधारक किसान परिवार (कुछ बहिष्करण मानदंडों के अधीन)',
      'खेती योग्य भूमि वाले किसान परिवार',
      'बहिष्करण: संस्थागत भूमिधारक, आयकर दाता, संवैधानिक पद धारक आदि',
    ],
    documents: [
      'Aadhaar Card (for identification at official portal)',
      'Land ownership records',
      'Bank account details (for direct benefit transfer)',
      'Mobile number',
    ],
    documentsHi: [
      'आधार कार्ड (पहचान के लिए)',
      'भूमि स्वामित्व रिकॉर्ड',
      'बैंक खाता विवरण',
      'मोबाइल नंबर',
    ],
    applicationSteps: [
      'Visit the official PM-KISAN portal: https://pmkisan.gov.in/',
      'Click on "New Farmer Registration"',
      'Enter Aadhaar number and captcha code',
      'Fill in personal, bank, and landholding details',
      'Submit the application',
      'Alternatively, contact the local Patwari / Revenue Officer or Common Service Centre (CSC)',
    ],
    applicationStepsHi: [
      'आधिकारिक पीएम-किसान पोर्टल पर जाएँ: https://pmkisan.gov.in/',
      '"नया किसान पंजीकरण" पर क्लिक करें',
      'आधार नंबर और कैप्चा कोड दर्ज करें',
      'व्यक्तिगत, बैंक और भूमि विवरण भरें',
      'आवेदन जमा करें',
      'या स्थानीय पटवारी / राजस्व अधिकारी / सीएससी से संपर्क करें',
    ],
    department: 'Department of Agriculture and Farmers Welfare, Ministry of Agriculture & Farmers Welfare',
    departmentHi: 'कृषि और किसान कल्याण विभाग, कृषि एवं किसान कल्याण मंत्रालय',
    officialUrl: 'https://pmkisan.gov.in/',
    source: 'https://pmkisan.gov.in/',
    lastVerified: '2024-12-01',
    keywords: ['pm kisan', 'income', 'cash', 'direct benefit', 'dbt', '6000', 'samman nidhi'],
    // Matching rules — used by schemeMatcher.js
    matchRules: {
      ownershipRequired: ['owner'], // primarily for land-owning farmers
      ownershipPreferred: ['tenant', 'sharecropper'], // may qualify in some states
      landCategories: ['marginal', 'small', 'semi_medium', 'medium', 'large'],
      supportNeeds: ['income_support'],
    },
  },

  // ---- 2. PMFBY ----------------------------------------------------------
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    category: 'crop_insurance',
    states: ['All India'],
    purpose:
      'Provides comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest, supporting farmers in case of crop failure.',
    purposeHi:
      'बुवाई से लेकर कटाई के बाद तक अप्रत्याशित प्राकृतिक जोखिमों के खिलाफ व्यापक फसल बीमा कवरेज प्रदान करता है।',
    benefits: [
      'Insurance coverage for crop loss due to natural calamities, pests, and diseases',
      'Low premium: Kharif — 2% of sum insured, Rabi — 1.5%, Commercial/Horticultural — 5%',
      'Balance premium paid by government',
      'Use of technology (remote sensing, drones) for faster claim settlement',
    ],
    benefitsHi: [
      'प्राकृतिक आपदा, कीट और रोगों से फसल हानि के लिए बीमा कवरेज',
      'कम प्रीमियम: खरीफ — बीमित राशि का 2%, रबी — 1.5%, वाणिज्यिक/बागवानी — 5%',
      'शेष प्रीमियम सरकार द्वारा भुगतान',
      'तेज़ दावा निपटान के लिए प्रौद्योगिकी का उपयोग',
    ],
    eligibility: [
      'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas',
      'Voluntary for all farmers (since Kharif 2020)',
      'Both loanee and non-loanee farmers can enrol',
    ],
    eligibilityHi: [
      'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान (बटाईदार व किरायेदार सहित)',
      'सभी किसानों के लिए स्वैच्छिक (खरीफ 2020 से)',
      'ऋणी और गैर-ऋणी दोनों किसान नामांकन कर सकते हैं',
    ],
    documents: [
      'Aadhaar Card',
      'Bank passbook / account details',
      'Land records / tenancy agreement (for tenant / sharecropper)',
      'Sowing certificate from Patwari / Village-level official',
      'Crop sowing declaration',
    ],
    documentsHi: [
      'आधार कार्ड',
      'बैंक पासबुक / खाता विवरण',
      'भूमि रिकॉर्ड / किरायेदारी अनुबंध',
      'बुवाई प्रमाण पत्र',
      'फसल बुवाई घोषणा',
    ],
    applicationSteps: [
      'Visit the official PMFBY portal: https://pmfby.gov.in/',
      'Register and log in',
      'Fill in details — crop, area, season, bank account',
      'Upload required documents',
      'Pay the farmer share of premium',
      'Alternatively, apply through the nearest bank branch, CSC, or authorized insurance agent',
      'Enrolment must be done before the notified cut-off date for each season',
    ],
    applicationStepsHi: [
      'आधिकारिक PMFBY पोर्टल पर जाएँ: https://pmfby.gov.in/',
      'पंजीकरण करें और लॉगिन करें',
      'फसल, क्षेत्र, मौसम, बैंक खाता विवरण भरें',
      'आवश्यक दस्तावेज़ अपलोड करें',
      'प्रीमियम का किसान हिस्सा भुगतान करें',
      'या निकटतम बैंक शाखा, सीएससी, या अधिकृत बीमा एजेंट के माध्यम से आवेदन करें',
    ],
    department: 'Department of Agriculture and Farmers Welfare, Ministry of Agriculture & Farmers Welfare',
    departmentHi: 'कृषि और किसान कल्याण विभाग, कृषि एवं किसान कल्याण मंत्रालय',
    officialUrl: 'https://pmfby.gov.in/',
    source: 'https://pmfby.gov.in/',
    lastVerified: '2024-12-01',
    keywords: ['fasal bima', 'insurance', 'crop insurance', 'premium', 'natural calamity', 'pmfby'],
    matchRules: {
      ownershipRequired: ['owner', 'tenant', 'sharecropper'],
      ownershipPreferred: [],
      landCategories: ['marginal', 'small', 'semi_medium', 'medium', 'large'],
      supportNeeds: ['crop_insurance'],
    },
  },

  // ---- 3. Kisan Credit Card (KCC) ----------------------------------------
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    nameHi: 'किसान क्रेडिट कार्ड (KCC)',
    category: 'agricultural_credit',
    states: ['All India'],
    purpose:
      'Provides affordable short-term formal credit to farmers for their agricultural and allied activities, including crop production, post-harvest expenses, and consumption needs.',
    purposeHi:
      'किसानों को उनकी कृषि और संबद्ध गतिविधियों — फसल उत्पादन, कटाई के बाद के खर्चों और उपभोग की जरूरतों — के लिए सस्ता अल्पकालिक ऋण प्रदान करता है।',
    benefits: [
      'Credit limit based on landholding, cropping pattern and scale of finance',
      'Simplified disbursement procedure',
      'Interest subvention: Effective rate can be as low as 4% per annum for timely repayers (on loans up to Rs. 3 lakh)',
      'Flexibility to withdraw as needed',
      'Coverage under PMFBY for crop loans (if applicable)',
      'Personal Accident Insurance cover of Rs. 50,000 (death) and Rs. 25,000 (disability)',
    ],
    benefitsHi: [
      'भूमि, फसल पैटर्न के आधार पर ऋण सीमा',
      'सरलीकृत संवितरण प्रक्रिया',
      'ब्याज सहायता: समय पर भुगतान करने वालों के लिए प्रभावी दर 4% प्रति वर्ष तक हो सकती है (₹3 लाख तक)',
      'आवश्यकतानुसार निकासी की लचीलापन',
      'व्यक्तिगत दुर्घटना बीमा कवर',
    ],
    eligibility: [
      'Individual farmers — owner cultivators',
      'Tenant farmers, oral lessees, and sharecroppers',
      'Self Help Groups (SHGs) and Joint Liability Groups (JLGs) of farmers',
      'Farmers engaged in animal husbandry, fisheries, and other allied activities',
    ],
    eligibilityHi: [
      'व्यक्तिगत किसान — स्वामी कृषक',
      'किरायेदार किसान, मौखिक पट्टेदार और बटाईदार',
      'स्वयं सहायता समूह (SHG) और संयुक्त देयता समूह (JLG)',
      'पशुपालन, मत्स्य पालन और अन्य संबद्ध गतिविधियों में लगे किसान',
    ],
    documents: [
      'Application form',
      'Identity proof (Aadhaar / Voter ID / Driving Licence)',
      'Address proof',
      'Land records / tenancy proof',
      'Passport-size photographs',
      'Specific documents may vary by bank',
    ],
    documentsHi: [
      'आवेदन पत्र',
      'पहचान प्रमाण (आधार / वोटर आईडी / ड्राइविंग लाइसेंस)',
      'पता प्रमाण',
      'भूमि रिकॉर्ड / किरायेदारी प्रमाण',
      'पासपोर्ट आकार की तस्वीरें',
      'विशिष्ट दस्तावेज़ बैंक के अनुसार भिन्न हो सकते हैं',
    ],
    applicationSteps: [
      'Visit the nearest bank branch (any commercial bank, RRB, or cooperative bank)',
      'Request the KCC application form',
      'Fill in details — personal, landholding, crops, credit requirement',
      'Submit along with required documents',
      'Bank will process and issue the KCC upon approval',
      'Online application may be available via the bank\u2019s website or PM-KISAN portal',
    ],
    applicationStepsHi: [
      'निकटतम बैंक शाखा (वाणिज्यिक बैंक, RRB, या सहकारी बैंक) पर जाएँ',
      'KCC आवेदन पत्र माँगें',
      'व्यक्तिगत, भूमि, फसल, ऋण आवश्यकता विवरण भरें',
      'आवश्यक दस्तावेज़ों के साथ जमा करें',
      'बैंक मंजूरी के बाद KCC जारी करेगा',
    ],
    department: 'Department of Financial Services, Ministry of Finance (implemented through banks)',
    departmentHi: 'वित्तीय सेवा विभाग, वित्त मंत्रालय (बैंकों के माध्यम से लागू)',
    officialUrl: 'https://www.myscheme.gov.in/',
    source: 'https://www.myscheme.gov.in/',
    lastVerified: '2024-12-01',
    keywords: ['kcc', 'credit card', 'loan', 'credit', 'bank', 'interest', 'kisan credit'],
    matchRules: {
      ownershipRequired: ['owner', 'tenant', 'sharecropper'],
      ownershipPreferred: ['landless'], // for allied activities
      landCategories: ['marginal', 'small', 'semi_medium', 'medium', 'large'],
      supportNeeds: ['agricultural_credit'],
    },
  },

  // ---- 4. Soil Health Card Scheme -----------------------------------------
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'soil_health',
    states: ['All India'],
    purpose:
      'Issues Soil Health Cards to farmers carrying crop-wise recommendations of nutrients and fertilisers required for individual farms, to help improve productivity through judicious use of inputs.',
    purposeHi:
      'किसानों को मृदा स्वास्थ्य कार्ड जारी करता है जिसमें उनकी भूमि के लिए फसलवार पोषक तत्वों और उर्वरकों की सिफारिशें होती हैं, ताकि उचित उपयोग से उत्पादकता में सुधार हो।',
    benefits: [
      'Free soil testing and analysis',
      'Soil Health Card with nutrient status and fertiliser recommendations',
      'Crop-wise recommendations for improving soil health',
      'Cards issued every 2 years (in the cycle)',
    ],
    benefitsHi: [
      'निःशुल्क मृदा परीक्षण और विश्लेषण',
      'पोषक तत्व स्थिति और उर्वरक सिफारिशों के साथ मृदा स्वास्थ्य कार्ड',
      'मृदा स्वास्थ्य सुधार के लिए फसलवार सिफारिशें',
      'हर 2 वर्ष में कार्ड जारी (चक्र में)',
    ],
    eligibility: [
      'All farmers across the country',
      'No restriction on landholding size',
      'Both owner and tenant farmers can avail',
    ],
    eligibilityHi: [
      'देश भर के सभी किसान',
      'भूमि आकार पर कोई प्रतिबंध नहीं',
      'स्वामी और किरायेदार दोनों किसान लाभ उठा सकते हैं',
    ],
    documents: [
      'Aadhaar Card / identity proof',
      'Land details (village, survey number, etc.)',
      'Mobile number',
    ],
    documentsHi: [
      'आधार कार्ड / पहचान प्रमाण',
      'भूमि विवरण (गाँव, सर्वेक्षण संख्या आदि)',
      'मोबाइल नंबर',
    ],
    applicationSteps: [
      'Visit the Soil Health Card portal: https://soilhealth.dac.gov.in/',
      'Register with mobile number',
      'Enter farm location and land details',
      'Soil samples will be collected by designated personnel',
      'After testing, Soil Health Card will be issued (online and/or physical)',
      'Alternatively, contact the local agriculture department or Krishi Vigyan Kendra (KVK)',
    ],
    applicationStepsHi: [
      'मृदा स्वास्थ्य कार्ड पोर्टल पर जाएँ: https://soilhealth.dac.gov.in/',
      'मोबाइल नंबर से पंजीकरण करें',
      'खेत का स्थान और भूमि विवरण दर्ज करें',
      'नियुक्त कर्मियों द्वारा मृदा नमूने एकत्र किए जाएँगे',
      'परीक्षण के बाद मृदा स्वास्थ्य कार्ड जारी किया जाएगा',
      'या स्थानीय कृषि विभाग / कृषि विज्ञान केंद्र (KVK) से संपर्क करें',
    ],
    department: 'Department of Agriculture and Farmers Welfare, Ministry of Agriculture & Farmers Welfare',
    departmentHi: 'कृषि और किसान कल्याण विभाग, कृषि एवं किसान कल्याण मंत्रालय',
    officialUrl: 'https://soilhealth.dac.gov.in/',
    source: 'https://soilhealth.dac.gov.in/',
    lastVerified: '2024-12-01',
    keywords: ['soil', 'health card', 'soil testing', 'fertiliser', 'nutrient', 'mitti', 'mrida'],
    matchRules: {
      ownershipRequired: ['owner', 'tenant', 'sharecropper'],
      ownershipPreferred: ['landless'],
      landCategories: ['marginal', 'small', 'semi_medium', 'medium', 'large'],
      supportNeeds: ['soil_health'],
    },
  },
];
