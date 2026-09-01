// Netlify function — reached at /.netlify/functions/match-copy,
// remapped to /api/match-copy by the redirect in netlify.toml.
// Thin HTTP adapter over server/matching/matchCopy.js.
import { generateMatchCopy } from "../../server/matching/matchCopy.js";
import { AIProviderError } from "../../server/ai/errors.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let description, plans;
  try {
    ({ description, plans } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }
  if (!description || !Array.isArray(plans) || plans.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'description' or 'plans' in request body" }),
    };
  }

  try {
    const notes = await generateMatchCopy(description, plans);
    return { statusCode: 200, body: JSON.stringify({ notes }) };
  } catch (err) {
    if (err instanceof AIProviderError) {
      console.error(`${err.provider} API error:`, err.status, err.body);
      return { statusCode: 502, body: JSON.stringify({ error: "Upstream model call failed" }) };
    }
    console.error("match-copy error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate match copy" }) };
  }
}
