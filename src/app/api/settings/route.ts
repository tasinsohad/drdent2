import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabaseServer();

  const { data: aiSettings } = await supabase
    .from("ai_settings")
    .select("*")
    .single();

  const { data: dashboardSettings } = await supabase
    .from("dashboard_settings")
    .select("password_hash")
    .single();

  const maskedKey = aiSettings?.api_key
    ? aiSettings.api_key.slice(0, 8) + "..." + aiSettings.api_key.slice(-4)
    : "";

  return NextResponse.json({
    ai: {
      ...aiSettings,
      api_key: maskedKey,
    },
    dashboard: {
      has_password: !!dashboardSettings?.password_hash,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const supabase = getSupabaseServer();

  if (body.ai) {
    const { error } = await supabase
      .from("ai_settings")
      .update({
        provider: body.ai.provider,
        api_key: body.ai.api_key,
        base_url: body.ai.base_url || null,
        model: body.ai.model,
        system_prompt: body.ai.system_prompt,
        context_window_days: body.ai.context_window_days,
      })
      .eq("id", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.dashboard?.password) {
    const hash = await hashPassword(body.dashboard.password);
    const { error } = await supabase
      .from("dashboard_settings")
      .update({ password_hash: hash })
      .eq("id", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
