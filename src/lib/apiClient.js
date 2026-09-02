/* ---------------------------------------------------------
   Client-side calls to OUR OWN backend (api/*.js or
   netlify/functions/*.js), which hold the real Anthropic
   API key server-side. The browser never sees the key.
--------------------------------------------------------- */

export async function extractCriteriaWithLLM(text) {
  const response = await fetch("/api/extract-criteria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("extract failed");
  const data = await response.json();
  return data.criteria;
}

export async function generateMatchCopy(description, topScored) {
  const response = await fetch("/api/match-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description,
      plans: topScored.map(({ plan, pct }) => ({
        id: plan.id,
        name: plan.name,
        style: plan.style,
        beds: plan.beds,
        baths: plan.baths,
        sqft: plan.sqft,
        stories: plan.stories,
        garage: plan.garage,
        price: plan.price,
        priceNote: plan.priceNote,
        features: plan.tags,
        pct,
      })),
    }),
  });
  if (!response.ok) throw new Error("copy failed");
  const data = await response.json();
  return data.notes;
}
