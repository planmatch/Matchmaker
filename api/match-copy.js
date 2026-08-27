// Vercel serverless function — auto-detected at /api/match-copy.

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
      res.status(502).json({ error: "Upstream model call failed" });
      return;
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

    res.status(200).json({ notes });
  } catch (err) {
    console.error("match-copy error:", err);
    res.status(500).json({ error: "Failed to generate match copy" });
  }
}
