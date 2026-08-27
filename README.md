# PlanMatch (planmatch.dev)

An AI house plan matchmaker — a Vite + React app that matches free-text home descriptions to
house plans, using Claude for criteria extraction and personalized match explanations. Ships
ready to deploy to either **Vercel** or **Netlify** — pick one, the code doesn't change either
way.

## How it's structured

```
src/               React frontend
  App.jsx          Main UI (landing + results)
  data/plans.js     Sample plan catalog + Cool House Plans / Allison Ramsey link maps
  lib/matching.js   Regex fallback parser + rule-based scoring
  lib/apiClient.js  Calls OUR OWN backend at /api/* (never calls Anthropic directly)

api/               Vercel serverless functions (auto-detected, zero config)
  extract-criteria.js
  match-copy.js

netlify/functions/ Same two functions, adapted to Netlify's handler signature
netlify.toml       Redirects /api/* -> /.netlify/functions/* so the frontend
                    code is identical on both platforms
```

**Why a backend at all?** The Claude API key can't live in browser code — anyone could open
dev tools and steal it. Both serverless functions read `ANTHROPIC_API_KEY` from an environment
variable that only exists server-side.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your real ANTHROPIC_API_KEY
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
4. In **Project Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with your real key.
5. Deploy. Your `/api/extract-criteria` and `/api/match-copy` endpoints go live automatically.
6. In **Project Settings → Domains**, add `planmatch.dev` (if you registered it through Vercel,
   nameservers are already pointed there — this step is instant).

## Deploying to Netlify

1. Push this repo to GitHub.
2. Go to [app.netlify.com/start](https://app.netlify.com/start) and import the repo.
3. Netlify reads `netlify.toml` automatically — build command and functions folder are already
   configured.
4. In **Site settings → Environment variables**, add `ANTHROPIC_API_KEY` with your real key.
5. Deploy. The `/api/*` redirect routes to your functions automatically.

## Before real users hit this

See the project's legal drafts (`privacy-policy.md`, `terms-of-service.md`,
`affiliate-disclosure.md`) — the Privacy Policy needs to disclose that description text is sent
to Anthropic's API, and the FTC disclosure needs to sit near the plan links once affiliate
tracking is live for Cool House Plans and/or Allison Ramsey Architects.

The plan catalog in `src/data/plans.js` is sample data — swap in a real feed before launch.
