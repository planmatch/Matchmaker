// Vercel serverless function — auto-detected at /api/extract-criteria
// because it lives in /api. This is a thin HTTP adapter: all the real
// logic (prompting, parsing) lives in server/matching/extractCriteria.js,
// and which AI provider actually runs it is chosen in server/ai — this
// file has no idea whether that's Claude, GPT, or a self-hosted model.
import { extractCriteria } from "../server/matching/extractCriteria.js";
import { AIProviderError } from "../server/ai/errors.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }

  try {
    const criteria = await extractCriteria(text);
    res.status(200).json({ criteria });
  } catch (err) {
    if (err instanceof AIProviderError) {
      console.error(`${err.provider} API error:`, err.status, err.body);
      res.status(502).json({ error: "Upstream model call failed" });
      return;
    }
    console.error("extract-criteria error:", err);
    res.status(500).json({ error: "Failed to extract criteria" });
  }
}
