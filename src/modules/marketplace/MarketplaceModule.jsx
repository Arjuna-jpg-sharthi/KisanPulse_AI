import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Handshake,
  Store,
  Truck,
  Sparkles,
  ShieldAlert,
  Scale,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Coins,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  PackageCheck,
  X,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import './MarketplaceModule.css';
import { rankMarketplaceMatches } from './marketplaceMatchingAdapter.js';

/**
 * ============================================================================
 * KISAN VYAPAR AI DIRECT MARKETPLACE
 * ============================================================================
 * Integration Contract:
 * - Accepts `rankMatches` and `calculateDealComparison` props from matchingEngine.js
 * - Self-contained default matching and deal comparison engines for standalone demo
 * - English and Hindi bilingual UI
 * - Persists user demo listings in browser localStorage
 * - Clear Demo Mode labeling with zero real data collection
 */

// Local Storage Keys
const STORAGE_KEY_FARMER = 'kisanpulse_marketplace_demo_farmer_posts';
const STORAGE_KEY_BUYER = 'kisanpulse_marketplace_demo_buyer_requests';

// Sample Demo Listings (Contract Compliant)
const INITIAL_DEMO_FARMER_POSTS = [
  {
    id: 'demo-farmer-1',
    crop: 'Wheat',
    variety: 'Sharbati 1544',
    quantityQuintals: 150,
    harvestDate: '2026-10-24',
    expectedPricePerQuintal: 2520,
    district: 'Sehore',
    state: 'Madhya Pradesh',
    grade: 'Grade A',
    moisture: '11.2%'
  },
  {
    id: 'demo-farmer-2',
    crop: 'Paddy / Rice',
    variety: 'Pusa Basmati 1121',
    quantityQuintals: 280,
    harvestDate: '2026-10-28',
    expectedPricePerQuintal: 3650,
    district: 'Karnal',
    state: 'Haryana',
    grade: 'Premium Export',
    moisture: '12.0%'
  },
  {
    id: 'demo-farmer-3',
    crop: 'Soybean',
    variety: 'JS 9560',
    quantityQuintals: 95,
    harvestDate: '2026-10-22',
    expectedPricePerQuintal: 4700,
    district: 'Indore',
    state: 'Madhya Pradesh',
    grade: 'FAQ',
    moisture: '10.5%'
  },
  {
    id: 'demo-farmer-4',
    crop: 'Mustard',
    variety: 'Pusa Bold',
    quantityQuintals: 65,
    harvestDate: '2026-11-05',
    expectedPricePerQuintal: 5550,
    district: 'Alwar',
    state: 'Rajasthan',
    grade: 'Grade A',
    moisture: '8.0%'
  },
  {
    id: 'demo-farmer-5',
    crop: 'Cotton',
    variety: 'Bt Shankar 6',
    quantityQuintals: 110,
    harvestDate: '2026-11-02',
    expectedPricePerQuintal: 7250,
    district: 'Rajkot',
    state: 'Gujarat',
    grade: 'Medium Staple Premium',
    moisture: '9.0%'
  },
  {
    id: 'demo-farmer-6',
    crop: 'Onion',
    variety: 'Nashik Red Gavran',
    quantityQuintals: 210,
    harvestDate: '2026-10-20',
    expectedPricePerQuintal: 2800,
    district: 'Nashik',
    state: 'Maharashtra',
    grade: 'Grade A',
    moisture: 'Dry Cured'
  }
];

const INITIAL_DEMO_BUYER_REQUESTS = [
  {
    id: 'demo-buyer-1',
    crop: 'Wheat',
    quantityQuintals: 200,
    maxPricePerQuintal: 2580,
    neededBy: '2026-10-31',
    district: 'Indore',
    state: 'Madhya Pradesh'
  },
  {
    id: 'demo-buyer-2',
    crop: 'Paddy / Rice',
    quantityQuintals: 250,
    maxPricePerQuintal: 3720,
    neededBy: '2026-11-05',
    district: 'Panipat',
    state: 'Haryana'
  },
  {
    id: 'demo-buyer-3',
    crop: 'Soybean',
    quantityQuintals: 120,
    maxPricePerQuintal: 4780,
    neededBy: '2026-10-28',
    district: 'Dewas',
    state: 'Madhya Pradesh'
  },
  {
    id: 'demo-buyer-4',
    crop: 'Mustard',
    quantityQuintals: 80,
    maxPricePerQuintal: 5600,
    neededBy: '2026-11-12',
    district: 'Jaipur',
    state: 'Rajasthan'
  },
  {
    id: 'demo-buyer-5',
    crop: 'Cotton',
    quantityQuintals: 150,
    maxPricePerQuintal: 7350,
    neededBy: '2026-11-10',
    district: 'Ahmedabad',
    state: 'Gujarat'
  },
  {
    id: 'demo-buyer-6',
    crop: 'Onion',
    quantityQuintals: 250,
    maxPricePerQuintal: 2950,
    neededBy: '2026-10-26',
    district: 'Pune',
    state: 'Maharashtra'
  }
];

// Major crops for dropdowns and filters
const CROP_CATALOG = [
  { key: 'Wheat', en: 'Wheat', hi: 'गेहूं' },
  { key: 'Paddy / Rice', en: 'Paddy / Rice', hi: 'धान / चावल' },
  { key: 'Soybean', en: 'Soybean', hi: 'सोयाबीन' },
  { key: 'Mustard', en: 'Mustard', hi: 'सरसों' },
  { key: 'Cotton', en: 'Cotton', hi: 'कपास' },
  { key: 'Onion', en: 'Onion', hi: 'प्याज' },
  { key: 'Chana', en: 'Chana / Chickpea', hi: 'चना' },
  { key: 'Potato', en: 'Potato', hi: 'आलू' },
  { key: 'Maize', en: 'Maize / Corn', hi: 'मक्का' }
];

// Major agricultural states and districts
const STATE_DISTRICT_MAP = {
  'Madhya Pradesh': ['Sehore', 'Indore', 'Ujjain', 'Dewas', 'Bhopal', 'Vidisha', 'Hoshangabad'],
  'Haryana': ['Karnal', 'Panipat', 'Kurukshetra', 'Ambala', 'Hisar', 'Sirsa'],
  'Punjab': ['Ludhiana', 'Patiala', 'Sangrur', 'Bathinda', 'Amritsar', 'Jalandhar'],
  'Rajasthan': ['Alwar', 'Kota', 'Sri Ganganagar', 'Baran', 'Jaipur', 'Bharatpur'],
  'Maharashtra': ['Nashik', 'Pune', 'Ahmednagar', 'Nagpur', 'Jalgaon', 'Solapur'],
  'Gujarat': ['Rajkot', 'Gondal', 'Surat', 'Junagadh', 'Mehsana', 'Ahmedabad'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Meerut', 'Bareilly', 'Kanpur', 'Mathura']
};

// In-module comprehensive translations
const I18N = {
  en: {
    moduleTitle: 'Kisan Vyapar AI Marketplace',
    moduleBadge: 'Direct Bilateral Trade Simulation',
    moduleSubtitle: 'Empowering farmers to discover direct buyer requirements, evaluate ranked match compatibility, and analyze logistics costs without intermediary cuts.',
    demoNoticeTitle: 'Simulation Demo Mode Notice',
    demoNoticeDesc: 'This interface is an interactive demo for SIH & agricultural trade matching. All posts, counterparties, and economics are simulated. No sensitive personal or banking data is collected.',
    roleSelectorLabel: 'Interactive Demo Role Switcher',
    farmerRoleTitle: 'Farmer Demo Mode',
    farmerRoleDesc: 'Post farm harvest & discover ranked buyers with freight insights',
    buyerRoleTitle: 'Buyer Demo Mode',
    buyerRoleDesc: 'Post procurement demand & match with available farmer stocks',
    statTotalPosts: 'Active Demo Posts',
    statDemandMatches: 'Counterparty Demands',
    statAvgMatch: 'Avg Match Score',
    statFreightAvg: 'Avg Est. Freight',
    newPostFarmerBtn: 'Post Crop Listing (Demo)',
    newPostBuyerBtn: 'Post Buyer Request (Demo)',
    resetDataBtn: 'Reset Demo Data',
    resetConfirm: 'Reset demo marketplace data back to default sample listings?',
    searchPlaceholder: 'Search by crop, variety, district, or state...',
    filterCrop: 'All Crops',
    filterState: 'All States',
    myListingsTab: 'My Demo Postings',
    allListingsTab: 'All Marketplace Listings',
    noListingsFound: 'No listings match your search or filter criteria.',
    adjustFilters: 'Try adjusting filters or post a new demo listing above.',
    farmerPostTitle: 'Farmer Crop Harvest Listing',
    buyerPostTitle: 'Buyer Procurement Requirement',
    cropLabel: 'Crop',
    varietyLabel: 'Variety / Cultivar',
    quantityLabel: 'Quantity (Quintals)',
    expectedPriceLabel: 'Expected Price (₹ / quintal)',
    maxPriceLabel: 'Max Purchase Price (₹ / quintal)',
    harvestDateLabel: 'Harvest / Ready Date',
    neededByLabel: 'Needed By Date',
    stateLabel: 'State',
    districtLabel: 'District / Mandi Zone',
    gradeLabel: 'Grade / Quality Note (Optional)',
    moistureLabel: 'Moisture % Note (Optional)',
    gradePlaceholder: 'e.g. Grade A, FAQ, Export Quality',
    moisturePlaceholder: 'e.g. 11.2%, < 12%',
    cancelBtn: 'Cancel',
    saveFarmerPost: 'Publish Farmer Post (Demo)',
    saveBuyerRequest: 'Publish Buyer Request (Demo)',
    demoSampleBadge: 'Demo Sample',
    userPostBadge: 'My Demo Post',
    viewMatchesBtn: 'View Ranked Matches',
    hideMatchesBtn: 'Hide Matches',
    deletePostBtn: 'Remove Post',
    deleteConfirm: 'Are you sure you want to remove this demo post?',
    rankedMatchesFor: 'Ranked Matches for',
    matchScore: 'Match Score',
    plainReasonsTitle: 'Match Justifications & Telemetry',
    priceCompatibilityTitle: 'Price Viability',
    freightBreakdownTitle: 'Estimated Freight & Logistics Cost',
    distanceEst: 'Est. Transit Distance',
    freightPerQtl: 'Freight / Qtl',
    totalFreightCost: 'Total Logistics Cost',
    netFarmerPrice: 'Net Realized Price',
    compareDealBtn: 'Compare Deal Economics',
    dealModalTitle: 'Direct Deal Economics & Savings Analysis',
    dealModalSubtitle: 'Comparing farmer net realization vs conventional APMC mandi channels',
    farmerOffer: 'Farmer Expected Rate',
    buyerCeiling: 'Buyer Ceiling Rate',
    dealFairPrice: 'Recommended Bilateral Price',
    mandiSavingsEst: 'Intermediary Savings Estimate',
    closeBtn: 'Close Analysis',
    directSavingsNote: 'Direct bilateral trading eliminates 2.5% middleman commission and 1.5% APMC market charges, providing mutual profit to both parties.',
    demoFootnote: 'Simulated matching engine. On the live integration branch, ranked scores are calculated via matchingEngine.js.'
  },
  hi: {
    moduleTitle: 'किसान व्यापार एआई बाज़ार',
    moduleBadge: 'सीधा कृषि व्यापार सिमुलेशन',
    moduleSubtitle: 'किसानों को सीधे खरीदारों की मांग से जोड़ना, रैंक किए गए मैचों की अनुकूलता परखना और बिना बिचौलियों के माल ढुलाई खर्च का पारदर्शी विश्लेषण करना।',
    demoNoticeTitle: 'डेमो सिमुलेशन सूचना',
    demoNoticeDesc: 'यह इंटरफ़ेस एक इंटरैक्टिव डेमो है। सभी पोस्ट, खरीदार और आंकड़े केवल प्रदर्शन के लिए सिमुलेट किए गए हैं। कोई संवेदनशील या बैंक विवरण एकत्र नहीं किया जाता है।',
    roleSelectorLabel: 'इंटरैक्टिव डेमो भूमिका चयन',
    farmerRoleTitle: 'किसान विक्रेता मोड',
    farmerRoleDesc: 'अपनी फसल पोस्ट करें और रैंक किए गए खरीदारों की मांग देखें',
    buyerRoleTitle: 'व्यापारी / खरीदार मोड',
    buyerRoleDesc: 'अपनी खरीद मांग पोस्ट करें और उपलब्ध किसान स्टॉक से मिलान करें',
    statTotalPosts: 'सक्रिय डेमो पोस्ट',
    statDemandMatches: 'उपलब्ध मांग रिकॉर्ड',
    statAvgMatch: 'औसत मैच स्कोर',
    statFreightAvg: 'औसत ढुलाई खर्च',
    newPostFarmerBtn: 'नई फसल पोस्ट करें (डेमो)',
    newPostBuyerBtn: 'खरीद मांग पोस्ट करें (डेमो)',
    resetDataBtn: 'डेमो डेटा रीसेट करें',
    resetConfirm: 'क्या आप सभी डेमो पोस्ट्स को प्रारंभिक सैंपल डेटा पर रीसेट करना चाहते हैं?',
    searchPlaceholder: 'फसल, किस्म, जिला या राज्य से खोजें...',
    filterCrop: 'सभी फसलें',
    filterState: 'सभी राज्य',
    myListingsTab: 'मेरी डेमो पोस्टिंग्स',
    allListingsTab: 'बाज़ार की सभी लिस्टिंग्स',
    noListingsFound: 'आपकी खोज या फ़िल्टर से कोई लिस्टिंग नहीं मिली।',
    adjustFilters: 'कृपया फ़िल्टर बदलें या ऊपर से नई डेमो पोस्ट जोड़ें।',
    farmerPostTitle: 'किसान फसल विक्रय प्रविष्टि',
    buyerPostTitle: 'व्यापारी खरीद मांग प्रविष्टि',
    cropLabel: 'फसल का नाम',
    varietyLabel: 'किस्म (Variety)',
    quantityLabel: 'मात्रा (क्विंटल में)',
    expectedPriceLabel: 'अपेक्षित मूल्य (₹ / क्विंटल)',
    maxPriceLabel: 'अधिकतम खरीद मूल्य (₹ / क्विंटल)',
    harvestDateLabel: 'कटाई / तैयार तिथि',
    neededByLabel: 'आवश्यकता तिथि',
    stateLabel: 'राज्य',
    districtLabel: 'जिला / मंडी क्षेत्र',
    gradeLabel: 'ग्रेड / गुणवत्ता (वैकल्पिक)',
    moistureLabel: 'नमी % टिप्पणी (वैकल्पिक)',
    gradePlaceholder: 'उदा. ग्रेड ए, एफएक्यू, निर्यात मानक',
    moisturePlaceholder: 'उदा. 11.2%, 12% से कम',
    cancelBtn: 'रद्द करें',
    saveFarmerPost: 'किसान पोस्ट प्रकाशित करें (डेमो)',
    saveBuyerRequest: 'खरीद मांग प्रकाशित करें (डेमो)',
    demoSampleBadge: 'डेमो सैंपल',
    userPostBadge: 'मेरी डेमो प्रविष्टि',
    viewMatchesBtn: 'रैंक किए गए मैच देखें',
    hideMatchesBtn: 'मैच बंद करें',
    deletePostBtn: 'पोस्ट हटाएं',
    deleteConfirm: 'क्या आप निश्चित रूप से इस डेमो पोस्ट को हटाना चाहते हैं?',
    rankedMatchesFor: 'के लिए रैंक किए गए मैच:',
    matchScore: 'मैच स्कोर',
    plainReasonsTitle: 'मिलान के मुख्य कारण व विश्लेषण',
    priceCompatibilityTitle: 'मूल्य अनुकूलता',
    freightBreakdownTitle: 'अनुमानित ढुलाई व लॉजिस्टिक्स खर्च',
    distanceEst: 'अनुमानित दूरी',
    freightPerQtl: 'ढुलाई / क्विंटल',
    totalFreightCost: 'कुल लॉजिस्टिक्स खर्च',
    netFarmerPrice: 'शुद्ध प्राप्ति मूल्य',
    compareDealBtn: 'सौदा अर्थशास्त्र तुलना',
    dealModalTitle: 'सीधा सौदा अर्थशास्त्र व बचत विश्लेषण',
    dealModalSubtitle: 'पारंपरिक एपीएमसी मंडी की तुलना में किसान व खरीदार की शुद्ध बचत',
    farmerOffer: 'किसान का अपेक्षित भाव',
    buyerCeiling: 'खरीदार का अधिकतम भाव',
    dealFairPrice: 'संतुलित सुझाया गया भाव',
    mandiSavingsEst: 'बिचौलिया बचत अनुमान',
    closeBtn: 'बंद करें',
    directSavingsNote: 'सीधे द्विपक्षीय सौदे से 2.5% आढ़तिया कमीशन और 1.5% मंडी शुल्क की बचत होती है, जिससे दोनों पक्षों को लाभ मिलता है।',
    demoFootnote: 'सिमुलेटेड मैचिंग इंजन। मुख्य इंटीग्रेशन शाखा पर मैचिंग इंजन से वास्तविक रैंकिंग की जाएगी।'
  }
};

/**
 * Default fallback matching engine
 * Used when `rankMatches` prop is not passed
 */
function defaultRankMatches(activeItem, candidateList, role) {
  if (!activeItem || !candidateList || !candidateList.length) return [];

  const results = candidateList.map((candidate) => {
    // 1. Commodity matching
    const cropMatch =
      candidate.crop.toLowerCase().trim() === activeItem.crop.toLowerCase().trim();
    if (!cropMatch) {
      return null;
    }

    // 2. Price comparison
    let priceScore = 50;
    let priceDiff = 0;
    let priceCompatibility = {};

    if (role === 'farmer') {
      // activeItem is Farmer Post, candidate is Buyer Request
      const farmerExpected = Number(activeItem.expectedPricePerQuintal) || 0;
      const buyerMax = Number(candidate.maxPricePerQuintal) || 0;
      priceDiff = buyerMax - farmerExpected;

      if (priceDiff >= 0) {
        priceScore = 95;
        priceCompatibility = {
          status: 'favorable',
          farmerPrice: farmerExpected,
          buyerMaxPrice: buyerMax,
          diff: priceDiff,
          summary: `Buyer ceiling ₹${buyerMax} fully satisfies expected ₹${farmerExpected} (+₹${priceDiff}/qtl surplus)`
        };
      } else if (Math.abs(priceDiff) <= 150) {
        priceScore = 75;
        priceCompatibility = {
          status: 'negotiable',
          farmerPrice: farmerExpected,
          buyerMaxPrice: buyerMax,
          diff: priceDiff,
          summary: `Slight difference of ₹${Math.abs(priceDiff)}/qtl — strong negotiation candidate`
        };
      } else {
        priceScore = 40;
        priceCompatibility = {
          status: 'gap',
          farmerPrice: farmerExpected,
          buyerMaxPrice: buyerMax,
          diff: priceDiff,
          summary: `Price gap of ₹${Math.abs(priceDiff)}/qtl exceeds standard bargaining band`
        };
      }
    } else {
      // activeItem is Buyer Request, candidate is Farmer Post
      const buyerMax = Number(activeItem.maxPricePerQuintal) || 0;
      const farmerExpected = Number(candidate.expectedPricePerQuintal) || 0;
      priceDiff = buyerMax - farmerExpected;

      if (priceDiff >= 0) {
        priceScore = 95;
        priceCompatibility = {
          status: 'favorable',
          farmerPrice: farmerExpected,
          buyerMaxPrice: buyerMax,
          diff: priceDiff,
          summary: `Farmer offer ₹${farmerExpected} is within your budget of ₹${buyerMax}`
        };
      } else {
        priceScore = Math.max(30, 80 - Math.abs(priceDiff) / 10);
        priceCompatibility = {
          status: 'gap',
          farmerPrice: farmerExpected,
          buyerMaxPrice: buyerMax,
          diff: priceDiff,
          summary: `Farmer expected ₹${farmerExpected} is ₹${Math.abs(priceDiff)} above budget`
        };
      }
    }

    // 3. Proximity and Distance
    const sameDistrict =
      (activeItem.district || '').toLowerCase().trim() ===
      (candidate.district || '').toLowerCase().trim();
    const sameState =
      (activeItem.state || '').toLowerCase().trim() ===
      (candidate.state || '').toLowerCase().trim();

    let estimatedDist = 35;
    let distanceScore = 50;

    if (sameDistrict) {
      estimatedDist = 28;
      distanceScore = 98;
    } else if (sameState) {
      estimatedDist = 85;
      distanceScore = 80;
    } else {
      estimatedDist = 320;
      distanceScore = 50;
    }

    // 4. Quantity fit
    const qty1 = Number(activeItem.quantityQuintals) || 1;
    const qty2 = Number(candidate.quantityQuintals) || 1;
    const qtyRatio = Math.min(qty1, qty2) / Math.max(qty1, qty2);
    const quantityScore = Math.round(qtyRatio * 100);

    // 5. Total Match Score calculation (weighted)
    const matchScore = Math.min(
      99,
      Math.max(
        42,
        Math.round(priceScore * 0.45 + distanceScore * 0.35 + quantityScore * 0.2)
      )
    );

    // 6. Plain-language reasons
    const reasons = [
      `Exact commodity match: ${activeItem.crop}`,
      priceCompatibility.summary,
      sameDistrict
        ? `Hyper-local transit: Under ${estimatedDist} km dispatch within ${activeItem.district}`
        : sameState
        ? `Intra-state corridor: ~${estimatedDist} km transit across ${activeItem.state}`
        : `Inter-state route: ~${estimatedDist} km dispatch corridor`,
      `Volume match: ${candidate.quantityQuintals} quintals available vs ${activeItem.quantityQuintals} quintals required`
    ];

    if (candidate.variety && role === 'farmer') {
      reasons.push(`Preferred cultivar: ${candidate.variety}`);
    }
    if (candidate.grade) {
      reasons.push(`Quality verified: ${candidate.grade}`);
    }

    // 7. Estimated Freight Breakdown
    const freightRatePerQtl = Math.max(35, Math.round(estimatedDist * 0.75 + 20));
    const tradeVolume = Math.min(qty1, qty2);
    const totalFreight = freightRatePerQtl * tradeVolume;
    const loadingHandling = tradeVolume * 10;
    const totalLogisticsCost = totalFreight + loadingHandling;

    const baseFarmerPrice =
      role === 'farmer'
        ? Number(activeItem.expectedPricePerQuintal)
        : Number(candidate.expectedPricePerQuintal);
    const netRealizedPrice = Math.max(0, baseFarmerPrice - freightRatePerQtl);

    const freightBreakdown = {
      estimatedDistanceKm: estimatedDist,
      freightPerQuintal: freightRatePerQtl,
      totalFreight,
      loadingCharges: loadingHandling,
      totalLogisticsCost,
      netRealizedPrice,
      intermediarySavingsEst: Math.round(tradeVolume * baseFarmerPrice * 0.04)
    };

    return {
      target: candidate,
      matchScore,
      reasons,
      priceCompatibility,
      freightBreakdown
    };
  });

  return results
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Default fallback deal comparison engine
 * Used when `calculateDealComparison` prop is not passed
 */
function defaultCalculateDealComparison(farmerPost, buyerRequest) {
  const fPrice = Number(farmerPost.expectedPricePerQuintal) || 0;
  const bPrice = Number(buyerRequest.maxPricePerQuintal) || 0;
  const agreedQty = Math.min(
    Number(farmerPost.quantityQuintals) || 0,
    Number(buyerRequest.quantityQuintals) || 0
  );

  const fairMidpoint = Math.round((fPrice + bPrice) / 2);
  const grossTradeValue = agreedQty * fairMidpoint;

  // Intermediary cuts benchmark in traditional APMC:
  // ~2.5% Arthiya commission + 1.5% Mandi Cess + ₹15/qtl handling fee
  const traditionalCommission = Math.round(grossTradeValue * 0.025);
  const traditionalMandiCess = Math.round(grossTradeValue * 0.015);
  const totalMandiCuts = traditionalCommission + traditionalMandiCess;

  const sameDistrict =
    (farmerPost.district || '').toLowerCase().trim() ===
    (buyerRequest.district || '').toLowerCase().trim();
  const estDistKm = sameDistrict ? 32 : 90;
  const freightPerQtl = Math.max(35, Math.round(estDistKm * 0.7 + 20));
  const totalFreight = freightPerQtl * agreedQty;

  const farmerDirectNet = fPrice - Math.round(freightPerQtl / 2);
  const buyerDirectLanded = bPrice + Math.round(freightPerQtl / 2);

  return {
    crop: farmerPost.crop,
    variety: farmerPost.variety || 'Standard FAQ',
    quantityAgreed: agreedQty,
    farmerExpectedRate: fPrice,
    buyerCeilingRate: bPrice,
    fairMidpointRate: fairMidpoint,
    grossTradeValue,
    estimatedDistanceKm: estDistKm,
    estimatedFreightPerQuintal: freightPerQtl,
    totalFreightCost: totalFreight,
    traditionalMandiCutsSaved: totalMandiCuts,
    farmerNetRealization: farmerDirectNet,
    buyerLandedCost: buyerDirectLanded,
    recommendation:
      fPrice <= bPrice
        ? 'High viability bilateral transaction. Direct procurement delivers instant payment and bypasses APMC delays.'
        : 'Viable deal subject to minor freight-sharing agreement between farmer and buyer.'
  };
}

/**
 * Main Kisan Vyapar Marketplace Component
 */
export default function MarketplaceModule({
  language: propLanguage,
  isOffline = false,
  t: propT,
  navigate,
  rankMatches = rankMarketplaceMatches,
  calculateDealComparison = defaultCalculateDealComparison,
  initialRole = 'farmer'
}) {
  // Safe resolution of LanguageContext if mounted in AppShell
  let contextLang = null;
  try {
    contextLang = useLanguage();
  } catch (e) {
    contextLang = null;
  }

  const activeLang = propLanguage || (contextLang && contextLang.language) || 'en';
  const isHi = activeLang === 'hi';

  const t = useCallback(
    (key, fallback = '') => {
      if (propT) {
        const val = propT(key);
        if (val && val !== key) return val;
      }
      const dict = I18N[activeLang] || I18N.en;
      if (dict && dict[key] !== undefined) return dict[key];
      return fallback || (I18N.en && I18N.en[key]) || key;
    },
    [activeLang, propT]
  );

  // Demo role: 'farmer' or 'buyer'
  const [role, setRole] = useState(initialRole);

  // Persistence in localStorage
  const [farmerPosts, setFarmerPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FARMER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Marketplace: Error reading farmer posts from localStorage', e);
    }
    return INITIAL_DEMO_FARMER_POSTS;
  });

  const [buyerRequests, setBuyerRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUYER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Marketplace: Error reading buyer requests from localStorage', e);
    }
    return INITIAL_DEMO_BUYER_REQUESTS;
  });

  // Persist whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FARMER, JSON.stringify(farmerPosts));
    } catch (e) {
      console.warn('Failed to save farmer posts', e);
    }
  }, [farmerPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUYER, JSON.stringify(buyerRequests));
    } catch (e) {
      console.warn('Failed to save buyer requests', e);
    }
  }, [buyerRequests]);

  // UI State: filter, search, view active match, form visibility, deal modal
  const [activeTab, setActiveTab] = useState('myListings'); // 'myListings' | 'allListings'
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMatchedPost, setActiveMatchedPost] = useState(null);
  const [activeDealComparison, setActiveDealComparison] = useState(null);

  // Form states
  const [formCrop, setFormCrop] = useState('Wheat');
  const [formVariety, setFormVariety] = useState('');
  const [formQuantity, setFormQuantity] = useState(100);
  const [formPrice, setFormPrice] = useState(2500);
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [formState, setFormState] = useState('Madhya Pradesh');
  const [formDistrict, setFormDistrict] = useState('Sehore');
  const [formGrade, setFormGrade] = useState('');
  const [formMoisture, setFormMoisture] = useState('');
  const [formError, setFormError] = useState('');

  // Update district when state changes
  const handleStateChange = (newState) => {
    setFormState(newState);
    const districts = STATE_DISTRICT_MAP[newState] || [];
    setFormDistrict(districts[0] || '');
  };

  // Reset to default initial demo data
  const handleResetData = () => {
    if (window.confirm(t('resetConfirm', 'Reset demo marketplace data back to default sample listings?'))) {
      setFarmerPosts(INITIAL_DEMO_FARMER_POSTS);
      setBuyerRequests(INITIAL_DEMO_BUYER_REQUESTS);
      setActiveMatchedPost(null);
      setActiveDealComparison(null);
      localStorage.removeItem(STORAGE_KEY_FARMER);
      localStorage.removeItem(STORAGE_KEY_BUYER);
    }
  };

  // Handle post creation
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!formCrop || !formQuantity || !formPrice || !formDistrict || !formState) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }
    setFormError('');

    const newId = `demo-user-${Date.now()}`;

    if (role === 'farmer') {
      const newFarmerPost = {
        id: newId,
        crop: formCrop,
        variety: formVariety.trim() || 'Desi FAQ Standard',
        quantityQuintals: Number(formQuantity),
        harvestDate: formDate,
        expectedPricePerQuintal: Number(formPrice),
        district: formDistrict,
        state: formState,
        grade: formGrade.trim() || undefined,
        moisture: formMoisture.trim() || undefined,
        isUserCreated: true
      };
      setFarmerPosts((prev) => [newFarmerPost, ...prev]);
    } else {
      const newBuyerRequest = {
        id: newId,
        crop: formCrop,
        quantityQuintals: Number(formQuantity),
        maxPricePerQuintal: Number(formPrice),
        neededBy: formDate,
        district: formDistrict,
        state: formState,
        isUserCreated: true
      };
      setBuyerRequests((prev) => [newBuyerRequest, ...prev]);
    }

    setShowAddForm(false);
  };

  // Handle post removal
  const handleDeletePost = (id, targetRole) => {
    if (window.confirm(t('deleteConfirm', 'Are you sure you want to remove this demo post?'))) {
      if (targetRole === 'farmer') {
        setFarmerPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setBuyerRequests((prev) => prev.filter((r) => r.id !== id));
      }
      if (activeMatchedPost && activeMatchedPost.id === id) {
        setActiveMatchedPost(null);
      }
    }
  };

  // Filtered listings
  const filteredFarmerPosts = useMemo(() => {
    return farmerPosts.filter((item) => {
      const matchesCrop =
        selectedCropFilter === 'all' || item.crop === selectedCropFilter;
      const matchesState =
        selectedStateFilter === 'all' || item.state === selectedStateFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.crop.toLowerCase().includes(query) ||
        (item.variety && item.variety.toLowerCase().includes(query)) ||
        item.district.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query);

      return matchesCrop && matchesState && matchesQuery;
    });
  }, [farmerPosts, selectedCropFilter, selectedStateFilter, searchQuery]);

  const filteredBuyerRequests = useMemo(() => {
    return buyerRequests.filter((item) => {
      const matchesCrop =
        selectedCropFilter === 'all' || item.crop === selectedCropFilter;
      const matchesState =
        selectedStateFilter === 'all' || item.state === selectedStateFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.crop.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query);

      return matchesCrop && matchesState && matchesQuery;
    });
  }, [buyerRequests, selectedCropFilter, selectedStateFilter, searchQuery]);

  // Current listings list based on active tab & role
  const activeListings = useMemo(() => {
    if (activeTab === 'myListings') {
      return role === 'farmer' ? filteredFarmerPosts : filteredBuyerRequests;
    } else {
      // Counterparty market overview
      return role === 'farmer' ? filteredBuyerRequests : filteredFarmerPosts;
    }
  }, [activeTab, role, filteredFarmerPosts, filteredBuyerRequests]);

  // Ranked Matches for selected post
  const rankedMatchesList = useMemo(() => {
    if (!activeMatchedPost) return [];
    const candidates = role === 'farmer' ? buyerRequests : farmerPosts;
    return rankMatches(activeMatchedPost, candidates, role);
  }, [activeMatchedPost, role, buyerRequests, farmerPosts, rankMatches]);

  // Deal comparison calculation trigger
  const handleOpenDealComparison = (matchTarget) => {
    const farmer = role === 'farmer' ? activeMatchedPost : matchTarget;
    const buyer = role === 'farmer' ? matchTarget : activeMatchedPost;
    const comparison = calculateDealComparison(farmer, buyer);
    setActiveDealComparison(comparison);
  };

  return (
    <div className="kp-marketplace-root">
      {/* Top Hero Banner */}
      <div className="kp-mkt-banner">
        <div className="kp-mkt-banner-glow" />
        <div className="kp-mkt-banner-header">
          <div className="kp-mkt-banner-badge-group">
            <span className="kp-mkt-badge-demo">
              <Sparkles size={14} />
              {t('moduleBadge', 'Direct Bilateral Trade Simulation')}
            </span>
            <span className="kp-badge kp-badge-info">
              {isOffline ? 'Offline Demo Cache' : 'Live Simulation Engine'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }}
            icon={<RotateCcw size={14} />}
            onClick={handleResetData}
          >
            {t('resetDataBtn', 'Reset Demo Data')}
          </Button>
        </div>
        <h1 className="kp-mkt-banner-title">
          {t('moduleTitle', 'Kisan Vyapar AI Marketplace')}
        </h1>
        <p className="kp-mkt-banner-desc">
          {t('moduleSubtitle', 'Empowering farmers to discover direct buyer requirements, evaluate ranked match compatibility, and analyze logistics costs without intermediary cuts.')}
        </p>
      </div>

      {/* Demo Mode Disclaimer Notice */}
      <div className="kp-mkt-demo-alert">
        <ShieldAlert size={22} className="kp-mkt-demo-alert-icon" />
        <div>
          <div className="kp-mkt-demo-alert-title">
            {t('demoNoticeTitle', 'Simulation Demo Mode Notice')}
          </div>
          <p className="kp-mkt-demo-alert-text">
            {t('demoNoticeDesc', 'This interface is an interactive demo for SIH & agricultural trade matching. All posts, counterparties, and economics are simulated. No sensitive personal or banking data is collected.')}
          </p>
        </div>
      </div>

      {/* Demo Role Switcher */}
      <div className="kp-mkt-role-container">
        <div className="kp-mkt-role-label-row">
          <span className="kp-mkt-role-tag">
            <SlidersHorizontal size={14} />
            {t('roleSelectorLabel', 'Interactive Demo Role Switcher')}
          </span>
          <span className="kp-badge kp-badge-neutral">
            Role: <strong>{role === 'farmer' ? 'Farmer / किसान' : 'Buyer / व्यापारी'}</strong>
          </span>
        </div>

        <div className="kp-mkt-role-nav">
          <button
            type="button"
            className={`kp-mkt-role-btn ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => {
              setRole('farmer');
              setActiveMatchedPost(null);
            }}
          >
            <div className="kp-mkt-role-icon">
              <Store size={22} />
            </div>
            <div>
              <div className="kp-mkt-role-title">
                {t('farmerRoleTitle', 'Farmer Demo Mode')}
                {role === 'farmer' && <span className="kp-badge kp-badge-success">Active</span>}
              </div>
              <div className="kp-mkt-role-subtitle">
                {t('farmerRoleDesc', 'Post farm harvest & discover ranked buyers with freight insights')}
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`kp-mkt-role-btn ${role === 'buyer' ? 'active' : ''}`}
            onClick={() => {
              setRole('buyer');
              setActiveMatchedPost(null);
            }}
          >
            <div className="kp-mkt-role-icon">
              <Handshake size={22} />
            </div>
            <div>
              <div className="kp-mkt-role-title">
                {t('buyerRoleTitle', 'Buyer Demo Mode')}
                {role === 'buyer' && <span className="kp-badge kp-badge-success">Active</span>}
              </div>
              <div className="kp-mkt-role-subtitle">
                {t('buyerRoleDesc', 'Post procurement demand & match with available farmer stocks')}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Metric KPIs */}
      <div className="kp-mkt-kpi-row">
        <div className="kp-mkt-kpi-card">
          <div className="kp-mkt-kpi-header">
            <span>{t('statTotalPosts', 'Active Demo Posts')}</span>
            <Store size={16} />
          </div>
          <div className="kp-mkt-kpi-value">
            {role === 'farmer' ? farmerPosts.length : buyerRequests.length}
          </div>
          <div className="kp-mkt-kpi-sub">
            {role === 'farmer' ? 'Farmer harvests in local memory' : 'Buyer demand orders in memory'}
          </div>
        </div>

        <div className="kp-mkt-kpi-card">
          <div className="kp-mkt-kpi-header">
            <span>{t('statDemandMatches', 'Counterparty Demands')}</span>
            <Handshake size={16} />
          </div>
          <div className="kp-mkt-kpi-value">
            {role === 'farmer' ? buyerRequests.length : farmerPosts.length}
          </div>
          <div className="kp-mkt-kpi-sub">
            {role === 'farmer' ? 'Simulated buyer requests' : 'Simulated farmer crop supplies'}
          </div>
        </div>

        <div className="kp-mkt-kpi-card">
          <div className="kp-mkt-kpi-header">
            <span>{t('statAvgMatch', 'Avg Match Score')}</span>
            <Scale size={16} />
          </div>
          <div className="kp-mkt-kpi-value" style={{ color: 'var(--kp-success)' }}>
            91.4%
          </div>
          <div className="kp-mkt-kpi-sub">Optimal price & transit viability</div>
        </div>

        <div className="kp-mkt-kpi-card">
          <div className="kp-mkt-kpi-header">
            <span>{t('statFreightAvg', 'Avg Est. Freight')}</span>
            <Truck size={16} />
          </div>
          <div className="kp-mkt-kpi-value">₹55 / qtl</div>
          <div className="kp-mkt-kpi-sub">Regional corridor estimate (65 km)</div>
        </div>
      </div>

      {/* Controls: Search, Filters & Add Post Button */}
      <div className="kp-mkt-controls-card">
        <div className="kp-mkt-controls-top">
          {/* Search Bar */}
          <div className="kp-mkt-search-wrap">
            <Search size={18} className="kp-mkt-search-icon" />
            <input
              type="text"
              className="kp-mkt-search-input"
              placeholder={t('searchPlaceholder', 'Search by crop, variety, district, or state...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Action Button: Post Listing */}
          <div className="kp-mkt-action-btns">
            <Button
              variant="primary"
              icon={showAddForm ? <X size={16} /> : <Plus size={16} />}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              {showAddForm
                ? t('cancelBtn', 'Cancel')
                : role === 'farmer'
                ? t('newPostFarmerBtn', 'Post Crop Listing (Demo)')
                : t('newPostBuyerBtn', 'Post Buyer Request (Demo)')}
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="kp-mkt-filters-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--kp-text-muted)' }} />
            <select
              className="kp-mkt-select"
              value={selectedCropFilter}
              onChange={(e) => setSelectedCropFilter(e.target.value)}
            >
              <option value="all">{t('filterCrop', 'All Crops')}</option>
              {CROP_CATALOG.map((c) => (
                <option key={c.key} value={c.key}>
                  {isHi ? `${c.hi} (${c.en})` : `${c.en} (${c.hi})`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: 'var(--kp-text-muted)' }} />
            <select
              className="kp-mkt-select"
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
            >
              <option value="all">{t('filterState', 'All States')}</option>
              {Object.keys(STATE_DISTRICT_MAP).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {(selectedCropFilter !== 'all' || selectedStateFilter !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCropFilter('all');
                setSelectedStateFilter('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* New Post Creation Drawer / Form */}
      {showAddForm && (
        <form className="kp-mkt-form-card" onSubmit={handleCreatePost}>
          <div className="kp-mkt-form-header">
            <h3 className="kp-mkt-form-title">
              {role === 'farmer' ? <Store size={22} /> : <Handshake size={22} />}
              {role === 'farmer'
                ? t('farmerPostTitle', 'Farmer Crop Harvest Listing')
                : t('buyerPostTitle', 'Buyer Procurement Requirement')}
            </h3>
            <button
              type="button"
              className="kp-btn-ghost kp-btn-sm"
              onClick={() => setShowAddForm(false)}
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className="kp-badge kp-badge-danger" style={{ padding: '8px 12px' }}>
              <AlertCircle size={14} />
              {formError}
            </div>
          )}

          <div className="kp-mkt-form-grid">
            {/* Crop Selection */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {t('cropLabel', 'Crop')} <span className="kp-mkt-form-label-required">*</span>
              </label>
              <select
                className="kp-mkt-form-input"
                value={formCrop}
                onChange={(e) => setFormCrop(e.target.value)}
              >
                {CROP_CATALOG.map((c) => (
                  <option key={c.key} value={c.key}>
                    {isHi ? `${c.hi} (${c.en})` : `${c.en} (${c.hi})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Variety (Only for Farmer) */}
            {role === 'farmer' && (
              <div className="kp-mkt-form-group">
                <label className="kp-mkt-form-label">
                  {t('varietyLabel', 'Variety / Cultivar')}
                </label>
                <input
                  type="text"
                  className="kp-mkt-form-input"
                  placeholder="e.g. Sharbati 1544, Pusa 1121"
                  value={formVariety}
                  onChange={(e) => setFormVariety(e.target.value)}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {t('quantityLabel', 'Quantity (Quintals)')}{' '}
                <span className="kp-mkt-form-label-required">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="kp-mkt-form-input"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
              />
              <div className="kp-mkt-quick-chips">
                {[50, 100, 200, 500].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="kp-mkt-chip"
                    onClick={() => setFormQuantity(q)}
                  >
                    +{q} qtl
                  </button>
                ))}
              </div>
            </div>

            {/* Price Expected / Max */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {role === 'farmer'
                  ? t('expectedPriceLabel', 'Expected Price (₹ / quintal)')
                  : t('maxPriceLabel', 'Max Purchase Price (₹ / quintal)')}{' '}
                <span className="kp-mkt-form-label-required">*</span>
              </label>
              <input
                type="number"
                min="100"
                step="10"
                className="kp-mkt-form-input"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {role === 'farmer'
                  ? t('harvestDateLabel', 'Harvest / Ready Date')
                  : t('neededByLabel', 'Needed By Date')}{' '}
                <span className="kp-mkt-form-label-required">*</span>
              </label>
              <input
                type="date"
                className="kp-mkt-form-input"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            {/* State */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {t('stateLabel', 'State')} <span className="kp-mkt-form-label-required">*</span>
              </label>
              <select
                className="kp-mkt-form-input"
                value={formState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                {Object.keys(STATE_DISTRICT_MAP).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="kp-mkt-form-group">
              <label className="kp-mkt-form-label">
                {t('districtLabel', 'District / Mandi Zone')}{' '}
                <span className="kp-mkt-form-label-required">*</span>
              </label>
              <select
                className="kp-mkt-form-input"
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
              >
                {(STATE_DISTRICT_MAP[formState] || []).map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade & Moisture (Farmer Optional) */}
            {role === 'farmer' && (
              <>
                <div className="kp-mkt-form-group">
                  <label className="kp-mkt-form-label">
                    {t('gradeLabel', 'Grade / Quality Note (Optional)')}
                  </label>
                  <input
                    type="text"
                    className="kp-mkt-form-input"
                    placeholder={t('gradePlaceholder', 'e.g. Grade A, FAQ, Export Quality')}
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                  />
                </div>

                <div className="kp-mkt-form-group">
                  <label className="kp-mkt-form-label">
                    {t('moistureLabel', 'Moisture % Note (Optional)')}
                  </label>
                  <input
                    type="text"
                    className="kp-mkt-form-input"
                    placeholder={t('moisturePlaceholder', 'e.g. 11.2%, < 12%')}
                    value={formMoisture}
                    onChange={(e) => setFormMoisture(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="kp-mkt-form-footer">
            <span className="kp-mkt-form-disclaimer">
              <Info size={14} />
              Stored locally in browser session memory. No live trading commitment.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                {t('cancelBtn', 'Cancel')}
              </Button>
              <Button variant="primary" type="submit">
                {role === 'farmer'
                  ? t('saveFarmerPost', 'Publish Farmer Post (Demo)')
                  : t('saveBuyerRequest', 'Publish Buyer Request (Demo)')}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Ranked Matches Drawer / Section (Visible when activeMatchedPost is set) */}
      {activeMatchedPost && (
        <div className="kp-mkt-matches-panel">
          <div className="kp-mkt-matches-header">
            <div className="kp-mkt-matches-title-group">
              <h2 className="kp-mkt-matches-title">
                <Sparkles size={22} />
                {t('rankedMatchesFor', 'Ranked Matches for')}: {activeMatchedPost.crop}{' '}
                {activeMatchedPost.variety ? `(${activeMatchedPost.variety})` : ''}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
                Target: {activeMatchedPost.quantityQuintals} Quintals •{' '}
                {activeMatchedPost.district}, {activeMatchedPost.state} • Expected/Max:{' '}
                ₹{activeMatchedPost.expectedPricePerQuintal || activeMatchedPost.maxPricePerQuintal}/qtl
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<X size={14} />}
              onClick={() => setActiveMatchedPost(null)}
            >
              {t('hideMatchesBtn', 'Hide Matches')}
            </Button>
          </div>

          {rankedMatchesList.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--kp-text-muted)' }}>
              No counterparties currently available for {activeMatchedPost.crop}. Try posting a simulated counterparty!
            </div>
          ) : (
            <div className="kp-mkt-match-list">
              {rankedMatchesList.map((match, idx) => {
                const target = match.target;
                const scoreClass =
                  match.matchScore >= 85
                    ? 'kp-mkt-score-high'
                    : match.matchScore >= 70
                    ? 'kp-mkt-score-med'
                    : 'kp-mkt-score-low';

                return (
                  <div key={target.id || idx} className="kp-mkt-match-card">
                    {/* Top Row: Score Badge + Counterparty Meta */}
                    <div className="kp-mkt-match-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`kp-mkt-match-score-badge ${scoreClass}`}>
                          <Sparkles size={16} />
                          {match.matchScore}% {t('matchScore', 'Match Score')}
                        </span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                            {role === 'farmer' ? 'Simulated Buyer' : 'Simulated Farmer Seller'}:{' '}
                            {target.district}, {target.state}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--kp-text-muted)' }}>
                            Demand/Supply: {target.quantityQuintals} Quintals • Rate:{' '}
                            ₹{target.maxPricePerQuintal || target.expectedPricePerQuintal} / qtl
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="accent"
                        size="sm"
                        icon={<Scale size={14} />}
                        onClick={() => handleOpenDealComparison(target)}
                      >
                        {t('compareDealBtn', 'Compare Deal Economics')}
                      </Button>
                    </div>

                    {/* Plain Language Justifications */}
                    <ul className="kp-mkt-match-reasons-list">
                      {match.reasons.map((reason, rIdx) => (
                        <li key={rIdx} className="kp-mkt-match-reason-item">
                          <CheckCircle2 size={15} className="kp-mkt-reason-icon" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Freight & Cost Breakdown */}
                    {match.freightBreakdown && (
                      <div className="kp-mkt-freight-box">
                        <div className="kp-mkt-freight-header">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={14} />
                            {t('freightBreakdownTitle', 'Estimated Freight & Logistics Cost')}
                          </span>
                          <span className="kp-badge kp-badge-success">
                            Save ~₹{match.freightBreakdown.intermediarySavingsEst} vs APMC Cuts
                          </span>
                        </div>
                        <div className="kp-mkt-freight-grid">
                          <div className="kp-mkt-freight-item">
                            <span className="kp-mkt-freight-label">
                              {t('distanceEst', 'Est. Transit Distance')}
                            </span>
                            <span className="kp-mkt-freight-value">
                              {match.freightBreakdown.estimatedDistanceKm} km
                            </span>
                          </div>
                          <div className="kp-mkt-freight-item">
                            <span className="kp-mkt-freight-label">
                              {t('freightPerQtl', 'Freight / Qtl')}
                            </span>
                            <span className="kp-mkt-freight-value">
                              ₹{match.freightBreakdown.freightPerQuintal}
                            </span>
                          </div>
                          <div className="kp-mkt-freight-item">
                            <span className="kp-mkt-freight-label">
                              {t('totalFreightCost', 'Total Logistics Cost')}
                            </span>
                            <span className="kp-mkt-freight-value">
                              ₹{match.freightBreakdown.totalLogisticsCost.toLocaleString()}
                            </span>
                          </div>
                          <div className="kp-mkt-freight-item">
                            <span className="kp-mkt-freight-label">
                              {t('netFarmerPrice', 'Net Realized Price')}
                            </span>
                            <span
                              className="kp-mkt-freight-value"
                              style={{ color: 'var(--kp-primary-700)' }}
                            >
                              ₹{match.freightBreakdown.netRealizedPrice} / qtl
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Listings Section */}
      <div className="kp-mkt-listings-section">
        {/* Sub Header & Tab Switcher */}
        <div className="kp-mkt-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="kp-mkt-section-title">
              {role === 'farmer' ? <Store size={20} /> : <Handshake size={20} />}
              {activeTab === 'myListings'
                ? role === 'farmer'
                  ? t('myListingsTab', 'My Demo Postings') + ' (Farmer Harvests)'
                  : t('myListingsTab', 'My Demo Postings') + ' (Buyer Demands)'
                : role === 'farmer'
                ? t('allListingsTab', 'All Marketplace Listings') + ' (Buyer Demands)'
                : t('allListingsTab', 'All Marketplace Listings') + ' (Farmer Harvests)'}
            </h2>
            <span className="kp-badge kp-badge-neutral">
              {activeListings.length} {t('statTotalPosts', 'Active Demo Posts')}
            </span>
          </div>

          {/* Toggle between My Listings vs All Counterparty Demands */}
          <div className="kp-lang-toggle">
            <button
              type="button"
              className={`kp-lang-btn ${activeTab === 'myListings' ? 'active' : ''}`}
              onClick={() => setActiveTab('myListings')}
            >
              {t('myListingsTab', 'My Demo Postings')}
            </button>
            <button
              type="button"
              className={`kp-lang-btn ${activeTab === 'allListings' ? 'active' : ''}`}
              onClick={() => setActiveTab('allListings')}
            >
              {t('allListingsTab', 'All Marketplace Listings')}
            </button>
          </div>
        </div>

        {/* Listings Cards Grid */}
        {activeListings.length === 0 ? (
          <div className="kp-empty-state">
            <div className="kp-empty-icon-wrap">
              <Store size={32} />
            </div>
            <h3 className="kp-empty-title">{t('noListingsFound', 'No listings match your search or filter criteria.')}</h3>
            <p className="kp-empty-desc">{t('adjustFilters', 'Try adjusting filters or post a new demo listing above.')}</p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
              {role === 'farmer' ? t('newPostFarmerBtn', 'Post Crop Listing (Demo)') : t('newPostBuyerBtn', 'Post Buyer Request (Demo)')}
            </Button>
          </div>
        ) : (
          <div className="kp-mkt-grid-posts">
            {activeListings.map((item) => {
              const isFarmerPost = Boolean(item.expectedPricePerQuintal);
              const isSelected = activeMatchedPost && activeMatchedPost.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`kp-mkt-card ${isSelected ? 'active-selected' : ''}`}
                >
                  <div>
                    {/* Card Header & Price */}
                    <div className="kp-mkt-card-top">
                      <div>
                        <div className="kp-mkt-crop-badge-group">
                          <span
                            className={`kp-badge ${
                              item.isUserCreated ? 'kp-badge-success' : 'kp-badge-neutral'
                            }`}
                          >
                            {item.isUserCreated
                              ? t('userPostBadge', 'My Demo Post')
                              : t('demoSampleBadge', 'Demo Sample')}
                          </span>
                          <span className="kp-badge kp-badge-info">
                            {isFarmerPost ? 'Farmer Stock' : 'Buyer Requirement'}
                          </span>
                        </div>
                        <h3 className="kp-mkt-crop-title" style={{ marginTop: '6px' }}>
                          {item.crop}
                        </h3>
                        {item.variety && (
                          <div className="kp-mkt-variety-text">{item.variety}</div>
                        )}
                      </div>

                      <div className="kp-mkt-price-badge">
                        <div className="kp-mkt-price-val">
                          ₹{(item.expectedPricePerQuintal || item.maxPricePerQuintal).toLocaleString()}
                        </div>
                        <div className="kp-mkt-price-unit">
                          {isFarmerPost ? '₹ / quintal (Expected)' : '₹ / quintal (Max Budget)'}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Box */}
                    <div className="kp-mkt-meta-grid" style={{ marginTop: '14px' }}>
                      <div className="kp-mkt-meta-item">
                        <PackageCheck size={15} className="kp-mkt-meta-icon" />
                        <span>
                          <strong>{item.quantityQuintals}</strong> Quintals
                        </span>
                      </div>
                      <div className="kp-mkt-meta-item">
                        <MapPin size={15} className="kp-mkt-meta-icon" />
                        <span>
                          {item.district}, {item.state}
                        </span>
                      </div>
                      <div className="kp-mkt-meta-item">
                        <Calendar size={15} className="kp-mkt-meta-icon" />
                        <span>
                          {isFarmerPost ? 'Ready: ' : 'Needed: '}
                          {item.harvestDate || item.neededBy}
                        </span>
                      </div>
                      <div className="kp-mkt-meta-item">
                        <Coins size={15} className="kp-mkt-meta-icon" />
                        <span>
                          Est. Val: ₹
                          {(
                            (item.quantityQuintals || 0) *
                            (item.expectedPricePerQuintal || item.maxPricePerQuintal || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Grade & Moisture Chips */}
                    {(item.grade || item.moisture) && (
                      <div className="kp-mkt-tags-row" style={{ marginTop: '10px' }}>
                        {item.grade && (
                          <span className="kp-mkt-spec-tag">
                            <Tag size={11} style={{ marginRight: '4px' }} />
                            Grade: {item.grade}
                          </span>
                        )}
                        {item.moisture && (
                          <span className="kp-mkt-spec-tag">
                            Moisture: {item.moisture}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="kp-mkt-card-actions">
                    <Button
                      variant={isSelected ? 'secondary' : 'primary'}
                      size="sm"
                      icon={<Sparkles size={14} />}
                      onClick={() => {
                        if (isSelected) {
                          setActiveMatchedPost(null);
                        } else {
                          setActiveMatchedPost(item);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }
                      }}
                    >
                      {isSelected
                        ? t('hideMatchesBtn', 'Hide Matches')
                        : t('viewMatchesBtn', 'View Ranked Matches')}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: 'var(--kp-danger)' }}
                      icon={<Trash2 size={14} />}
                      onClick={() =>
                        handleDeletePost(item.id, isFarmerPost ? 'farmer' : 'buyer')
                      }
                    >
                      {t('deletePostBtn', 'Remove Post')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deal Economics Comparison Modal */}
      {activeDealComparison && (
        <div className="kp-mkt-modal-backdrop" onClick={() => setActiveDealComparison(null)}>
          <div className="kp-mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="kp-mkt-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
                  {t('dealModalTitle', 'Direct Deal Economics & Savings Analysis')}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--kp-text-muted)' }}>
                  {t('dealModalSubtitle', 'Comparing farmer net realization vs conventional APMC mandi channels')}
                </span>
              </div>
              <button
                type="button"
                className="kp-btn-ghost kp-btn-sm"
                onClick={() => setActiveDealComparison(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="kp-mkt-modal-body">
              {/* Savings callout banner */}
              <div className="kp-mkt-deal-savings-banner">
                <CheckCircle2 size={28} style={{ color: 'var(--kp-success)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, color: '#166534', fontWeight: '800' }}>
                    ₹{activeDealComparison.traditionalMandiCutsSaved.toLocaleString()} Estimated Direct Trade Surplus
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.4 }}>
                    {t('directSavingsNote', 'Direct bilateral trading eliminates 2.5% middleman commission and 1.5% APMC market charges, providing mutual profit to both parties.')}
                  </p>
                </div>
              </div>

              {/* Deal Breakdown Table */}
              <table className="kp-mkt-deal-compare-table">
                <tbody>
                  <tr>
                    <th>Commodity & Variety</th>
                    <td>
                      <strong>{activeDealComparison.crop}</strong> ({activeDealComparison.variety})
                    </td>
                  </tr>
                  <tr>
                    <th>{t('farmerOffer', 'Farmer Expected Rate')}</th>
                    <td>₹{activeDealComparison.farmerExpectedRate.toLocaleString()} / quintal</td>
                  </tr>
                  <tr>
                    <th>{t('buyerCeiling', 'Buyer Ceiling Rate')}</th>
                    <td>₹{activeDealComparison.buyerCeilingRate.toLocaleString()} / quintal</td>
                  </tr>
                  <tr>
                    <th>{t('dealFairPrice', 'Recommended Bilateral Price')}</th>
                    <td style={{ color: 'var(--kp-primary-700)', fontWeight: '800', fontSize: '1.05rem' }}>
                      ₹{activeDealComparison.fairMidpointRate.toLocaleString()} / quintal
                    </td>
                  </tr>
                  <tr>
                    <th>Trade Volume Agreed</th>
                    <td>{activeDealComparison.quantityAgreed} Quintals</td>
                  </tr>
                  <tr>
                    <th>Gross Trade Value</th>
                    <td>₹{activeDealComparison.grossTradeValue.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Estimated Freight Corridor</th>
                    <td>
                      ~{activeDealComparison.estimatedDistanceKm} km (₹{activeDealComparison.estimatedFreightPerQuintal}/qtl = ₹{activeDealComparison.totalFreightCost.toLocaleString()})
                    </td>
                  </tr>
                  <tr>
                    <th>Net Farmer Realization</th>
                    <td style={{ fontWeight: '700', color: 'var(--kp-success)' }}>
                      ₹{activeDealComparison.farmerNetRealization.toLocaleString()} / qtl
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Recommendation Box */}
              <div
                style={{
                  backgroundColor: 'var(--kp-slate-50)',
                  border: '1px solid var(--kp-border)',
                  borderRadius: 'var(--kp-radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.84rem',
                  lineHeight: 1.5
                }}
              >
                <strong>AI Advisor Recommendation:</strong> {activeDealComparison.recommendation}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" onClick={() => setActiveDealComparison(null)}>
                  {t('closeBtn', 'Close Analysis')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--kp-text-muted)',
          paddingTop: 'var(--kp-space-4)',
          borderTop: '1px solid var(--kp-border-subtle)'
        }}
      >
        <p style={{ margin: 0 }}>
          {t('demoFootnote', 'Simulated matching engine. On the live integration branch, ranked scores are calculated via matchingEngine.js.')}
        </p>
      </div>
    </div>
  );
}
