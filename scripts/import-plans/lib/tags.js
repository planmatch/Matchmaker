// Shared feature-tag detection, so every provider's plans use the same
// vocabulary as the app's "must-haves" chips (src/data/plans.js FEATURES).
const FEATURE_PATTERNS = [
  ["porch", /\bporch(es)?\b|\bveranda\b|\blanai\b/i],
  ["open floor plan", /open[\s-]?(floor\s*plan|concept|layout)/i],
  [
    "primary suite on main",
    /main[\s-]?(floor|level)\s*(master|primary)|master\s*(bedroom|suite)\s*(on|linked to)\s*(the\s*)?(main|porch)/i,
  ],
  ["office", /\bhome\s*office\b|\bden\b|\bstudy\b|\bstudy\s*room\b/i],
  ["basement", /\bbasement\b/i],
  ["vaulted ceilings", /vaulted\s*ceiling|cathedral\s*ceiling/i],
];

export function extractTags(text) {
  const tags = [];
  for (const [tag, pattern] of FEATURE_PATTERNS) {
    if (pattern.test(text)) tags.push(tag);
  }
  return tags;
}

export function stripHtml(html) {
  return html
    // Some sources (e.g. AHP's JSON-LD) HTML-escape their markup, so the
    // "tags" are literally the text &lt;p&gt; — decode those before
    // stripping real tags, then decode the remaining entities last.
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#0?39;|&rsquo;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function firstSentences(text, maxLen = 220) {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf(". ");
  return (lastPeriod > 60 ? cut.slice(0, lastPeriod + 1) : cut).trim();
}
