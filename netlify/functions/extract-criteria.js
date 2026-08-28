// Netlify function — reached at /.netlify/functions/extract-criteria,
// and remapped to /api/extract-criteria by the redirect in netlify.toml
// so the frontend code doesn't need to know which platform it's on.
// Set ANTHROPIC_API_KEY in Netlify's Site settings > Environment variables.

const STYLES = [
  "farmhouse",
  "craftsman",
  "modern",
  "ranch",
  "colonial",
  "cabin",
  "cottage",
  "mediterranean",
  "contemporary",
];
const FEATURES = [
  "porch",
  "open floor plan",
  "primary suite on main",
  "office",
  "basement",
  "vaulted ceilings",
];

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

  const system = `You read a short description of someone's dream house and extract structured search criteria as JSON. Only include a field if the text actually implies it — never guess a default.

Fields (all optional):
- beds: integer
- baths: number
- sqft: integer (a target square footage, if a single number is implied)
- sqftMax: integer (an upper limit, e.g. "under 2000 sqft" or "small")
- budgetMax: integer in dollars (e.g. "under $250k" -> 250000)
- stories: 1 or 2
- garage: integer (car capacity; 0 if explicitly no garage wanted)
- styles: array, only using values from this exact list: ${STYLES.join(", ")}
- features: array, only using values from this exact list: ${FEATURES.join(", ")}

Infer sensible values from vague, non-technical language (e.g. "cozy for a growing family" might imply 3-4 beds and an open floor plan; "starter home" might imply a lower budgetMax and smaller sqftMax; "empty nesters" might imply 1 story and 2-3 beds). Respond with ONLY the JSON object, no markdown fences, no commentary.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-workspace-id": "wrkspc_014ibFRQ5RptfwEgHXeKx56Y",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return { statusCode: 502, body: JSON.stringify({ error: "Upstream model call failed" }) };
    }

    const data = await response.json();
    const raw = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed = JSON.parse(raw);
    if (parsed.styles) parsed.styles = parsed.styles.filter((s) => STYLES.includes(s));
    if (parsed.features) parsed.features = parsed.features.filter((f) => FEATURES.includes(f));
    parsed.raw = text;

    return { statusCode: 200, body: JSON.stringify({ criteria: parsed }) };
  } catch (err) {
    console.error("extract-criteria error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract criteria" }) };
  }
}
