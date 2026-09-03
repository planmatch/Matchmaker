# PlanMatch (planmatch.dev)

An AI house plan matchmaker — a Vite + React app that matches free-text home descriptions to
house plans, using an LLM for criteria extraction and personalized match explanations. Ships
ready to deploy to either **Vercel** or **Netlify** — pick one, the code doesn't change either
way.

## How it's structured

```
src/               React frontend
  App.jsx          Main UI (landing + results)
  data/plans.js     Loads data/plans.generated.json and derives STYLES from it
  data/plans.generated.json  The actual catalog (904 plans) — generated, don't hand-edit
  lib/matching.js   Regex fallback parser + rule-based scoring
  lib/apiClient.js  Calls OUR OWN backend at /api/* (never calls a model API directly)

scripts/import-plans/  Crawls every registered affiliate site's full catalog and writes
                    src/data/plans.generated.json — see "Growing the plan catalog" below
  providers/index.js     Registry — the only file that lists which providers are active
  providers/truoba.js, advancedHousePlans.js
                    One file per site, each implementing fetchCatalog(): Promise<Plan[]>
  lib/http.js       Polite fetch (retries, delay) shared by every provider
  lib/tags.js       Shared "must-haves" tag detection + HTML-to-text helpers
  run.js            Orchestrator — run via `npm run import-plans`

server/            Platform-agnostic backend logic (imported by both api/ and netlify/functions/)
  ai/index.js       Provider registry + getProvider() — the only thing business logic calls
  ai/providers/     One file per AI provider (anthropic.js, openai.js), each implementing
                    the same complete({system, prompt, maxTokens}) contract
  matching/         extractCriteria.js and matchCopy.js — prompts + JSON parsing, provider-agnostic

api/               Vercel serverless functions (auto-detected, zero config) — thin HTTP
                    adapters over server/matching/*
  extract-criteria.js
  match-copy.js

netlify/functions/ Same two functions, adapted to Netlify's handler signature, calling the
                    same server/matching/* logic
netlify.toml       Redirects /api/* -> /.netlify/functions/* so the frontend
                    code is identical on both platforms
```

**Why a backend at all?** The model API key can't live in browser code — anyone could open
dev tools and steal it. Both serverless functions read provider credentials from environment
variables that only exist server-side.

**Swapping the AI provider.** Business logic in `server/matching/` never calls Claude, GPT, or
any model API directly — it only calls `getProvider().complete(...)` from `server/ai/index.js`.
To switch models, set `AI_PROVIDER` (and that provider's own env vars — see `.env.example`) and
redeploy; no application code changes. `anthropic` and `openai` ship out of the box, and the
`openai` provider works with any self-hosted runtime that speaks the same wire format (Ollama,
vLLM, LM Studio, etc.) by pointing `OPENAI_BASE_URL` at it. Adding a new provider means adding
one file to `server/ai/providers/` that implements `complete()` and registering it in
`server/ai/index.js` — nothing else in the app changes.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your real provider credentials
```

To run locally with working `/api` calls, use whichever platform's CLI you plan to deploy to:

```bash
# Vercel
npm install -g vercel
vercel dev

# Netlify
npm install -g netlify-cli
netlify dev
```

(Plain `npm run dev` also works for UI-only changes, but `/api` calls will fail since Vite alone
doesn't run serverless functions.)

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects the Vite build and the `/api` folder — no config needed.
4. In **Project Settings → Environment Variables**, add the env vars for whichever provider
   you're using (e.g. `ANTHROPIC_API_KEY` — see `.env.example` for the full list per provider).
5. Deploy. Your `/api/extract-criteria` and `/api/match-copy` endpoints go live automatically.
6. In **Project Settings → Domains**, add `planmatch.dev` (if you registered it through Vercel,
   nameservers are already pointed there — this step is instant).

## Deploying to Netlify

1. Push this repo to GitHub.
2. Go to [app.netlify.com/start](https://app.netlify.com/start) and import the repo.
3. Netlify reads `netlify.toml` automatically — build command and functions folder are already
   configured.
4. In **Site settings → Environment variables**, add the env vars for whichever provider you're
   using (see `.env.example`).
5. Deploy. The `/api/*` redirect routes to your functions automatically.

## Growing the plan catalog

Every plan in the catalog is real and links to its own actual detail page — there's no sample
data. `npm run import-plans` crawls each registered provider's full site and regenerates
`src/data/plans.generated.json`; `src/data/plans.js` just loads that file and derives the style
filter chips (`STYLES`) from whatever styles actually came back, so a provider's categories show
up automatically with no list to hand-maintain.

**Adding a future affiliate site** — this is the part designed to stay cheap as more providers
show up:

1. Create `scripts/import-plans/providers/<site>.js` implementing the contract documented in
   `providers/index.js`: `{ name, async fetchCatalog() }`, returning plans already normalized to
   the common shape (`id, name, style, beds, baths, sqft, stories, garage, price, priceNote?,
   tags, blurb, provider, providerUrl`) with that site's own tracking code baked into
   `providerUrl`.
2. Add it to the `PROVIDERS` array in `providers/index.js`.
3. Run `npm run import-plans` and commit the regenerated `plans.generated.json`.

Nothing else changes — `src/App.jsx` renders the results card's provider button generically off
`plan.provider` / `plan.providerUrl`, and `STYLES` is derived, not hardcoded.

Two providers are wired up today: **Truoba** (WooCommerce; crawls `truoba.com/house-plans/` and
all its pagination) and **Advanced House Plans** (crawls every style collection listed on
`advancedhouseplans.com/styles`, reading each plan's JSON-LD + specs table). Both adapters use
best-effort heuristics for anything a site doesn't expose in a structured field (e.g. story count
from page text when there's no explicit floor breakdown) — spot-check a sample after importing
from a new site before trusting it blindly.

## Before real users hit this

See the legal pages under `public/` — the Privacy Policy discloses that description text is
sent to the active AI provider, and the FTC short-form disclosure sits directly above the plan
links on the results page, since both providers' referral links (Truoba's `?ref=609`, Advanced
House Plans' `?a=...`) are live tracking.
