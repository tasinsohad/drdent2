import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendWhatsAppMessage, verifyWebhookToken } from "@/lib/whatsapp";
import { getAIResponse } from "@/lib/ai/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("Webhook GET:", { mode, token, challenge });

  if (mode === "subscribe" && token && (await verifyWebhookToken(token))) {
    console.log("Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("Webhook verification failed");
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Webhook POST received:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    if (!entry) {
      console.log("No entry in webhook payload");
      return new NextResponse("OK", { status: 200 });
    }

    const change = entry.changes?.[0];
    const value = change?.value;
    if (!value) {
      console.log("No value in webhook change");
      return new NextResponse("OK", { status: 200 });
    }

    const messages = value.messages;
    const contacts = value.contacts;

    if (!messages || messages.length === 0) {
      console.log("No messages in webhook payload");
      return new NextResponse("OK", { status: 200 });
    }

    const supabase = getSupabaseServer();

    for (const msg of messages) {
      if (msg.type !== "text") {
        console.log("Skipping non-text message:", msg.type);
        continue;
      }

      const whatsappMsgId = msg.id;
      const from = msg.from;
      const content = msg.text?.body;
      if (!content) continue;

      console.log("Processing message:", { from, content, whatsappMsgId });

      const contact = contacts?.find((c: any) => c.wa_id === from);
      const name = contact?.profile?.name || null;

      const { data: existingMsg } = await supabase
        .from("messages")
        .select("id")
        .eq("whatsapp_msg_id", whatsappMsgId)
        .single();

      if (existingMsg) {
        console.log("Message already exists, skipping");
        continue;
      }

      let { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("phone", from)
        .single();

      if (!conversation) {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ phone: from, name, mode: "agent" })
          .select()
          .single();
        if (error) {
          console.error("Error creating conversation:", error);
        } else {
          conversation = newConv;
          console.log("Created new conversation:", conversation.id);
        }
      } else if (name && !conversation.name) {
        await supabase
          .from("conversations")
          .update({ name })
          .eq("id", conversation.id);
      }

      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content,
        whatsapp_msg_id: whatsappMsgId,
      });

      if (msgError) {
        console.error("Error inserting message:", msgError);
      } else {
        console.log("Message saved to database");
      }

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);

      if (conversation.mode === "human") {
        console.log("Conversation in human mode, skipping AI");
        continue;
      }

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
        console.log("AI reply generated");
      } catch (err) {
        console.error("AI error:", err);
      }

      try {
        await sendWhatsAppMessage(from, aiReply);
        console.log("WhatsApp message sent");
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
