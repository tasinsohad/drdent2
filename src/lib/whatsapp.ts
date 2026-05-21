import { getSupabaseServer } from "@/lib/supabase/server";

async function getWhatsAppSettings() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .single();
  return data;
}

export async function sendWhatsAppMessage(to: string, body: string) {
  const settings = await getWhatsAppSettings();
  if (!settings?.access_token || !settings?.phone_number_id) {
    throw new Error("WhatsApp not configured. Please configure in Settings.");
  }

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${settings.phone_number_id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function verifyWebhookToken(token: string): Promise<boolean> {
  const settings = await getWhatsAppSettings();
  return settings?.webhook_verify_token === token;
}
