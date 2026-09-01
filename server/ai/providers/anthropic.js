// Provider implementation for Anthropic's Messages API.
// Implements the single-method provider contract described in
// server/ai/index.js — nothing outside this file knows about
// Anthropic's request/response shape, headers, or model naming.
import { AIProviderError } from "../errors.js";

export const anthropicProvider = {
  name: "anthropic",

  async complete({ system, prompt, maxTokens = 1000 }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
    // Required only for identity-linked API keys tied to an org with
    // multiple workspaces; harmless to omit for workspace-scoped keys.
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID || "wrkspc_014ibFRQ5RptfwEgHXeKx56Y";
    if (workspaceId) headers["anthropic-workspace-id"] = workspaceId;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AIProviderError("anthropic", response.status, errText);
    }

    const data = await response.json();
    return (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("");
  },
};
