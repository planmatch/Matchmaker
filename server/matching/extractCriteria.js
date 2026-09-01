// Business logic for turning a freeform home description into
// structured search criteria. Provider-agnostic — it only calls the
// AI abstraction in server/ai, never fetches a model API directly.
import { getProvider } from "../ai/index.js";

export const STYLES = [
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
export const FEATURES = [
  "porch",
  "open floor plan",
  "primary suite on main",
  "office",
  "basement",
  "vaulted ceilings",
];

export async function extractCriteria(text) {
  if (!text || typeof text !== "string") {
    throw new Error("text must be a non-empty string");
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

  const provider = getProvider();
  const raw = await provider.complete({ system, prompt: text, maxTokens: 1000 });
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const parsed = JSON.parse(cleaned);
  if (parsed.styles) parsed.styles = parsed.styles.filter((s) => STYLES.includes(s));
  if (parsed.features) parsed.features = parsed.features.filter((f) => FEATURES.includes(f));
  parsed.raw = text;

  return parsed;
}
