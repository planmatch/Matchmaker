// Thrown by any provider when the upstream model call itself fails
// (non-2xx response, network error). Callers can catch this one type
// regardless of which provider is active and map it to a 502, without
// needing to know anything provider-specific.
export class AIProviderError extends Error {
  constructor(provider, status, body) {
    super(`${provider} API error (${status})`);
    this.name = "AIProviderError";
    this.provider = provider;
    this.status = status;
    this.body = body;
  }
}
