// Plan-import provider registry.
//
// Every provider module implements the same contract:
//
//   name: string
//   async fetchCatalog(): Promise<Plan[]>
//
// fetchCatalog() crawls that provider's site and returns fully
// normalized plan objects — {id, name, style, beds, baths, sqft,
// stories, garage, price, priceNote?, tags, blurb, provider,
// providerUrl} — matching the app's common schema exactly. Nothing
// outside a provider's own file knows about its site structure, its
// category taxonomy, or its affiliate tracking parameter.
//
// To add a future affiliate site: create providers/<site>.js
// implementing this contract, add it to PROVIDERS below, and rerun
// `npm run import-plans`. No other file in the app needs to change —
// src/data/plans.js and the UI already treat `provider`/`providerUrl`
// generically.
import { truobaProvider } from "./truoba.js";
import { advancedHousePlansProvider } from "./advancedHousePlans.js";

export const PROVIDERS = [truobaProvider, advancedHousePlansProvider];
