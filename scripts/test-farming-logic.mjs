/**
 * Automated Logic Verification Test for KisanPulse AI Smart Farming Module
 */
import {
  calculateGrossRevenue,
  calculateTotalCosts,
  calculateNetProceeds,
  calculateNetProceedsPerQuintal,
  validateMarketInputs,
  evaluateAndRankMarkets,
  explainMarketRankings,
  getIrrigationGuidance
} from '../src/modules/farming/farmingUtils.js';

import { CROPS_CATALOG } from '../src/modules/farming/farmingData.js';

console.log('========================================================');
console.log('🧪 RUNNING KISANPULSE AI SMART FARMING VERIFICATION SUITE');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// TEST GROUP 1: MATHEMATICAL FORMULAS
// ----------------------------------------------------
console.log('1. Testing Mathematical Calculation Formulas:');
const gross = calculateGrossRevenue(50, 2400);
assert(gross === 120000, `Gross revenue (50 q * ₹2,400) = 120,000. Got: ${gross}`);

const sampleMarket = {
  transportCost: 3500,
  loadingCost: 500,
  mandiFee: 600,
  otherCosts: 250
};
const totalCosts = calculateTotalCosts(sampleMarket);
assert(totalCosts === 4850, `Total costs (3500 + 500 + 600 + 250) = 4,850. Got: ${totalCosts}`);

const net = calculateNetProceeds(gross, totalCosts);
assert(net === 115150, `Net proceeds (120,000 - 4,850) = 115,150. Got: ${net}`);

const netPerQ = calculateNetProceedsPerQuintal(net, 50);
assert(netPerQ === 2303, `Net per quintal (115,150 / 50) = 2,303. Got: ${netPerQ}`);

// ----------------------------------------------------
// TEST GROUP 2: CRITICAL ACCEPTANCE CRITERIA
// "A higher selling price does not automatically win if expenses are higher"
// ----------------------------------------------------
console.log('\n2. Testing Market Ranking: Higher Sticker Price Does NOT Automatically Win:');

const marketsForSmallBatch = [
  {
    id: 'distant-hub',
    name: 'Distant City APMC',
    sellingPrice: 2480, // Higher price!
    transportCost: 3500,
    loadingCost: 500,
    mandiFee: 600,
    otherCosts: 250
  },
  {
    id: 'local-miller',
    name: 'Local Village Flour Mill',
    sellingPrice: 2320, // Lower price by ₹160/q!
    transportCost: 400,
    loadingCost: 300,
    mandiFee: 0,
    otherCosts: 100
  }
];

// For a small quantity (10 quintals):
// Distant: Gross = 24,800. Costs = 4,850. Net = 19,950 (₹1,995/q)
// Local:   Gross = 23,200. Costs = 800.   Net = 22,400 (₹2,240/q) -> WINS BY ₹2,450!
const smallBatchRanked = evaluateAndRankMarkets(10, marketsForSmallBatch);
assert(smallBatchRanked[0].id === 'local-miller', 'Local miller ranks #1 despite lower selling price (₹2,320 vs ₹2,480) due to low expenses.');
assert(smallBatchRanked[0].netProceeds === 22400, `Local miller net proceeds = 22,400. Got: ${smallBatchRanked[0].netProceeds}`);
assert(smallBatchRanked[1].netProceeds === 19950, `Distant APMC net proceeds = 19,950. Got: ${smallBatchRanked[1].netProceeds}`);

// Verify Explanation Engine
const explanation = explainMarketRankings(smallBatchRanked, 10);
assert(explanation.highlightType === 'cost_savings_triumph', 'Explanation detects cost_savings_triumph when lower sticker price wins.');
assert(explanation.summary.includes('higher headline price'), 'Explanation notes the headline price gap.');
assert(explanation.verdict.includes('MORE net cash'), 'Explanation calculates net gain clearly.');

// ----------------------------------------------------
// TEST GROUP 3: INPUT VALIDATION
// ----------------------------------------------------
console.log('\n3. Testing Comprehensive Validation & Edge Cases:');

const valInvalidQty = validateMarketInputs(-5, marketsForSmallBatch);
assert(!valInvalidQty.isValid, 'Validation rejects negative produce quantity (-5 q).');

const valZeroQty = validateMarketInputs(0, marketsForSmallBatch);
assert(!valZeroQty.isValid, 'Validation rejects zero quantity.');

const valEmptyQty = validateMarketInputs('', marketsForSmallBatch);
assert(!valEmptyQty.isValid, 'Validation rejects empty quantity string.');

const marketsWithNegatives = [
  { id: 'm1', name: 'Mandi 1', sellingPrice: 2000, transportCost: -50, loadingCost: 0, mandiFee: 0, otherCosts: 0 },
  { id: 'm2', name: 'Mandi 2', sellingPrice: 2000, transportCost: 100, loadingCost: 0, mandiFee: 0, otherCosts: 0 }
];
const valNegativeCost = validateMarketInputs(10, marketsWithNegatives);
assert(!valNegativeCost.isValid, 'Validation flags negative transport cost (-50).');

const valSingleMarket = validateMarketInputs(10, [marketsForSmallBatch[0]]);
assert(!valSingleMarket.isValid, 'Validation rejects fewer than 2 markets (at least 2 required to compare).');

// ----------------------------------------------------
// TEST GROUP 4: TRANSPARENT IRRIGATION DECISION TREE
// ----------------------------------------------------
console.log('\n4. Testing Rule-Based Irrigation Guidance:');
const wheat = CROPS_CATALOG.find(c => c.id === 'wheat');

// Case A: Heavy rain
const irrigHeavyRain = getIrrigationGuidance({
  crop: wheat,
  stageId: 'sowing', // CRI stage
  rainfall: 'heavy',
  soilMoisture: 'high',
  daysSinceWatering: 12
});
assert(irrigHeavyRain.urgency === 'low', 'Irrigation urgency is low after heavy rainfall.');
assert(irrigHeavyRain.recommendation.includes('Hold off'), 'Recommends holding off after heavy rain.');

// Case B: Critical stage (CRI) with dry soil
const irrigCriticalDry = getIrrigationGuidance({
  crop: wheat,
  stageId: 'sowing',
  rainfall: 'none',
  soilMoisture: 'low',
  daysSinceWatering: 10
});
assert(irrigCriticalDry.urgency === 'high', 'Irrigation urgency is high for critical CRI stage with dry soil.');
assert(irrigCriticalDry.recommendation.includes('Priority Irrigation'), 'High priority recommendation issued within 24-48 hours.');

// Case C: Maturity stage
const irrigMaturity = getIrrigationGuidance({
  crop: wheat,
  stageId: 'maturity',
  rainfall: 'none',
  soilMoisture: 'moderate',
  daysSinceWatering: 15
});
assert(irrigMaturity.urgency === 'low', 'Irrigation urgency is low during maturity dry-down phase.');
assert(irrigMaturity.recommendation.includes('Withhold'), 'Recommends withholding water to assist harvest drying.');

// Case D: Assumptions and phone sensor limitation stated
assert(irrigCriticalDry.assumptions.length >= 3, 'Guidance includes model assumptions.');
assert(irrigCriticalDry.assumptions.some(a => a.includes('cannot physically measure')), 'Explicitly states phone cannot measure soil moisture.');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`🏁 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('========================================================\n');
