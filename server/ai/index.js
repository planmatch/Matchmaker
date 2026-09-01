// Provider-independent AI abstraction.
//
// Every provider implements the same one-method contract:
//
//   complete({ system, prompt, maxTokens }) -> Promise<string>
//
// `system` is the instruction/persona text, `prompt` is the user
// content, and the return value is the model's raw text response —
// no provider-specific request shape, headers, or response parsing
// ever leaks past this boundary. Business logic (server/matching/*)
// only ever talks to this interface, never to a provider file
// directly, so swapping models is a config change, not a rewrite.
//
// Select the active provider with the AI_PROVIDER env var (defaults
// to "anthropic"). Each provider reads its own credentials/config
// from its own env vars — see .env.example.
import { anthropicProvider } from "./providers/anthropic.js";
import { openaiProvider } from "./providers/openai.js";

const PROVIDERS = {
  anthropic: anthropicProvider,
  // Also covers self-hosted open-source runtimes that speak the same
  // OpenAI-compatible wire format (Ollama, vLLM, LM Studio, etc.) —
  // point OPENAI_BASE_URL at them instead of api.openai.com.
  openai: openaiProvider,
};

export function getProvider() {
  const name = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`Unknown AI_PROVIDER "${name}". Available: ${Object.keys(PROVIDERS).join(", ")}`);
  }
  return provider;
}
