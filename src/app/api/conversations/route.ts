import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServer();

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      last_message:messages(content, role, created_at)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const simplified = conversations?.map((conv: any) => ({
    ...conv,
    last_message: conv.last_message?.[0] || null,
  }));

  return NextResponse.json(simplified || []);
}
