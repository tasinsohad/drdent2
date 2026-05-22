import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabaseServer();

  const { data: aiSettings, error: aiError } = await supabase
    .from("ai_settings")
    .select("*")
    .single();

  const { data: dashboardSettings } = await supabase
    .from("dashboard_settings")
    .select("password_hash")
    .single();

  const { data: whatsappSettings, error: whatsappError } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .single();

  if (aiError) console.error("ai_settings error:", aiError);
  if (whatsappError) console.error("whatsapp_settings error:", whatsappError);

  const maskedKey = aiSettings?.api_key
    ? aiSettings.api_key.slice(0, 8) + "..." + aiSettings.api_key.slice(-4)
    : "";

  const maskedToken = whatsappSettings?.access_token
    ? "••••••••" + whatsappSettings.access_token.slice(-4)
    : "";

  return NextResponse.json({
    ai: {
      ...aiSettings,
      api_key: maskedKey,
    },
    dashboard: {
      has_password: !!dashboardSettings?.password_hash,
    },
    whatsapp: {
      phone_number_id: whatsappSettings?.phone_number_id || "",
      access_token_masked: maskedToken,
      webhook_verify_token: whatsappSettings?.webhook_verify_token || "",
      connected: whatsappSettings?.connected || false,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const supabase = getSupabaseServer();

  if (body.ai) {
    const aiUpdate: any = {
      id: 1,
      provider: body.ai.provider,
      base_url: body.ai.base_url || null,
      model: body.ai.model,
      system_prompt: body.ai.system_prompt,
      context_window_days: body.ai.context_window_days,
    };

    // Only update API key if it's provided and not the masked version
    if (body.ai.api_key && !body.ai.api_key.includes("...")) {
      aiUpdate.api_key = body.ai.api_key;
    }

    const { data, error } = await supabase
      .from("ai_settings")
      .upsert(aiUpdate)
      .select()
      .single();

    if (error) {
      console.error("ai_settings upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("ai_settings saved:", data);
  }

  if (body.dashboard?.password) {
    const hash = await hashPassword(body.dashboard.password);
    const { data, error } = await supabase
      .from("dashboard_settings")
      .upsert({ id: 1, password_hash: hash })
      .select()
      .single();

    if (error) {
      console.error("dashboard_settings upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("dashboard_settings saved:", data);
  }

  if (body.whatsapp) {
    const whatsappUpdate: any = {
      id: 1,
      phone_number_id: body.whatsapp.phone_number_id,
      webhook_verify_token: body.whatsapp.webhook_verify_token,
    };

    // Only update WhatsApp access token if it's provided and not masked
    if (body.whatsapp.access_token && !body.whatsapp.access_token.startsWith("••••••••")) {
      whatsappUpdate.access_token = body.whatsapp.access_token;
    }

    const { data, error } = await supabase
      .from("whatsapp_settings")
      .upsert(whatsappUpdate)
      .select()
      .single();

    if (error) {
      console.error("whatsapp_settings upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("whatsapp_settings saved:", data);
  }

  return NextResponse.json({ success: true });
}
