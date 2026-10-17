/**
 * matchingEngine.js — KisanPulse AI Marketplace Matching Engine
 *
 * Pure, dependency-free, deterministic matching logic.
 * Connects farmer crop listings with buyer purchase requests and provides
 * transparent deal-vs-mandi comparisons.
 *
 * IMPORTANT DISCLAIMERS
 * ---------------------
 * • This is a rule-based scoring system, NOT machine learning.
 * • No fabricated market data is used. All prices come from user input.
 * • "Middleman elimination savings" are computed ONLY when an explicit
 *   commission amount is supplied or when a clearly-labeled demo assumption
 *   is used. No universal or guaranteed saving is ever claimed.
 *
 * Data contracts
 * --------------
 * Farmer post (listing):
 *   { id, crop, variety, quantityQuintals, harvestDate,
 *     expectedPricePerQuintal, district, state,
 *     grade? , moisture? }
 *
 * Buyer request:
 *   { id, crop, quantityQuintals, maxPricePerQuintal,
 *     neededBy, district, state }
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — Validation helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a single value: must be a non-empty string.
 * @param {*} val
 * @returns {boolean}
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Validate a single value: must be a finite number > 0.
 * @param {*} val
 * @returns {boolean}
 */
function isPositiveNumber(val) {
  return typeof val === 'number' && Number.isFinite(val) && val > 0;
}

/**
 * Parse a date string (YYYY-MM-DD) into a Date at midnight UTC.
 * Returns null on failure.
 * @param {string} str
 * @returns {Date|null}
 */
function parseDate(str) {
  if (!isNonEmptyString(str)) return null;
  const d = new Date(str + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Return an array of error strings for a farmer listing.
 * @param {Object} listing
 * @returns {string[]}
 */
function validateListing(listing) {
  const errors = [];
  if (!listing || typeof listing !== 'object') return ['Listing is null or not an object.'];
  if (!isNonEmptyString(listing.id))                        errors.push('Listing missing valid "id".');
  if (!isNonEmptyString(listing.crop))                      errors.push('Listing missing valid "crop".');
  if (!isPositiveNumber(listing.quantityQuintals))           errors.push('Listing "quantityQuintals" must be a positive number.');
  if (!isPositiveNumber(listing.expectedPricePerQuintal))    errors.push('Listing "expectedPricePerQuintal" must be a positive number.');
  if (!isNonEmptyString(listing.district))                   errors.push('Listing missing valid "district".');
  if (!isNonEmptyString(listing.state))                      errors.push('Listing missing valid "state".');
  // harvestDate is validated softly — scoring degrades gracefully
  return errors;
}

/**
 * Return an array of error strings for a buyer request.
 * @param {Object} req
 * @returns {string[]}
 */
function validateRequest(req) {
  const errors = [];
  if (!req || typeof req !== 'object') return ['Request is null or not an object.'];
  if (!isNonEmptyString(req.id))                  errors.push('Request missing valid "id".');
  if (!isNonEmptyString(req.crop))                errors.push('Request missing valid "crop".');
  if (!isPositiveNumber(req.quantityQuintals))     errors.push('Request "quantityQuintals" must be a positive number.');
  if (!isPositiveNumber(req.maxPricePerQuintal))   errors.push('Request "maxPricePerQuintal" must be a positive number.');
  if (!isNonEmptyString(req.district))             errors.push('Request missing valid "district".');
  if (!isNonEmptyString(req.state))                errors.push('Request missing valid "state".');
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — Scoring sub-functions (used by rankMatches)
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Scoring weights (out of 100 total):
 *   Price compatibility   — 35 points
 *   Quantity fit           — 25 points
 *   Location proximity     — 25 points
 *   Date compatibility     — 15 points
 */

const WEIGHTS = Object.freeze({
  PRICE:    35,
  QUANTITY: 25,
  LOCATION: 25,
  DATE:     15,
});

/**
 * Score price compatibility (0–1 ratio → scaled by WEIGHTS.PRICE).
 *
 * Best case: buyer's max price ≥ farmer's expected price → full score.
 * Partial: the closer the buyer's ceiling is to the farmer's ask, the
 * higher the score. Zero if buyer's max is ≤ 0 or farmer's ask is ≤ 0.
 *
 * @returns {{ score: number, reason: string }}
 */
function scorePrice(listing, request) {
  const ask = listing.expectedPricePerQuintal;
  const offer = request.maxPricePerQuintal;

  if (offer >= ask) {
    return {
      score: WEIGHTS.PRICE,
      reason: `Buyer's max price (₹${offer}/q) meets or exceeds farmer's expected price (₹${ask}/q).`,
    };
  }

  // Partial: ratio of offer / ask
  const ratio = offer / ask;              // always < 1 here
  const pts   = Math.round(ratio * WEIGHTS.PRICE);
  const gap   = ask - offer;
  return {
    score: pts,
    reason: `Buyer's max price (₹${offer}/q) is ₹${gap}/q below farmer's expected price (₹${ask}/q). Price compatibility: ${Math.round(ratio * 100)}%.`,
  };
}

/**
 * Score quantity fit (0–1 ratio → scaled by WEIGHTS.QUANTITY).
 *
 * Full score when quantities match exactly or farmer has enough.
 * Partial matches are scored proportionally AND explicitly flagged.
 *
 * @returns {{ score: number, reason: string }}
 */
function scoreQuantity(listing, request) {
  const available = listing.quantityQuintals;
  const needed    = request.quantityQuintals;

  if (available >= needed) {
    if (available === needed) {
      return {
        score: WEIGHTS.QUANTITY,
        reason: `Exact quantity match: ${needed} quintals.`,
      };
    }
    return {
      score: WEIGHTS.QUANTITY,
      reason: `Farmer can supply the full ${needed} quintals requested (has ${available} quintals available).`,
    };
  }

  // Partial: farmer has less than buyer needs
  const ratio = available / needed;
  const pts   = Math.round(ratio * WEIGHTS.QUANTITY);
  return {
    score: pts,
    reason: `Partial quantity match: farmer has ${available} quintals but buyer needs ${needed} quintals (${Math.round(ratio * 100)}% of demand). The remaining ${+(needed - available).toFixed(2)} quintals would need to come from another source.`,
  };
}

/**
 * Score location proximity (0, partial, or full).
 *
 * Same district → full score.
 * Same state, different district → 60 % of location score.
 * Different state → 0.
 *
 * NOTE: We intentionally do NOT invent a distance value.
 *
 * @returns {{ score: number, reason: string }}
 */
function scoreLocation(listing, request) {
  const sameDistrict = listing.district.trim().toLowerCase() === request.district.trim().toLowerCase();
  const sameState    = listing.state.trim().toLowerCase()    === request.state.trim().toLowerCase();

  if (sameDistrict && sameState) {
    return {
      score: WEIGHTS.LOCATION,
      reason: `Same district (${listing.district}, ${listing.state}) — minimal transport likely.`,
    };
  }

  if (sameState) {
    const pts = Math.round(WEIGHTS.LOCATION * 0.6);
    return {
      score: pts,
      reason: `Same state (${listing.state}) but different districts (${listing.district} → ${request.district}).`,
    };
  }

  return {
    score: 0,
    reason: `Different states (${listing.state} → ${request.state}). Transport and logistics may be significant.`,
  };
}

/**
 * Score date compatibility (0–1 ratio → scaled by WEIGHTS.DATE).
 *
 * If both dates are parseable:
 *   harvest on or before neededBy → full score.
 *   harvest up to 30 days after neededBy → partial (linear decay).
 *   harvest > 30 days late → 0.
 * If either date is missing → half score with a caveat.
 *
 * @returns {{ score: number, reason: string }}
 */
function scoreDate(listing, request) {
  const harvest  = parseDate(listing.harvestDate);
  const neededBy = parseDate(request.neededBy);

  if (!harvest || !neededBy) {
    return {
      score: Math.round(WEIGHTS.DATE * 0.5),
      reason: 'One or both dates unavailable — date compatibility could not be fully assessed.',
    };
  }

  const diffMs   = harvest.getTime() - neededBy.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      score: WEIGHTS.DATE,
      reason: `Harvest date (${listing.harvestDate}) is on or before the buyer's deadline (${request.neededBy}).`,
    };
  }

  if (diffDays <= 30) {
    const ratio = 1 - diffDays / 30;
    const pts   = Math.round(ratio * WEIGHTS.DATE);
    return {
      score: pts,
      reason: `Harvest date (${listing.harvestDate}) is ${diffDays} day(s) after the buyer's deadline (${request.neededBy}). Partial date compatibility.`,
    };
  }

  return {
    score: 0,
    reason: `Harvest date (${listing.harvestDate}) is ${diffDays} days after the buyer's deadline (${request.neededBy}) — likely too late.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — rankMatches
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rank every valid (farmer listing, buyer request) pair.
 *
 * Only pairs with the **same crop** (case-insensitive) are considered.
 *
 * @param {Object[]} farmerListings
 * @param {Object[]} buyerRequests
 * @returns {{ matches: Object[], validationErrors: Object[] }}
 *
 * Each match object:
 *   {
 *     farmerListing,          // original farmer post object
 *     buyerRequest,           // original buyer request object
 *     score,                  // 0–100
 *     compatibilityStatus,    // 'Excellent' | 'Good' | 'Fair' | 'Poor'
 *     reasons,                // string[] — one per scoring dimension
 *   }
 */
export function rankMatches(farmerListings, buyerRequests) {
  const validationErrors = [];
  const matches = [];

  // ── Input-level guard ──
  if (!Array.isArray(farmerListings) || !Array.isArray(buyerRequests)) {
    validationErrors.push({
      type: 'input',
      message: 'Both farmerListings and buyerRequests must be arrays.',
    });
    return { matches, validationErrors };
  }

  // ── Validate individual items and index valid ones ──
  const validListings = [];
  for (const listing of farmerListings) {
    const errs = validateListing(listing);
    if (errs.length > 0) {
      validationErrors.push({ type: 'listing', id: listing?.id ?? '(unknown)', errors: errs });
    } else {
      validListings.push(listing);
    }
  }

  const validRequests = [];
  for (const req of buyerRequests) {
    const errs = validateRequest(req);
    if (errs.length > 0) {
      validationErrors.push({ type: 'request', id: req?.id ?? '(unknown)', errors: errs });
    } else {
      validRequests.push(req);
    }
  }

  // ── Cross-match every valid pair with the same crop ──
  for (const listing of validListings) {
    for (const request of validRequests) {
      // Crop must match (case-insensitive, trimmed)
      if (listing.crop.trim().toLowerCase() !== request.crop.trim().toLowerCase()) {
        continue;
      }

      const priceResult    = scorePrice(listing, request);
      const quantityResult = scoreQuantity(listing, request);
      const locationResult = scoreLocation(listing, request);
      const dateResult     = scoreDate(listing, request);

      const totalScore = priceResult.score + quantityResult.score + locationResult.score + dateResult.score;

      let compatibilityStatus;
      if (totalScore >= 80) compatibilityStatus = 'Excellent';
      else if (totalScore >= 60) compatibilityStatus = 'Good';
      else if (totalScore >= 40) compatibilityStatus = 'Fair';
      else compatibilityStatus = 'Poor';

      const reasons = [
        priceResult.reason,
        quantityResult.reason,
        locationResult.reason,
        dateResult.reason,
      ];

      matches.push({
        farmerListing: listing,
        buyerRequest:  request,
        score:         totalScore,
        compatibilityStatus,
        reasons,
      });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);

  return { matches, validationErrors };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — calculateDealComparison
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compare a direct buyer deal with selling through a mandi (APMC market).
 *
 * @param {Object} params
 * @param {Object} params.listing               — farmer listing object (for context)
 * @param {number} params.offerPricePerQuintal   — buyer's offered price per quintal
 * @param {number} params.mandiPricePerQuintal   — current mandi rate per quintal
 * @param {number} params.quantityQuintals       — quantity being sold
 * @param {Object} [params.costs]                — optional cost items (all in ₹)
 *   @param {number} [params.costs.transport]           — transport cost (both channels)
 *   @param {number} [params.costs.loadingHandling]     — loading / handling charges
 *   @param {number} [params.costs.mandiFeePercent]     — mandi fee as % of mandi gross (e.g. 1 = 1 %)
 *   @param {number} [params.costs.cessPercent]         — cess as % of mandi gross
 *   @param {number} [params.costs.commissionPercent]   — commission agent % of mandi gross
 *
 * @returns {Object}  — detailed comparison result (see shape below)
 */
export function calculateDealComparison({
  listing,
  offerPricePerQuintal,
  mandiPricePerQuintal,
  quantityQuintals,
  costs = {},
} = {}) {
  // ── Validate required numeric inputs ──
  const errors = [];
  if (!isPositiveNumber(offerPricePerQuintal)) errors.push('"offerPricePerQuintal" must be a positive number.');
  if (!isPositiveNumber(mandiPricePerQuintal)) errors.push('"mandiPricePerQuintal" must be a positive number.');
  if (!isPositiveNumber(quantityQuintals))     errors.push('"quantityQuintals" must be a positive number.');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // ── Helper: safe non-negative number (treat negatives as invalid) ──
  const safeNum = (v) => {
    if (v === undefined || v === null) return 0;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null; // signals error
    return v;
  };

  // ── Parse optional costs ──
  const transport       = safeNum(costs.transport);
  const loadingHandling = safeNum(costs.loadingHandling);
  const mandiFeePercent = safeNum(costs.mandiFeePercent);
  const cessPercent     = safeNum(costs.cessPercent);
  const commissionPct   = safeNum(costs.commissionPercent);

  const costValues = [transport, loadingHandling, mandiFeePercent, cessPercent, commissionPct];
  for (const v of costValues) {
    if (v === null) {
      return { valid: false, errors: ['Cost values must be non-negative numbers when supplied.'] };
    }
  }

  // ── Gross values ──
  const directGross = offerPricePerQuintal * quantityQuintals;
  const mandiGross  = mandiPricePerQuintal * quantityQuintals;

  // ── Direct-sale cost breakdown ──
  const directCosts = {};
  let directTotalCosts = 0;
  if (transport > 0) {
    directCosts.transport = transport;
    directTotalCosts += transport;
  }
  if (loadingHandling > 0) {
    directCosts.loadingHandling = loadingHandling;
    directTotalCosts += loadingHandling;
  }

  // ── Mandi cost breakdown ──
  const mandiCosts = {};
  let mandiTotalCosts = 0;
  if (transport > 0) {
    mandiCosts.transport = transport;
    mandiTotalCosts += transport;
  }
  if (loadingHandling > 0) {
    mandiCosts.loadingHandling = loadingHandling;
    mandiTotalCosts += loadingHandling;
  }
  if (mandiFeePercent > 0) {
    const fee = round2(mandiGross * mandiFeePercent / 100);
    mandiCosts.mandiFee = fee;
    mandiCosts.mandiFeeLabel = `${mandiFeePercent}% of mandi gross (₹${mandiGross})`;
    mandiTotalCosts += fee;
  }
  if (cessPercent > 0) {
    const cess = round2(mandiGross * cessPercent / 100);
    mandiCosts.cess = cess;
    mandiCosts.cessLabel = `${cessPercent}% of mandi gross (₹${mandiGross})`;
    mandiTotalCosts += cess;
  }
  if (commissionPct > 0) {
    const comm = round2(mandiGross * commissionPct / 100);
    mandiCosts.commission = comm;
    mandiCosts.commissionLabel = `${commissionPct}% of mandi gross (₹${mandiGross})`;
    mandiTotalCosts += comm;
  }

  // ── Net proceeds ──
  const directNet = round2(directGross - directTotalCosts);
  const mandiNet  = round2(mandiGross  - mandiTotalCosts);

  // ── Savings analysis ──
  const difference = round2(directNet - mandiNet);

  // Only compute "middleman elimination savings" when commission was
  // explicitly provided.  We NEVER claim a universal or guaranteed saving.
  let commissionSavingsNote = null;
  if (commissionPct > 0) {
    const commAmt = round2(mandiGross * commissionPct / 100);
    commissionSavingsNote =
      `By selling directly, the farmer avoids the ₹${commAmt} commission ` +
      `(${commissionPct}% of mandi gross) that would be paid to a commission ` +
      `agent at the mandi. This is based on the commission rate you supplied ` +
      `and may vary by market and agent.`;
  }

  return {
    valid: true,
    inputs: {
      offerPricePerQuintal,
      mandiPricePerQuintal,
      quantityQuintals,
      costs: { ...costs },
    },
    directSale: {
      grossValue:  round2(directGross),
      itemizedCosts: { ...directCosts },
      totalCosts:  round2(directTotalCosts),
      estimatedNetProceeds: directNet,
    },
    mandiSale: {
      grossValue:  round2(mandiGross),
      itemizedCosts: { ...mandiCosts },
      totalCosts:  round2(mandiTotalCosts),
      estimatedNetProceeds: mandiNet,
    },
    comparison: {
      directMinusMandi: difference,
      betterOption: difference > 0 ? 'Direct Sale' : difference < 0 ? 'Mandi Sale' : 'Equal',
      commissionSavingsNote,
      disclaimer:
        'These are estimates based on the values you provided. Actual proceeds ' +
        'may differ due to quality grading, market fluctuations, additional fees, ' +
        'and other factors. This tool does not guarantee any specific outcome.',
    },
    listing: listing ?? null,
  };
}

// ── tiny rounding helper ──
function round2(n) {
  return Math.round(n * 100) / 100;
}
