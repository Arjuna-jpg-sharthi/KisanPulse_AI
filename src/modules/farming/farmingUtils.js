/**
 * KisanPulse AI - Smart Farming Module Utilities
 * Business logic, financial formulas, input validations,
 * transparent irrigation decision matrix, and offline local-storage handlers.
 */

/**
 * Formula: Gross revenue = quantity × price per quintal.
 */
export function calculateGrossRevenue(quantity, pricePerQuintal) {
  const q = Number(quantity) || 0;
  const p = Number(pricePerQuintal) || 0;
  return Math.round(q * p * 100) / 100;
}

/**
 * Sum of all operational and market expenses.
 */
export function calculateTotalCosts(market) {
  const transport = Number(market.transportCost) || 0;
  const loading = Number(market.loadingCost) || 0;
  const mandiFee = Number(market.mandiFee) || 0;
  const otherCosts = Number(market.otherCosts) || 0;
  return Math.round((transport + loading + mandiFee + otherCosts) * 100) / 100;
}

/**
 * Formula: Estimated net proceeds = gross revenue − all entered costs.
 */
export function calculateNetProceeds(grossRevenue, totalCosts) {
  return Math.round((grossRevenue - totalCosts) * 100) / 100;
}

/**
 * Formula: Net proceeds per quintal = net proceeds ÷ quantity.
 */
export function calculateNetProceedsPerQuintal(netProceeds, quantity) {
  const q = Number(quantity);
  if (!q || q <= 0) return 0;
  return Math.round((netProceeds / q) * 100) / 100;
}

/**
 * Validates inputs for the Smart Mandi & Profit Engine.
 * Rejects negative numbers, missing values, and zero/negative quantity.
 */
export function validateMarketInputs(quantity, markets) {
  const errors = {};
  const numQuantity = Number(quantity);

  if (quantity === '' || quantity === null || quantity === undefined) {
    errors.quantity = 'Quantity is required (quintals).';
  } else if (isNaN(numQuantity) || numQuantity <= 0) {
    errors.quantity = 'Quantity must be a positive number greater than 0.';
  }

  if (!Array.isArray(markets) || markets.length < 2) {
    errors.marketsGeneral = 'Please specify at least 2 markets to compare.';
  }

  markets.forEach((m, idx) => {
    const marketErrors = {};
    if (!m.name || !m.name.trim()) {
      marketErrors.name = 'Market name is required.';
    }

    const price = Number(m.sellingPrice);
    if (m.sellingPrice === '' || isNaN(price) || price < 0) {
      marketErrors.sellingPrice = 'Selling price must be 0 or higher.';
    }

    const costs = ['transportCost', 'loadingCost', 'mandiFee', 'otherCosts'];
    costs.forEach(c => {
      const val = Number(m[c]);
      if (m[c] === '' || isNaN(val) || val < 0) {
        marketErrors[c] = 'Cost cannot be negative.';
      }
    });

    if (Object.keys(marketErrors).length > 0) {
      errors[`market_${m.id || idx}`] = marketErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Evaluates and ranks all markets by estimated net proceeds descending.
 * Attaches calculated metrics to each market object.
 */
export function evaluateAndRankMarkets(quantity, markets) {
  const q = Number(quantity) || 0;

  const evaluated = markets.map(m => {
    const grossRevenue = calculateGrossRevenue(q, m.sellingPrice);
    const totalCosts = calculateTotalCosts(m);
    const netProceeds = calculateNetProceeds(grossRevenue, totalCosts);
    const netProceedsPerQuintal = calculateNetProceedsPerQuintal(netProceeds, q);

    return {
      ...m,
      grossRevenue,
      totalCosts,
      netProceeds,
      netProceedsPerQuintal
    };
  });

  // Sort descending by netProceeds; if tied, sort by higher netProceedsPerQuintal
  evaluated.sort((a, b) => b.netProceeds - a.netProceeds);

  return evaluated.map((m, index) => ({
    ...m,
    rank: index + 1
  }));
}

/**
 * Generates an intuitive, transparent agronomic explanation of why a market ranks higher.
 * Explicitly calls out when a higher selling price is negated by higher transportation and overheads.
 */
export function explainMarketRankings(rankedMarkets, quantity) {
  if (!rankedMarkets || rankedMarkets.length < 2) {
    return 'Add at least 2 markets to generate comparative analysis.';
  }

  const top = rankedMarkets[0];
  const second = rankedMarkets[1];
  const q = Number(quantity) || 0;

  const priceDiff = Number(second.sellingPrice) - Number(top.sellingPrice);
  const costDiff = second.totalCosts - top.totalCosts;
  const netGain = top.netProceeds - second.netProceeds;

  const formattedNetGain = formatCurrency(netGain);
  const formattedTopNet = formatCurrency(top.netProceeds);
  const formattedSecondNet = formatCurrency(second.netProceeds);

  // Scenario 1: Second market has a higher sticker selling price, but loses due to higher costs
  if (priceDiff > 0) {
    return {
      title: `Why ${top.name} Ranks #1 Despite a Lower Sticker Price:`,
      highlightType: 'cost_savings_triumph',
      summary: `${second.name} offers ₹${priceDiff}/quintal higher headline price (₹${second.sellingPrice} vs ₹${top.sellingPrice}), but its operational expenses are ₹${formatCurrency(costDiff)} higher (transport + mandi cess + loading).`,
      verdict: `Because expenses in ${second.name} eat away all of the ₹${formatCurrency(priceDiff * q)} revenue surplus and more, you pocket ${formattedNetGain} MORE net cash by choosing ${top.name}.`,
      ruleCheck: 'Sticker price alone is misleading — logistics and mandi overhead determine real in-hand farm income.'
    };
  }

  // Scenario 2: Top market has both higher selling price and competitive costs
  if (priceDiff < 0) {
    const extraRevenue = (Number(top.sellingPrice) - Number(second.sellingPrice)) * q;
    return {
      title: `Why ${top.name} is the Clear Winner:`,
      highlightType: 'price_advantage',
      summary: `${top.name} provides a superior selling rate of ₹${top.sellingPrice}/q (₹${Math.abs(priceDiff)}/q more than ${second.name}), generating ₹${formatCurrency(extraRevenue)} higher gross revenue.`,
      verdict: `Combined with controlled operational expenses (₹${formatCurrency(top.totalCosts)}), it delivers ₹${formattedNetGain} more take-home proceeds than ${second.name}.`,
      ruleCheck: 'Optimal balance of market price and transit logistics.'
    };
  }

  // Scenario 3: Selling prices are identical, ranking decided purely by cost efficiency
  return {
    title: `Why ${top.name} Ranks Higher on Equal Prices:`,
    highlightType: 'expense_efficiency',
    summary: `Both ${top.name} and ${second.name} offer the same rate of ₹${top.sellingPrice}/quintal.`,
    verdict: `${top.name} has ₹${formatCurrency(costDiff)} lower total expenses (transport + loading + mandi fees), giving you an immediate ${formattedNetGain} profit bonus.`,
    ruleCheck: 'Operational expense minimization directly boosts net profit.'
  };
}

/**
 * Formats a numeric value into Indian Rupee style string (e.g. ₹ 1,24,000)
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/**
 * Transparent, rule-based irrigation guidance following ICAR/FAO principles.
 * Avoids pseudo-precise unsupported volume claims.
 * Explains assumptions and missing variables clearly.
 */
export function getIrrigationGuidance({
  crop,
  stageId,
  rainfall = 'none', // 'none' | 'light' | 'moderate' | 'heavy'
  soilMoisture = 'moderate', // 'low' | 'moderate' | 'high'
  daysSinceWatering = 0
}) {
  const selectedStage = crop?.stages?.find(s => s.id === stageId) || crop?.stages?.[0];
  const isCriticalStage = selectedStage?.criticalMoisture || false;
  const days = Number(daysSinceWatering) || 0;

  let recommendation = '';
  let urgency = 'normal'; // 'low' | 'normal' | 'high' | 'caution'
  let rationale = '';

  // Rule 1: Heavy recent rainfall
  if (rainfall === 'heavy') {
    urgency = 'low';
    recommendation = 'Hold off on irrigation for 4-7 days.';
    rationale = 'Heavy recent rainfall (> 25 mm) has saturated the active root zone. Irrigating now risks root asphyxiation, nutrient leaching, and fungal soil-borne diseases.';
  }
  // Rule 2: Soil already high / saturated
  else if (soilMoisture === 'high') {
    urgency = 'low';
    recommendation = 'Delay irrigation. Soil is currently saturated.';
    rationale = 'High residual soil moisture detected via visual inspection. Allow upper root zone to aerate before scheduling further watering.';
  }
  // Rule 3: Crop is at final maturity stage
  else if (selectedStage?.id === 'maturity' || selectedStage?.id === 'haulm_cutting' || selectedStage?.id === 'boll_opening') {
    urgency = 'low';
    recommendation = 'Withhold irrigation to facilitate pre-harvest field drying.';
    rationale = 'Crop has reached physiological maturity. Withholding water encourages uniform drying, seed hardening, and allows tractors/combines to enter without soil compaction.';
  }
  // Rule 4: Critical growth stage with low moisture or delayed watering
  else if (isCriticalStage && (soilMoisture === 'low' || days >= 8)) {
    urgency = 'high';
    recommendation = 'Priority Irrigation Recommended within 24 to 48 hours.';
    rationale = `Your crop is in the "${selectedStage.label}" phase, which is a moisture-critical physiological window. Moisture stress right now can cause irreversible yield penalty (e.g. spikelet sterility or flower drop).`;
  }
  // Rule 5: Non-critical stage but soil is dry
  else if (soilMoisture === 'low') {
    urgency = 'normal';
    recommendation = 'Schedule standard light irrigation within 2 to 3 days.';
    rationale = 'Dry upper root zone observed. Provide moderate watering to maintain vegetative vigor without puddling.';
  }
  // Rule 6: Moderate moisture during critical stage
  else if (isCriticalStage) {
    urgency = 'normal';
    recommendation = 'Monitor daily. Plan next irrigation in 3 to 4 days unless rain occurs.';
    rationale = `Moisture is currently adequate, but the crop is at critical stage "${selectedStage.label}". Do not allow soil to crack.`;
  }
  // Rule 7: Light rainfall occurred
  else if (rainfall === 'light' || rainfall === 'moderate') {
    urgency = 'low';
    recommendation = 'Postpone irrigation by 2 to 3 days.';
    rationale = 'Recent rainfall partially replenished topsoil moisture. Check sub-surface soil before next cycle.';
  }
  // Default general baseline
  else {
    urgency = 'normal';
    recommendation = days > 10 ? 'Irrigation likely needed soon.' : 'Adequate interval. Maintain normal rotation.';
    rationale = `Last watered ${days} day(s) ago. Crop vegetative water consumption is moderate under prevailing conditions.`;
  }

  return {
    recommendation,
    urgency,
    rationale,
    stageInfo: selectedStage,
    assumptions: [
      'Assumes standard well-drained loamy to sandy-loam field texture with 40-60 cm effective root depth.',
      'Prevailing ambient temperature of 25-30°C and average relative humidity.',
      'Does not account for micro-topography slope, hardpan layers, or saline groundwater tables.',
      'Smartphones cannot physically measure moisture. Farmer observation (soil hand-feel test at 15 cm depth) is required.'
    ],
    disclaimer: 'Agronomic guidance is rule-based and informational. Actual evapotranspiration varies with real-time temperature, wind, and soil composition.'
  };
}

/**
 * Image compressor for local browser storage.
 * Downscales images to max dimension and compresses to JPEG dataURL,
 * preventing localStorage quota exhaustion (5MB limit).
 */
export function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Safe Local Storage Helpers with quota handling
 */
const STORAGE_PREFIX = 'kisanpulse_';

export function getLocalItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function setLocalItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return { success: true };
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
    return {
      success: false,
      error: 'Device storage is full or local storage is disabled.'
    };
  }
}

export function removeLocalItem(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (err) {
    return false;
  }
}
