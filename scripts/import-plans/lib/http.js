// Polite HTTP fetch for the import pipeline: identifies itself, retries
// transient failures, and waits between requests so we don't hammer a
// provider's site while crawling their full catalog.
const UA =
  "Mozilla/5.0 (compatible; PlanMatchImporter/1.0; +https://planmatch.dev)";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchText(url, { retries = 2, delayMs = 350 } = {}) {
  await sleep(delayMs);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) {
        console.warn(`  ! giving up on ${url}: ${err.message}`);
        return null;
      }
      await sleep(500 * (attempt + 1));
    }
  }
  return null;
}
