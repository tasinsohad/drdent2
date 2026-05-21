import OpenAI from "openai";
import { getProviderBaseUrl } from "./providers";
import type { ProviderType } from "./providers";

export interface ModelInfo {
  id: string;
  name?: string;
}

export async function fetchModels(
  provider: ProviderType,
  apiKey: string,
  baseUrl?: string
): Promise<ModelInfo[]> {
  const url = baseUrl || getProviderBaseUrl(provider);

  const openai = new OpenAI({
    apiKey,
    baseURL: url,
  });

  const response = await openai.models.list();
  return response.data.map((model) => ({
    id: model.id,
    name: model.id,
  }));
}
