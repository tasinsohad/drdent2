import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();

  const { data: whatsappSettings } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .single();

  const appUrl = "https://drdent2.vercel.app";

  return NextResponse.json({
    webhook_url: `${appUrl}/api/webhook`,
    webhook_verify_token: whatsappSettings?.webhook_verify_token || "NOT SET",
    phone_number_id: whatsappSettings?.phone_number_id || "NOT SET",
    has_access_token: !!whatsappSettings?.access_token,
    connected: whatsappSettings?.connected || false,
    instructions: [
      "1. Go to Meta for Developers → WhatsApp → Configuration",
      `2. Set Callback URL to: ${appUrl}/api/webhook`,
      `3. Set Verify Token to: ${whatsappSettings?.webhook_verify_token || "NOT SET"}`,
      "4. Subscribe to 'messages' webhook field",
      "5. Click Save and verify",
      "6. Test by sending a message to your WhatsApp number",
    ],
  });
}
