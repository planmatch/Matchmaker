import { STYLES, FEATURES } from "../data/plans.js";

/* ---------------------------------------------------------
   PARSING: pull structured criteria out of free text.
   Used as a fallback if the LLM extraction endpoint fails.
--------------------------------------------------------- */
export function parseDescription(text) {
  const t = text.toLowerCase();
  const criteria = { raw: text };

  const bedMatch = t.match(/(\d+)\s*[- ]?(bed|bedroom)/);
  if (bedMatch) criteria.beds = parseInt(bedMatch[1], 10);

  const bathMatch = t.match(/(\d+(\.\d)?)\s*[- ]?(bath|bathroom)/);
  if (bathMatch) criteria.baths = parseFloat(bathMatch[1]);

  const sqftMatch = t.match(/(\d{3,5})\s*(sq ?\.?\s?ft|square feet|sqft)/);
  if (sqftMatch) criteria.sqft = parseInt(sqftMatch[1], 10);

  const underSqft = t.match(/under\s*(\d{3,5})\s*(sq ?\.?\s?ft|square feet|sqft)?/);
  if (underSqft) criteria.sqftMax = parseInt(underSqft[1], 10);

  if (/\bone[- ]?story\b|\bsingle[- ]?story\b|\bsingle[- ]?level\b|\ball on one (floor|level)\b/.test(t)) {
    criteria.stories = 1;
  } else if (/\btwo[- ]?story\b|\bdouble[- ]?story\b/.test(t)) {
    criteria.stories = 2;
  }

  const budgetMatch = t.match(/\$?\s?(\d{2,3})\s?[,]?\s?(000|k)\b/);
  if (budgetMatch) {
    let n = parseInt(budgetMatch[1], 10);
    criteria.budgetMax = budgetMatch[2] === "k" || budgetMatch[2] === "000" ? n * 1000 : n;
  }
  const underBudget = t.match(/under\s*\$?\s?(\d{2,3})\s?[,]?\s?(000|k)?/);
  if (underBudget) {
    let n = parseInt(underBudget[1], 10);
    criteria.budgetMax = n < 1000 ? n * 1000 : n;
  }

  const garageMatch = t.match(/(\d)\s*[- ]?car\s*garage/);
  if (garageMatch) criteria.garage = parseInt(garageMatch[1], 10);

  criteria.styles = STYLES.filter((s) => t.includes(s));
  criteria.features = FEATURES.filter((f) => t.includes(f));

  if (/\bno garage\b/.test(t)) criteria.garage = 0;

  return criteria;
}

/* ---------------------------------------------------------
   MATCHING: score every plan against parsed criteria
--------------------------------------------------------- */
export function scorePlan(plan, criteria) {
  let score = 0;
  let possible = 0;
  const reasons = [];
  const misses = [];

  if (criteria.beds !== undefined) {
    possible += 2;
    if (plan.beds === criteria.beds) {
      score += 2;
      reasons.push(`${plan.beds} bedrooms, exactly what you asked for`);
    } else if (plan.beds === criteria.beds + 1) {
      score += 1;
      reasons.push(`${plan.beds} bedrooms — one more than requested`);
    } else if (plan.beds >= criteria.beds) {
      score += 0.5;
    } else {
      misses.push(`only ${plan.beds} bedrooms`);
    }
  }

  if (criteria.baths !== undefined) {
    possible += 1.5;
    if (plan.baths >= criteria.baths) {
      score += 1.5;
      if (plan.baths === criteria.baths) reasons.push(`${plan.baths} bathrooms as requested`);
    } else {
      misses.push(`only ${plan.baths} bathrooms`);
    }
  }

  if (criteria.stories !== undefined) {
    possible += 2;
    const planStories = Math.floor(plan.stories);
    if (planStories === criteria.stories) {
      score += 2;
      reasons.push(criteria.stories === 1 ? "single-story layout" : "two-story layout");
    } else {
      misses.push(`this one is ${plan.stories}-story`);
    }
  }

  if (criteria.sqftMax !== undefined) {
    possible += 1.5;
    if (plan.sqft <= criteria.sqftMax) {
      score += 1.5;
      reasons.push(`${plan.sqft.toLocaleString()} sq ft, under your ${criteria.sqftMax.toLocaleString()} sq ft cap`);
    } else {
      misses.push(`${plan.sqft.toLocaleString()} sq ft is over your cap`);
    }
  } else if (criteria.sqft !== undefined) {
    possible += 1.5;
    const diff = Math.abs(plan.sqft - criteria.sqft);
    if (diff <= 300) {
      score += 1.5;
      reasons.push(`${plan.sqft.toLocaleString()} sq ft, close to your target`);
    } else if (diff <= 600) {
      score += 0.75;
    }
  }

  if (criteria.budgetMax !== undefined) {
    possible += 2;
    if (plan.price <= criteria.budgetMax) {
      score += 2;
      reasons.push(`priced at $${plan.price.toLocaleString()}, within budget`);
    } else {
      misses.push(`priced above your budget at $${plan.price.toLocaleString()}`);
    }
  }

  if (criteria.garage !== undefined) {
    possible += 1;
    if (plan.garage >= criteria.garage) {
      score += 1;
      if (criteria.garage > 0) reasons.push(`${plan.garage}-car garage`);
    } else {
      misses.push(`only a ${plan.garage}-car garage`);
    }
  }

  if (criteria.styles && criteria.styles.length) {
    possible += 2;
    if (criteria.styles.includes(plan.style)) {
      score += 2;
      reasons.push(`${plan.style} style, matching your request`);
    }
  }

  if (criteria.features && criteria.features.length) {
    const matched = criteria.features.filter((f) => plan.tags.includes(f));
    possible += criteria.features.length;
    score += matched.length;
    matched.forEach((f) => reasons.push(`has ${f}`));
  }

  const pct = possible > 0 ? Math.round((score / possible) * 100) : 50;
  return { pct: Math.min(pct, 100), reasons, misses };
}
