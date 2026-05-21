import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getAIResponse } from "@/lib/ai/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = body.entry?.[0];
    if (!entry) return new NextResponse("OK", { status: 200 });

    const change = entry.changes?.[0];
    const value = change?.value;
    if (!value) return new NextResponse("OK", { status: 200 });

    const messages = value.messages;
    const contacts = value.contacts;

    if (!messages || messages.length === 0) {
      return new NextResponse("OK", { status: 200 });
    }

    const supabase = getSupabaseServer();

    for (const msg of messages) {
      if (msg.type !== "text") continue;

      const whatsappMsgId = msg.id;
      const from = msg.from;
      const content = msg.text?.body;
      if (!content) continue;

      const contact = contacts?.find((c: any) => c.wa_id === from);
      const name = contact?.profile?.name || null;

      const { data: existingMsg } = await supabase
        .from("messages")
        .select("id")
        .eq("whatsapp_msg_id", whatsappMsgId)
        .single();

      if (existingMsg) continue;

      let { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("phone", from)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ phone: from, name, mode: "agent" })
          .select()
          .single();
        conversation = newConv;
      } else if (name && !conversation.name) {
        await supabase
          .from("conversations")
          .update({ name })
          .eq("id", conversation.id);
      }

      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content,
        whatsapp_msg_id: whatsappMsgId,
      });

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);

      if (conversation.mode === "human") continue;

      const contextDays = await getContextWindowDays();
      const { data: history } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("conversation_id", conversation.id)
        .gte("created_at", new Date(Date.now() - contextDays * 86400000).toISOString())
        .order("created_at", { ascending: true });

      const aiMessages = (history || []).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      let aiReply = "Sorry, I couldn't process that.";
      try {
        aiReply = await getAIResponse(aiMessages);
      } catch (err) {
        console.error("AI error:", err);
      }

      try {
        await sendWhatsAppMessage(from, aiReply);
      } catch (err) {
        console.error("WhatsApp send error:", err);
      }

      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: aiReply,
      });

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("OK", { status: 200 });
  }
}

async function getContextWindowDays(): Promise<number> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("ai_settings")
      .select("context_window_days")
      .single();
    return data?.context_window_days ?? 90;
  } catch {
    return 90;
  }
}
