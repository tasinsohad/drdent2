import OpenAI from "openai";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ProviderType } from "./providers";
import { getProviderBaseUrl } from "./providers";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function getAISettings() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("ai_settings")
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("AI settings not configured");
  }

  return data;
}

export async function getAIResponse(userMessages: AIMessage[]): Promise<string> {
  const settings = await getAISettings();

  const baseUrl = settings.base_url || getProviderBaseUrl(settings.provider as ProviderType);

  const openai = new OpenAI({
    apiKey: settings.api_key,
    baseURL: baseUrl,
  });

  const messages: AIMessage[] = [
    { role: "system", content: settings.system_prompt },
    ...userMessages,
  ];

  const completion = await openai.chat.completions.create({
    model: settings.model,
    messages,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
