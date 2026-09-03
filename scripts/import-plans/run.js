// Orchestrator for the plan-import pipeline. Runs every registered
// provider's fetchCatalog(), merges the results, and writes the
// combined catalog to src/data/plans.generated.json — which
// src/data/plans.js imports and re-exports as PLANS (with STYLES
// derived from whatever styles actually came back).
//
// Run with: npm run import-plans
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PROVIDERS } from "./providers/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "..", "src", "data", "plans.generated.json");

async function main() {
  const allPlans = [];
  for (const provider of PROVIDERS) {
    console.log(`\n=== ${provider.name} ===`);
    try {
      const plans = await provider.fetchCatalog();
      console.log(`${provider.name}: imported ${plans.length} plans`);
      allPlans.push(...plans);
    } catch (err) {
      console.error(`${provider.name} failed:`, err);
    }
  }

  const seen = new Set();
  const deduped = allPlans.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  deduped.sort((a, b) => a.style.localeCompare(b.style) || a.name.localeCompare(b.name));

  fs.writeFileSync(OUT_PATH, JSON.stringify(deduped, null, 2) + "\n");
  console.log(`\nWrote ${deduped.length} plans to ${path.relative(process.cwd(), OUT_PATH)}`);
}

main();
