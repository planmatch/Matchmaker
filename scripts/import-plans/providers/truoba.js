// Truoba provider adapter — implements the provider contract described
// in scripts/import-plans/providers/index.js. Truoba is a WooCommerce
// (WordPress) storefront selling modern/contemporary plan sets only.
import * as cheerio from "cheerio";
import { fetchText } from "../lib/http.js";
import { extractTags, stripHtml, firstSentences } from "../lib/tags.js";

const BASE = "https://www.truoba.com/house-plans/";
const REF = "?ref=609";

async function collectSlugs() {
  const slugs = new Set();
  for (let page = 1; page <= 12; page++) {
    const url = page === 1 ? BASE : `${BASE}page/${page}/`;
    const html = await fetchText(url);
    if (!html) break;
    const found = [...html.matchAll(/house-plans\/([a-z0-9-]+)\/"/gi)]
      .map((m) => m[1])
      .filter((s) => !["page", "feed"].includes(s) && !s.startsWith("page"));
    const before = slugs.size;
    found.forEach((s) => slugs.add(s));
    if (slugs.size === before) break; // no new plans on this page — done
  }
  return [...slugs];
}

function extractPrice($) {
  const raw = $('form.variations_form').attr("data-product_variations");
  if (raw) {
    try {
      const variations = JSON.parse(raw);
      const pdf = variations.find((v) => v.attributes?.attribute_pa_type2 === "pdf-plan-set");
      const chosen = pdf || variations[0];
      if (chosen) return Number(chosen.display_regular_price ?? chosen.display_price);
    } catch {
      // fall through to visible-price fallback below
    }
  }
  const visible = $(".summary .price .woocommerce-Price-amount").first().text();
  const n = parseFloat(visible.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function extractGarage(bodyText) {
  const m = bodyText.match(/Garage area:\s*([\d,]+)\s*sq\.?\s*ft/i);
  if (!m) return 0;
  const area = parseInt(m[1].replace(/,/g, ""), 10);
  return area >= 350 ? 2 : 1;
}

function extractStories(bodyText, title) {
  const combined = `${title} ${bodyText}`;
  if (/\b2[\s-]?floor|\btwo[\s-]?stor(y|ies)\b|\bsecond\s*(floor|level)\b/i.test(combined)) return 2;
  return 1;
}

async function fetchPlan(slug) {
  const url = `${BASE}${slug}/`;
  const html = await fetchText(url);
  if (!html) return null;
  const $ = cheerio.load(html);

  const name = $(".product_title").first().text().trim();
  if (!name) return null;

  const summaryText = $(".product-short-description h4").first().text().replace(/\s+/g, " ").trim();
  const specMatch = summaryText.match(/([\d.]+)\s*sq\/ft.*?([\d.]+)\s*Bed.*?([\d.]+)\s*Bath/i);
  if (!specMatch) return null;
  const sqft = Math.round(parseFloat(specMatch[1]));
  const beds = parseFloat(specMatch[2]);
  const baths = parseFloat(specMatch[3]);

  const price = extractPrice($);
  if (!price) return null;

  const bodyText = stripHtml($("body").html() || "");
  const title = $("title").text();
  const firstParagraph = $("#tab-plan-description p.thin-font").first().text().trim();
  const descriptionHtml = firstParagraph || $("#tab-plan-description").text() || "";

  return {
    id: `TRUOBA-${slug.toUpperCase()}`,
    name,
    style: "modern",
    beds,
    baths,
    sqft,
    stories: extractStories(bodyText, title),
    garage: extractGarage(bodyText),
    price,
    priceNote: "plan set",
    tags: extractTags(bodyText),
    blurb: firstSentences(descriptionHtml) || `A ${sqft.toLocaleString()} sq ft modern plan from Truoba.`,
    provider: "Truoba",
    providerUrl: `${BASE}${slug}/${REF}`,
  };
}

export const truobaProvider = {
  name: "Truoba",
  async fetchCatalog() {
    const slugs = await collectSlugs();
    console.log(`Truoba: found ${slugs.length} plan slugs`);
    const plans = [];
    for (const slug of slugs) {
      const plan = await fetchPlan(slug);
      if (plan) {
        plans.push(plan);
        console.log(`  + ${plan.name}`);
      } else {
        console.warn(`  ! skipped ${slug} (couldn't parse required fields)`);
      }
    }
    return plans;
  },
};
