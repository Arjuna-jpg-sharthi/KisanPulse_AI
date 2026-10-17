/**
 * KisanPulse AI - Farm Decision Advisors Utilities
 * Mathematical formulas, ranking algorithms, explainability generators,
 * validation routines, and local persistence handlers.
 *
 * AGRONOMIC INTEGRITY RULE:
 * Price momentum is explicitly flagged as unavailable when no verified
 * live ticker feed is connected. No synthetic price trends or demand spikes
 * are ever fabricated.
 */

import {
  CROP_PERISHABILITY_CATALOG,
  STORAGE_CONDITIONS,
  SHORT_DURATION_CROPS,
  REGIONS_CATALOG,
  SEASONS_CATALOG,
  SOIL_TYPES,
  WATER_LEVELS
} from './advisorData';

// ============================================================================
// 1. DATE & STORAGE TIME CALCULATIONS
// ============================================================================

/**
 * Calculates elapsed calendar days between harvest date and today/reference date.
 * Ensures non-negative return value.
 */
export function calculateStorageDuration(harvestDateStr, referenceDate = new Date()) {
  if (!harvestDateStr) return 0;
  const harvest = new Date(harvestDateStr);
  if (isNaN(harvest.getTime())) return 0;

  const ref = new Date(referenceDate);
  // Reset time portions to compare calendar days accurately
  harvest.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);

  const diffMs = ref.getTime() - harvest.getTime();
  if (diffMs <= 0) return 0; // Today or future harvest

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines safe shelf-life in days based on crop baseline and storage modifier,
 * or honors the farmer's explicit custom shelf life estimate.
 */
export function calculateEffectiveShelfLife(cropItem, catalogCrop, storageCondition) {
  // If farmer entered an explicit custom estimate, prioritize that
  const custom = Number(cropItem.customShelfLifeDays);
  if (!isNaN(custom) && custom > 0) {
    return {
      days: Math.round(custom),
      isCustom: true,
      source: 'Farmer Custom Override'
    };
  }

  const baseDays = catalogCrop ? catalogCrop.baseAmbientShelfLifeDays : 30;
  const modifier = storageCondition ? storageCondition.modifier : 1.0;
  const calculatedDays = Math.max(2, Math.round(baseDays * modifier));

  return {
    days: calculatedDays,
    isCustom: false,
    source: `ICAR Benchmark (${baseDays}d base × ${modifier}x storage factor)`
  };
}

// ============================================================================
// 2. SELL-FIRST URGENCY SCORING ALGORITHM
// ============================================================================

/**
 * Calculates a 0-100 Urgency Score for a single stored crop lot.
 * Score is derived strictly from:
 * - Shelf-life exhaustion ratio (days stored / safe shelf life)
 * - Inherent crop perishability class (High / Medium / Low)
 * - Vulnerability of the storage environment (uncovered vs controlled)
 * - Buyer offer expiry proximity (if an active offer exists)
 *
 * Explicitly states price momentum unavailable.
 */
export function calculateLotUrgency(cropLot, referenceDate = new Date()) {
  const catalogCrop = CROP_PERISHABILITY_CATALOG.find(c => c.id === cropLot.cropId) || null;
  const storageCondition = STORAGE_CONDITIONS.find(s => s.id === cropLot.storageCondition) || STORAGE_CONDITIONS[0];

  const daysInStorage = calculateStorageDuration(cropLot.harvestDate, referenceDate);
  const shelfLifeInfo = calculateEffectiveShelfLife(cropLot, catalogCrop, storageCondition);
  const safeShelfLife = shelfLifeInfo.days;

  const remainingDays = Math.max(0, safeShelfLife - daysInStorage);
  const shelfLifeUsedPct = Math.min(200, Math.round((daysInStorage / Math.max(1, safeShelfLife)) * 100));

  const perishability = catalogCrop ? catalogCrop.perishability : (cropLot.perishability || 'medium');

  // Base Urgency Calculation
  let baseScore = 0;
  if (shelfLifeUsedPct >= 100) {
    // Already past safe storage threshold
    baseScore = 85 + Math.min(12, Math.floor((shelfLifeUsedPct - 100) / 10));
  } else if (shelfLifeUsedPct >= 80) {
    baseScore = 75 + Math.round((shelfLifeUsedPct - 80) * 0.5);
  } else if (shelfLifeUsedPct >= 50) {
    baseScore = 55 + Math.round((shelfLifeUsedPct - 50) * 0.6);
  } else if (shelfLifeUsedPct >= 25) {
    baseScore = 35 + Math.round((shelfLifeUsedPct - 25) * 0.8);
  } else {
    baseScore = Math.max(10, Math.round(shelfLifeUsedPct * 1.2));
  }

  // Perishability Weighting
  let perishabilityModifier = 0;
  if (perishability === 'high') {
    // High perishability crops (tomatoes, chillies) deteriorate exponentially
    perishabilityModifier = shelfLifeUsedPct >= 50 ? +12 : +6;
  } else if (perishability === 'low') {
    // Durable grains (wheat, paddy, mustard) hold value steadily
    perishabilityModifier = shelfLifeUsedPct < 75 ? -8 : 0;
  }

  // Storage Condition Vulnerability Modifier
  let storageHazard = 0;
  if (cropLot.storageCondition === 'uncovered_field') {
    storageHazard = +12; // High exposure to pests, weather, humidity
  } else if (cropLot.storageCondition === 'ambient_shed' && perishability === 'high') {
    storageHazard = +6;
  } else if (cropLot.storageCondition === 'cold_storage' || cropLot.storageCondition === 'hermetic_bag') {
    storageHazard = -6; // Protective storage mitigates biological decay
  }

  // Buyer Offer Expiry Factor
  let offerUrgency = 0;
  let offerStatusTextEn = 'No active buyer offer entered';
  let offerStatusTextHi = 'कोई सक्रिय खरीदार प्रस्ताव नहीं';

  if (cropLot.hasBuyerOffer && cropLot.offeredPrice) {
    const expiresDays = Number(cropLot.offerExpiresInDays);
    const offeredPrice = Number(cropLot.offeredPrice);
    const benchmarkMsp = catalogCrop ? catalogCrop.benchmarkMsp : 2000;
    const priceDiff = offeredPrice - benchmarkMsp;

    if (!isNaN(expiresDays) && expiresDays > 0) {
      if (expiresDays <= 2) {
        offerUrgency = +14;
        offerStatusTextEn = `Buyer offer expires in ${expiresDays} day(s)! Urgent decision window.`;
        offerStatusTextHi = `खरीदार का प्रस्ताव ${expiresDays} दिन में समाप्त होगा! त्वरित निर्णय आवश्यक।`;
      } else if (expiresDays <= 5) {
        offerUrgency = +8;
        offerStatusTextEn = `Buyer offer valid for ${expiresDays} days. Consider locking in.`;
        offerStatusTextHi = `खरीदार प्रस्ताव ${expiresDays} दिन तक वैध है। निर्णय ले सकते हैं।`;
      } else {
        offerUrgency = +3;
        offerStatusTextEn = `Active buyer offer valid for ${expiresDays} days.`;
        offerStatusTextHi = `सक्रिय प्रस्ताव ${expiresDays} दिन के लिए वैध है।`;
      }
    }

    if (priceDiff > 0) {
      offerStatusTextEn += ` (₹${priceDiff}/q above benchmark)`;
      offerStatusTextHi += ` (बेंचमार्क से ₹${priceDiff}/क्विंटल अधिक)`;
    }
  }

  // Composite Calculation
  let totalScore = Math.max(5, Math.min(99, Math.round(baseScore + perishabilityModifier + storageHazard + offerUrgency)));

  // Categorize Urgency Level
  let level = 'safe';
  let levelLabelEn = 'Safe to Hold';
  let levelLabelHi = 'रोकना सुरक्षित';
  let levelColor = '#16a34a'; // Green

  if (totalScore >= 80) {
    level = 'critical';
    levelLabelEn = 'Critical Urgency — Sell Immediately';
    levelLabelHi = 'अति-गंभीर — तुरंत बेचना जरूरी';
    levelColor = '#dc2626'; // Red
  } else if (totalScore >= 60) {
    level = 'high';
    levelLabelEn = 'High Priority — Plan Sale This Week';
    levelLabelHi = 'उच्च प्राथमिकता — इस सप्ताह बिक्री की योजना बनाएं';
    levelColor = '#ea580c'; // Orange
  } else if (totalScore >= 40) {
    level = 'moderate';
    levelLabelEn = 'Moderate Urgency — Monitor Conditions';
    levelLabelHi = 'मध्यम प्राथमिकता — भंडारण स्थिति पर नजर रखें';
    levelColor = '#d97706'; // Amber
  }

  // Generate transparent rationale points
  const reasonsEn = [];
  const reasonsHi = [];

  // Reason 1: Shelf life consumption
  if (shelfLifeUsedPct >= 100) {
    reasonsEn.push(`Has been stored for ${daysInStorage} days, exceeding the estimated safe horizon of ${safeShelfLife} days.`);
    reasonsHi.push(`फसल ${daysInStorage} दिनों से रखी है, जो अनुमानित सुरक्षित सीमा ${safeShelfLife} दिन से अधिक है।`);
  } else {
    reasonsEn.push(`Used ${shelfLifeUsedPct}% of safe storage window (${daysInStorage} days stored out of ~${safeShelfLife} safe days). Estimated ~${remainingDays} safe days remaining.`);
    reasonsHi.push(`सुरक्षित भंडारण का ${shelfLifeUsedPct}% समय बीत चुका है (${safeShelfLife} में से ${daysInStorage} दिन)। लगभग ${remainingDays} दिन बचे हैं।`);
  }

  // Reason 2: Perishability impact
  if (perishability === 'high') {
    reasonsEn.push('High physiological perishability: Rapid cellular breakdown, softening, and moisture loss occurs without cold chain.');
    reasonsHi.push('अति-संवेदनशील फसल: कोल्ड चेन के बिना ताजगी, वजन और चमक तेजी से कम होती है।');
  } else if (perishability === 'medium') {
    reasonsEn.push('Semi-perishable: Susceptible to sprouting, damp neck rot, or weight shrinkage if ventilation is inadequate.');
    reasonsHi.push('मध्यम संवेदनशील: वेंटिलेशन कम होने पर अंकुरण या वजन घटने का खतरा रहता है।');
  } else {
    reasonsEn.push('Durable grain/oilseed: Stable for long holding provided moisture remains below 12% and pests are managed.');
    reasonsHi.push('टिकाऊ अनाज/दलहन: यदि नमी 12% से कम है तो इसे लंबे समय तक सुरक्षित रखा जा सकता है।');
  }

  // Reason 3: Storage type
  if (cropLot.storageCondition === 'uncovered_field') {
    reasonsEn.push('Vulnerable storage: Open-air exposure accelerates spoilage risk due to humidity, dew, and insect exposure.');
    reasonsHi.push('जोखिम भरा भंडार: खुले में रखने से ओस, नमी और कीटों का खतरा बढ़ जाता है।');
  } else if (cropLot.storageCondition === 'hermetic_bag') {
    reasonsEn.push('Protected storage: Hermetic seal prevents pest infestation and extends safe storage life.');
    reasonsHi.push('सुरक्षित भंडार: एयर-टाइट बैग कीटों से बचाता है और भंडारण अवधि बढ़ाता है।');
  }

  // Reason 4: Offer pressure
  if (cropLot.hasBuyerOffer && offerUrgency > 0) {
    reasonsEn.push(offerStatusTextEn);
    reasonsHi.push(offerStatusTextHi);
  }

  // Crop display name
  const displayNameEn = catalogCrop ? catalogCrop.nameEn : (cropLot.cropNameCustom || 'Custom Crop');
  const displayNameHi = catalogCrop ? catalogCrop.nameHi : (cropLot.cropNameCustom || 'कस्टम फसल');

  return {
    lotId: cropLot.id,
    cropId: cropLot.cropId,
    cropNameEn: displayNameEn,
    cropNameHi: displayNameHi,
    quantity: Number(cropLot.quantity) || 0,
    quantityUnit: cropLot.quantityUnit || 'Quintals',
    harvestDate: cropLot.harvestDate,
    daysInStorage,
    safeShelfLife,
    remainingDays,
    shelfLifeUsedPct,
    shelfLifeSource: shelfLifeInfo.source,
    storageConditionId: storageCondition.id,
    storageConditionLabelEn: storageCondition.labelEn,
    storageConditionLabelHi: storageCondition.labelHi,
    perishability,
    urgencyScore: totalScore,
    urgencyLevel: level,
    urgencyLabelEn: levelLabelEn,
    urgencyLabelHi: levelLabelHi,
    urgencyColor: levelColor,
    hasBuyerOffer: Boolean(cropLot.hasBuyerOffer),
    offeredPrice: cropLot.offeredPrice ? Number(cropLot.offeredPrice) : null,
    offerExpiresInDays: cropLot.offerExpiresInDays ? Number(cropLot.offerExpiresInDays) : null,
    offerStatusTextEn,
    offerStatusTextHi,
    reasonsEn,
    reasonsHi,
    // Explicit integrity notice per user requirement:
    priceMomentumAvailable: false,
    priceMomentumNoticeEn: 'Real-time price momentum is currently unavailable (no active Agmarknet / e-NAM ticker). Score is based strictly on physical perishability, storage age, and entered offers.',
    priceMomentumNoticeHi: 'लाइव मूल्य रुझान वर्तमान में अनुपलब्ध है (कोई लाइव मंडी टिकर नहीं)। यह स्कोर केवल भंडारण अवधि, फसल संवेदनशीलता और खरीदार प्रस्ताव पर आधारित है।'
  };
}

/**
 * Evaluates and ranks a list of stored crop lots descending by urgency score.
 * Generates comparative explanations between adjacent ranks.
 */
export function rankStoredCrops(lotsList, referenceDate = new Date()) {
  if (!Array.isArray(lotsList) || lotsList.length === 0) {
    return { rankedLots: [], explanations: [] };
  }

  const evaluated = lotsList.map(lot => calculateLotUrgency(lot, referenceDate));

  // Sort descending by urgency score. Secondary sort: remainingDays ascending.
  evaluated.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    return a.remainingDays - b.remainingDays;
  });

  // Assign ranks (1-indexed)
  evaluated.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  // Generate pairwise explanations (Why Rank #1 is ahead of Rank #2, etc.)
  const explanations = [];
  for (let i = 0; i < evaluated.length - 1; i++) {
    const higher = evaluated[i];
    const lower = evaluated[i + 1];

    let compTextEn = '';
    let compTextHi = '';

    if (higher.perishability === 'high' && lower.perishability !== 'high') {
      compTextEn = `${higher.cropNameEn} ranks ahead of ${lower.cropNameEn} primarily because it is inherently high-perishable horticulture with only ~${higher.remainingDays} days remaining, whereas ${lower.cropNameEn} is a ${lower.perishability} crop with ${lower.remainingDays} safe days.`;
      compTextHi = `${higher.cropNameHi} को ${lower.cropNameHi} से पहले बेचने की सलाह है क्योंकि यह अति-संवेदनशील फसल है जिसमें केवल ~${higher.remainingDays} दिन बचे हैं, जबकि ${lower.cropNameHi} में ${lower.remainingDays} दिन सुरक्षित हैं।`;
    } else if (higher.shelfLifeUsedPct > lower.shelfLifeUsedPct) {
      compTextEn = `${higher.cropNameEn} has exhausted ${higher.shelfLifeUsedPct}% of its safe storage window (${higher.daysInStorage} days stored), creating higher risk of deterioration compared to ${lower.cropNameEn} (${lower.shelfLifeUsedPct}% used).`;
      compTextHi = `${higher.cropNameHi} ने अपने सुरक्षित समय का ${higher.shelfLifeUsedPct}% हिस्सा पूरा कर लिया है (${higher.daysInStorage} दिन), जिससे यह ${lower.cropNameHi} (${lower.shelfLifeUsedPct}% उपयोग) की तुलना में अधिक जोखिम में है।`;
    } else if (higher.hasBuyerOffer && higher.offerExpiresInDays && higher.offerExpiresInDays <= 2) {
      compTextEn = `${higher.cropNameEn} ranks higher due to immediate buyer offer expiration pressure (expires in ${higher.offerExpiresInDays} days).`;
      compTextHi = `${higher.cropNameHi} को प्राथमिकता मिली है क्योंकि इसका खरीदार प्रस्ताव केवल ${higher.offerExpiresInDays} दिन में समाप्त हो रहा है।`;
    } else {
      compTextEn = `${higher.cropNameEn} (Score: ${higher.urgencyScore}) has higher composite urgency than ${lower.cropNameEn} (Score: ${lower.urgencyScore}) considering storage condition and shelf life.`;
      compTextHi = `${higher.cropNameHi} (स्कोर: ${higher.urgencyScore}) का समग्र जोखिम स्कोर ${lower.cropNameHi} (स्कोर: ${lower.urgencyScore}) से अधिक है।`;
    }

    explanations.push({
      higherLotId: higher.lotId,
      lowerLotId: lower.lotId,
      higherName: higher.cropNameEn,
      lowerName: lower.cropNameEn,
      textEn: compTextEn,
      textHi: compTextHi
    });
  }

  return {
    rankedLots: evaluated,
    explanations
  };
}

// ============================================================================
// 3. SHORT-DURATION ALTERNATE CROP FILTERING ALGORITHM
// ============================================================================

/**
 * Transparent rule-based matcher for short-duration catch crop windows.
 * Excludes candidates that do not fit the available days, water capacity, or soil.
 * Returns both matched candidates (sorted by suitability) and excluded items with reasons.
 */
export function evaluateAlternateCrops({
  regionId = 'north_plains',
  seasonId = 'zaid_summer',
  availableDays = 65,
  soilId = 'sandy_loam',
  waterId = 'assured_tube'
}) {
  const numDays = Math.max(20, Math.min(120, Number(availableDays) || 60));

  const matched = [];
  const excluded = [];

  // Water level hierarchy for comparison
  const waterRank = {
    rainfed_residual: 1,
    limited_protective: 2,
    assured_tube: 3
  };

  const userWaterRank = waterRank[waterId] || 2;

  SHORT_DURATION_CROPS.forEach(crop => {
    const reasonsWhyNot = [];
    const reasonsWhyNotHi = [];

    // Check 1: Duration fit
    if (crop.minDays > numDays) {
      const deficit = crop.minDays - numDays;
      reasonsWhyNot.push(`Requires at least ${crop.minDays} days to mature, but you only have ${numDays} days available (${deficit} days deficit).`);
      reasonsWhyNotHi.push(`पकने के लिए कम से कम ${crop.minDays} दिन चाहिए, जबकि आपके पास केवल ${numDays} दिन हैं (${deficit} दिन कम)।`);
    }

    // Check 2: Water requirement fit
    const requiredWaterRank = waterRank[crop.minWaterLevel] || 2;
    if (requiredWaterRank > userWaterRank) {
      reasonsWhyNot.push(`Requires assured or protective irrigation (${crop.minWaterLevel.replace('_', ' ')}), but current setup is rainfed/residual moisture.`);
      reasonsWhyNotHi.push(`इस फसल के लिए सिंचाई की आवश्यकता है, जबकि आपका विकल्प वर्षा-आधारित/कम नमी है।`);
    }

    // Check 3: Soil compatibility
    if (crop.suitableSoils && !crop.suitableSoils.includes(soilId)) {
      reasonsWhyNot.push(`Soil type is not optimal; this variety struggles in heavy/unsuited soil profiles.`);
      reasonsWhyNotHi.push(`मिट्टी का प्रकार इस फसल के लिए अनुकूल नहीं है।`);
    }

    // Check 4: Season match
    if (crop.suitableSeasons && !crop.suitableSeasons.includes(seasonId)) {
      reasonsWhyNot.push(`Not suited for ${seasonId.replace('_', ' ')} temperature/day-length conditions.`);
      reasonsWhyNotHi.push(`यह फसल इस मौसम की तापमान और दिन की लंबाई के अनुकूल नहीं है।`);
    }

    if (reasonsWhyNot.length === 0) {
      // Crop is viable! Calculate suitability score (0-100)
      let score = 70;

      // Buffer score: having 5-10 buffer days above minDays is ideal
      const bufferDays = numDays - crop.minDays;
      if (bufferDays >= 5 && bufferDays <= 20) {
        score += 15; // Optimal safety buffer
      } else if (bufferDays < 5) {
        score += 5; // Tight fit
      }

      // Legume / Soil enrichment bonus
      if (crop.nitrogenFixationKgPerHa && crop.nitrogenFixationKgPerHa !== 'None') {
        score += 10;
      }

      // Soil preference exact match
      if (crop.suitableSoils[0] === soilId) {
        score += 5;
      }

      matched.push({
        ...crop,
        score: Math.min(100, score),
        bufferDays,
        fitSummaryEn: `Fits nicely into your ${numDays}-day window (needs ${crop.minDays}-${crop.maxDays} days). Leaves ~${bufferDays} days safety buffer for field prep.`,
        fitSummaryHi: `आपके ${numDays} दिन के समय में पूरी तरह उपयुक्त (अवधि ${crop.minDays}-${crop.maxDays} दिन)। खेत की तैयारी के लिए ~${bufferDays} दिन बचेंगे।`
      });
    } else {
      excluded.push({
        id: crop.id,
        nameEn: crop.nameEn,
        nameHi: crop.nameHi,
        minDays: crop.minDays,
        reasonsEn: reasonsWhyNot,
        reasonsHi: reasonsWhyNotHi
      });
    }
  });

  // Sort matched crops by score descending
  matched.sort((a, b) => b.score - a.score);

  return {
    matchedCrops: matched,
    excludedCrops: excluded,
    totalEvaluated: SHORT_DURATION_CROPS.length
  };
}

// ============================================================================
// 4. VALIDATION ROUTINES
// ============================================================================

export function validateLotInput(lot) {
  const errors = {};

  if (!lot.cropId && (!lot.cropNameCustom || !lot.cropNameCustom.trim())) {
    errors.crop = 'Please select a crop or enter a custom crop name.';
  }

  const q = Number(lot.quantity);
  if (lot.quantity === '' || isNaN(q) || q <= 0) {
    errors.quantity = 'Quantity must be a positive number greater than 0.';
  }

  if (!lot.harvestDate) {
    errors.harvestDate = 'Harvest date is required to compute storage age.';
  } else {
    const harvestDate = new Date(lot.harvestDate);
    const now = new Date();
    // Allow up to 1 day in the future for timezone tolerance, but reject far future dates
    if (harvestDate > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      errors.harvestDate = 'Harvest date cannot be in the future.';
    }
  }

  if (lot.customShelfLifeDays !== '' && lot.customShelfLifeDays !== undefined && lot.customShelfLifeDays !== null) {
    const s = Number(lot.customShelfLifeDays);
    if (isNaN(s) || s <= 0) {
      errors.customShelfLifeDays = 'Custom shelf life must be a positive number of days.';
    }
  }

  if (lot.hasBuyerOffer) {
    const p = Number(lot.offeredPrice);
    if (lot.offeredPrice !== '' && (isNaN(p) || p < 0)) {
      errors.offeredPrice = 'Offered price cannot be negative.';
    }
    const exp = Number(lot.offerExpiresInDays);
    if (lot.offerExpiresInDays !== '' && (isNaN(exp) || exp < 0)) {
      errors.offerExpiresInDays = 'Offer expiration must be 0 or more days.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ============================================================================
// 5. LOCAL STORAGE PERSISTENCE HANDLERS
// ============================================================================

const STORAGE_PREFIX = 'kisanpulse_advisors_';

export function getAdvisorStorage(key, fallback) {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`[KisanPulse Advisors] Failed to read ${key} from storage:`, err);
    return fallback;
  }
}

export function setAdvisorStorage(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[KisanPulse Advisors] Failed to save ${key} to storage:`, err);
  }
}
