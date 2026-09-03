// Advanced House Plans provider adapter — implements the provider
// contract described in scripts/import-plans/providers/index.js.
import * as cheerio from "cheerio";
import { fetchText } from "../lib/http.js";
import { extractTags, stripHtml, firstSentences } from "../lib/tags.js";

const AFFILIATE_CODE = "6a988b5ac89e5";

// The site's full "Browse Styles" list (advancedhouseplans.com/styles).
// Each maps to a /collections/{slug}-house-plans page. Unknown/renamed
// styles just 404 harmlessly and are skipped.
const STYLE_NAMES = [
  "Acadian",
  "Adobe",
  "Barndominium",
  "Beach-Lake",
  "Bermuda",
  "Bungalow",
  "Cape Cod",
  "Coastal",
  "Colonial",
  "Contemporary",
  "Contemporary Farmhouse",
  "Cottage",
  "Country",
  "Craftsman",
  "European",
  "Farmhouse",
  "Florida",
  "French Country",
  "Georgian",
  "Hill Country",
  "Mediterranean",
  "Mid Century Modern",
  "Modern",
  "Modern Cottage",
  "Modern Farmhouse",
  "Modern Mountain",
  "Modern Prairie",
  "Mountain",
  "New American",
  "Prairie",
  "Rustic",
  "Southern",
  "Southwest",
  "Spanish",
  "Texas Hillside",
  "Traditional",
  "Transitional",
  "Tudor",
  "Tuscan",
  "Vacation",
  "Victorian",
];

function slugifyStyle(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function collectSlugsForStyle(styleSlug) {
  const slugs = new Set();
  for (let page = 1; page <= 10; page++) {
    const url =
      page === 1
        ? `https://advancedhouseplans.com/collections/${styleSlug}-house-plans`
        : `https://advancedhouseplans.com/collections/${styleSlug}-house-plans?page=${page}`;
    const html = await fetchText(url);
    if (!html) break;
    const found = [...html.matchAll(/\/plan\/([a-z0-9-]+)/gi)].map((m) => m[1]);
    const before = slugs.size;
    found.forEach((s) => slugs.add(s));
    if (slugs.size === before) break;
  }
  return [...slugs];
}

function extractSpecTable($) {
  const specs = {};
  $("#constructionSpecs table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length === 2) {
      const label = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      specs[label] = value;
    }
  });
  return specs;
}

async function fetchPlan(slug, style) {
  const url = `https://advancedhouseplans.com/plan/${slug}`;
  const html = await fetchText(url);
  if (!html) return null;
  const $ = cheerio.load(html);

  const ldJsonRaw = $('script[type="application/ld+json"]').first().html();
  let ld = null;
  try {
    ld = ldJsonRaw ? JSON.parse(ldJsonRaw) : null;
  } catch {
    ld = null;
  }
  if (!ld || !ld.name || !ld.offers?.price) return null;

  const specs = extractSpecTable($);
  const beds = parseFloat(specs["Bedrooms"]);
  const baths = parseFloat(specs["Bathrooms"]);
  const garage = parseFloat(specs["Garage Bays"]) || 0;
  const sqftMatch = (specs["Total Finished Area"] || "").match(/[\d,]+/);
  const sqft = sqftMatch ? parseInt(sqftMatch[0].replace(/,/g, ""), 10) : null;
  const stories = "Second Level" in specs || "Upper Level" in specs ? 2 : 1;

  if (!Number.isFinite(beds) || !Number.isFinite(baths) || !sqft) return null;

  const bodyText = stripHtml(ld.description || "");

  return {
    id: `AHP-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
    name: ld.name,
    style,
    beds,
    baths,
    sqft,
    stories,
    garage,
    price: Number(ld.offers.price),
    priceNote: "plan set",
    tags: extractTags(bodyText),
    blurb: firstSentences(ld.description) || `A ${sqft.toLocaleString()} sq ft ${style} plan.`,
    provider: "Advanced House Plans",
    providerUrl: `https://advancedhouseplans.com/plan/${slug}?a=${AFFILIATE_CODE}`,
  };
}

export const advancedHousePlansProvider = {
  name: "Advanced House Plans",
  async fetchCatalog() {
    const bySlug = new Map(); // slug -> { style } — first collection a plan appears in wins
    for (const styleName of STYLE_NAMES) {
      const styleSlug = slugifyStyle(styleName);
      const style = styleName.toLowerCase();
      const slugs = await collectSlugsForStyle(styleSlug);
      if (slugs.length) console.log(`AHP ${styleName}: found ${slugs.length} plan slugs`);
      for (const slug of slugs) {
        if (!bySlug.has(slug)) bySlug.set(slug, style);
      }
    }
    console.log(`AHP: ${bySlug.size} unique plans across ${STYLE_NAMES.length} style pages`);

    const plans = [];
    for (const [slug, style] of bySlug) {
      const plan = await fetchPlan(slug, style);
      if (plan) {
        plans.push(plan);
        console.log(`  + ${plan.name} (${style})`);
      } else {
        console.warn(`  ! skipped ${slug} (couldn't parse required fields)`);
      }
    }
    return plans;
  },
};
