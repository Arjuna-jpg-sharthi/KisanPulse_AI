/**
 * schemeMatcher.js — KisanPulse AI Government SchemeMatch
 *
 * Transparent rule-based matching engine.
 * Matches a farmer profile against scheme eligibility rules and produces
 * explainable results. NEVER guarantees approval or benefit payments.
 *
 * Each match result includes:
 *   - matchType: 'potential' | 'likely'   (never 'confirmed')
 *   - reasons:   why the scheme may be relevant
 *   - caveats:   things the farmer should verify independently
 */

import { SCHEMES } from './schemeData.js';

/**
 * @typedef {Object} FarmerProfile
 * @property {string} state        — Indian state / UT selected by the farmer
 * @property {string} ownership    — one of owner | tenant | sharecropper | landless
 * @property {string} landCategory — marginal | small | semi_medium | medium | large
 * @property {string} crop         — free-text crop name
 * @property {string[]} supportNeeds — e.g. ['income_support', 'crop_insurance']
 */

/**
 * @typedef {Object} MatchResult
 * @property {Object}   scheme     — full scheme object from schemeData
 * @property {'potential'|'likely'} matchType
 * @property {string[]} reasons    — human-readable explanation of why matched
 * @property {string[]} caveats    — unresolved eligibility checks / warnings
 * @property {number}   score      — internal relevance score (higher = more relevant)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a scheme is available in the farmer's state.
 * "All India" schemes match every state.
 */
function stateMatches(scheme, farmerState) {
  if (!farmerState || farmerState === 'All India') return true;
  return scheme.states.includes('All India') || scheme.states.includes(farmerState);
}

/**
 * Compute ownership compatibility.
 * Returns { matched, preferred, reason }
 */
function ownershipMatch(rules, ownership) {
  if (!ownership || !rules) {
    return { matched: false, preferred: false, reason: null };
  }
  if (rules.ownershipRequired && rules.ownershipRequired.includes(ownership)) {
    return { matched: true, preferred: false, reason: `Your cultivation status (${ownership}) is within the scheme's target group.` };
  }
  if (rules.ownershipPreferred && rules.ownershipPreferred.includes(ownership)) {
    return { matched: true, preferred: true, reason: `Your cultivation status (${ownership}) may be eligible — please verify with the implementing agency.` };
  }
  return { matched: false, preferred: false, reason: null };
}

/**
 * Check land category compatibility.
 */
function landCategoryMatch(rules, landCategory) {
  if (!landCategory || !rules || !rules.landCategories) return { matched: true, reason: null };
  if (rules.landCategories.includes(landCategory)) {
    return { matched: true, reason: `Your landholding category (${landCategory}) falls within the scheme's scope.` };
  }
  return { matched: false, reason: null };
}

/**
 * Check if any of the farmer's support needs align with the scheme.
 */
function supportNeedMatch(rules, supportNeeds) {
  if (!supportNeeds || supportNeeds.length === 0 || !rules || !rules.supportNeeds) {
    return { matched: false, matchedNeeds: [] };
  }
  const matchedNeeds = supportNeeds.filter((n) => rules.supportNeeds.includes(n));
  return { matched: matchedNeeds.length > 0, matchedNeeds };
}

// ---------------------------------------------------------------------------
// Main matching function
// ---------------------------------------------------------------------------

/**
 * Match a farmer profile against all schemes and return ranked results.
 *
 * @param {FarmerProfile} profile
 * @returns {MatchResult[]}  — sorted by score descending
 */
export function matchSchemes(profile) {
  if (!profile) return [];

  const results = [];

  for (const scheme of SCHEMES) {
    const reasons = [];
    const caveats = [];
    let score = 0;
    const rules = scheme.matchRules;

    // 1. State check
    if (!stateMatches(scheme, profile.state)) {
      continue; // skip schemes that don't cover the farmer's state
    }
    if (scheme.states.includes('All India')) {
      reasons.push('This is a Central Government scheme available across India.');
      score += 1;
    } else {
      reasons.push(`This scheme is available in ${profile.state}.`);
      score += 2; // state-specific match is a stronger signal
    }

    // 2. Ownership check
    const ownResult = ownershipMatch(rules, profile.ownership);
    if (ownResult.matched) {
      reasons.push(ownResult.reason);
      score += ownResult.preferred ? 1 : 3;
      if (ownResult.preferred) {
        caveats.push(
          'Your ownership / cultivation status may be eligible under certain conditions. Please verify with the official source.'
        );
      }
    } else if (profile.ownership) {
      // Ownership doesn't match — still include but with a caveat
      caveats.push(
        `This scheme primarily targets a different ownership category. Your status (${profile.ownership}) may not be eligible. Please check official guidelines.`
      );
      score -= 1;
    }

    // 3. Land category check
    const landResult = landCategoryMatch(rules, profile.landCategory);
    if (landResult.matched && landResult.reason) {
      reasons.push(landResult.reason);
      score += 2;
    } else if (!landResult.matched) {
      caveats.push('Your landholding size may not fall within this scheme\'s target range. Please verify.');
      score -= 1;
    }

    // 4. Support need alignment
    const needResult = supportNeedMatch(rules, profile.supportNeeds);
    if (needResult.matched) {
      reasons.push(
        `Matches your stated need: ${needResult.matchedNeeds
          .map((n) => n.replace(/_/g, ' '))
          .join(', ')}.`
      );
      score += 4; // strongest signal
    } else if (profile.supportNeeds && profile.supportNeeds.length > 0) {
      // Scheme doesn't directly align, but may still be useful
      score -= 2;
    }

    // 5. Standard caveats (always)
    caveats.push(
      'Eligibility shown here is indicative. Final eligibility is determined by the implementing agency based on official rules and verification.'
    );

    // Determine match type
    const matchType = score >= 5 ? 'likely' : 'potential';

    // Only include schemes with some relevance
    if (score >= 0) {
      results.push({
        scheme,
        matchType,
        reasons,
        caveats,
        score,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Search schemes by keyword (name, keywords list, purpose).
 *
 * @param {string} query
 * @param {Object} [filters]  — { state?: string, category?: string }
 * @returns {Object[]}  — matching scheme objects
 */
export function searchSchemes(query, filters = {}) {
  let results = [...SCHEMES];

  // Apply state filter
  if (filters.state && filters.state !== '') {
    results = results.filter(
      (s) => s.states.includes('All India') || s.states.includes(filters.state)
    );
  }

  // Apply category filter
  if (filters.category && filters.category !== '') {
    results = results.filter((s) => s.category === filters.category);
  }

  // Apply text search
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    results = results.filter((s) => {
      const haystack = [
        s.name,
        s.nameHi,
        s.purpose,
        s.purposeHi,
        ...(s.keywords || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return results;
}
