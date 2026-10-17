import { rankMatches as scorePairs } from './matchingEngine.js';

/** Adapt the standalone scoring engine to the marketplace UI contract. */
export function rankMarketplaceMatches(activeItem, candidates, role) {
  const farmerListings = role === 'farmer' ? [activeItem] : candidates;
  const buyerRequests = role === 'farmer' ? candidates : [activeItem];
  const result = scorePairs(farmerListings, buyerRequests);
  return result.matches.map((pair) => ({
    target: role === 'farmer' ? pair.buyerRequest : pair.farmerListing,
    matchScore: pair.score,
    reasons: pair.reasons,
    compatibilityStatus: pair.compatibilityStatus,
  }));
}
