export type ProviderType = "openai" | "openrouter" | "anthropic" | "gemini" | "custom";

export interface ProviderConfig {
  name: string;
  defaultBaseUrl: string;
  modelsEndpoint: string;
  requiresBaseUrl: boolean;
}

export const PROVIDERS: Record<ProviderType, ProviderConfig> = {
  openai: {
    name: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    modelsEndpoint: "/models",
    requiresBaseUrl: false,
  },
  openrouter: {
    name: "OpenRouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    modelsEndpoint: "/models",
    requiresBaseUrl: false,
  },
  anthropic: {
    name: "Anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    modelsEndpoint: "/v1/models",
    requiresBaseUrl: false,
  },
  gemini: {
    name: "Google Gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelsEndpoint: "/models",
    requiresBaseUrl: false,
  },
  custom: {
    name: "Custom",
    defaultBaseUrl: "",
    modelsEndpoint: "/models",
    requiresBaseUrl: true,
  },
};

export function getProviderBaseUrl(provider: ProviderType): string {
  return PROVIDERS[provider].defaultBaseUrl;
}
