// Netlify function — reached at /.netlify/functions/match-copy,
// remapped to /api/match-copy by the redirect in netlify.toml.

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

  const system = `You write short, specific one-sentence explanations of why a house plan fits what someone asked for. Ground every sentence in real attributes of that plan — don't invent features it doesn't have. Keep each sentence under 22 words, plain and concrete, no marketing fluff. Respond with ONLY a JSON array of objects: [{"id": "<plan id>", "note": "<one sentence>"}, ...], one entry per plan given, no markdown fences.`;

  const userMsg = `Buyer's brief: "${description}"

Plans to explain:
${plans
  .map(
    (p) =>
      `- id: ${p.id}, name: ${p.name}, style: ${p.style}, beds: ${p.beds}, baths: ${p.baths}, sqft: ${p.sqft}, stories: ${p.stories}, garage: ${p.garage}, price: $${p.price}, features: ${p.features.join(", ")}, match score: ${p.pct}%`
  )
  .join("\n")}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: userMsg }],
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

    const list = JSON.parse(raw);
    const notes = {};
    list.forEach((item) => {
      if (item && item.id) notes[item.id] = item.note;
    });

    return { statusCode: 200, body: JSON.stringify({ notes }) };
  } catch (err) {
    console.error("match-copy error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate match copy" }) };
  }
}
