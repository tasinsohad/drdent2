import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getAIResponse } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { from, content } = body;

  if (!from || !content) {
    return NextResponse.json(
      { error: "Missing from or content" },
      { status: 400 }
    );
  }

  console.log("Test webhook triggered:", { from, content });

  const supabase = getSupabaseServer();
  const whatsappMsgId = `test-${Date.now()}`;

  let { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("phone", from)
    .single();

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ phone: from, name: "Test User", mode: "agent" })
      .select()
      .single();
    if (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    conversation = newConv;
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

  if (conversation.mode === "human") {
    return NextResponse.json({
      status: "saved",
      conversation_id: conversation.id,
      message: "Saved in human mode, no AI reply",
    });
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

  return NextResponse.json({
    status: "ok",
    conversation_id: conversation.id,
    ai_reply: aiReply,
  });
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
