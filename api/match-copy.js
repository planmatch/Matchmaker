// Vercel serverless function — auto-detected at /api/match-copy.
// Thin HTTP adapter over server/matching/matchCopy.js — see the
// comment in api/extract-criteria.js for why the split exists.
import { generateMatchCopy } from "../server/matching/matchCopy.js";
import { AIProviderError } from "../server/ai/errors.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { description, plans } = req.body || {};
  if (!description || !Array.isArray(plans) || plans.length === 0) {
    res.status(400).json({ error: "Missing 'description' or 'plans' in request body" });
    return;
  }

  try {
    const notes = await generateMatchCopy(description, plans);
    res.status(200).json({ notes });
  } catch (err) {
    if (err instanceof AIProviderError) {
      console.error(`${err.provider} API error:`, err.status, err.body);
      res.status(502).json({ error: "Upstream model call failed" });
      return;
    }
    console.error("match-copy error:", err);
    res.status(500).json({ error: "Failed to generate match copy" });
  }
}
