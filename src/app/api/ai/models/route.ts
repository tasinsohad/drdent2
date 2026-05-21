import { NextRequest, NextResponse } from "next/server";
import { fetchModels } from "@/lib/ai/models";
import type { ProviderType } from "@/lib/ai/providers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { provider, api_key, base_url } = body;

  if (!provider || !api_key) {
    return NextResponse.json(
      { error: "Provider and API key are required" },
      { status: 400 }
    );
  }

  try {
    const models = await fetchModels(
      provider as ProviderType,
      api_key,
      base_url
    );
    return NextResponse.json({ models });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch models" },
      { status: 500 }
    );
  }
}
