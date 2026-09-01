// Provider implementation for OpenAI's Chat Completions API — and, by
// extension, anything that speaks the same wire format. Most
// self-hosted open-source model servers (Ollama, vLLM, LM Studio,
// text-generation-webui) and several other commercial APIs (Groq,
// Together, Fireworks, Azure OpenAI) expose an OpenAI-compatible
// endpoint, so pointing OPENAI_BASE_URL at one of those is enough to
// run this app on a completely different model with zero code changes.
import { AIProviderError } from "../errors.js";

export const openaiProvider = {
  name: "openai",

  async complete({ system, prompt, maxTokens = 1000 }) {
    const apiKey = process.env.OPENAI_API_KEY;
    // Self-hosted runtimes (e.g. a local Ollama server) often don't
    // require a key at all, so this isn't a hard requirement here.
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AIProviderError("openai", response.status, errText);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  },
};
