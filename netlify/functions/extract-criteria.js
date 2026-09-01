// Netlify function — reached at /.netlify/functions/extract-criteria,
// and remapped to /api/extract-criteria by the redirect in netlify.toml
// so the frontend code doesn't need to know which platform it's on.
// Thin HTTP adapter over server/matching/extractCriteria.js — see the
// comment in api/extract-criteria.js (the Vercel equivalent) for why
// the actual logic lives outside both platform-specific handlers.
import { extractCriteria } from "../../server/matching/extractCriteria.js";
import { AIProviderError } from "../../server/ai/errors.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let text;
  try {
    ({ text } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }
  if (!text || typeof text !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing 'text' in request body" }) };
  }

  try {
    const criteria = await extractCriteria(text);
    return { statusCode: 200, body: JSON.stringify({ criteria }) };
  } catch (err) {
    if (err instanceof AIProviderError) {
      console.error(`${err.provider} API error:`, err.status, err.body);
      return { statusCode: 502, body: JSON.stringify({ error: "Upstream model call failed" }) };
    }
    console.error("extract-criteria error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract criteria" }) };
  }
}
