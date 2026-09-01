// Business logic for generating a short, grounded explanation of why
// each shortlisted plan fits the buyer's brief. Provider-agnostic —
// only calls the AI abstraction in server/ai, never a model API directly.
import { getProvider } from "../ai/index.js";

export async function generateMatchCopy(description, plans) {
  if (!description || !Array.isArray(plans) || plans.length === 0) {
    throw new Error("description and a non-empty plans array are required");
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

  const provider = getProvider();
  const raw = await provider.complete({ system, prompt: userMsg, maxTokens: 1000 });
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const list = JSON.parse(cleaned);
  const notes = {};
  list.forEach((item) => {
    if (item && item.id) notes[item.id] = item.note;
  });

  return notes;
}
