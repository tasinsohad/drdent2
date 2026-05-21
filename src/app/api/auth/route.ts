import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, setup } = body;
  const supabase = getSupabaseServer();

  const { data: settings } = await supabase
    .from("dashboard_settings")
    .select("password_hash")
    .single();

  if (setup) {
    if (settings?.password_hash) {
      return NextResponse.json(
        { error: "Password already set" },
        { status: 400 }
      );
    }

    const hash = await hashPassword(password);

    const { error } = await supabase
      .from("dashboard_settings")
      .update({ password_hash: hash })
      .eq("id", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await setAuthCookie();
    return NextResponse.json({ success: true });
  }

  if (!settings?.password_hash) {
    return NextResponse.json(
      { error: "No password set. Please set up a password first." },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(password, settings.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  await setAuthCookie();
  return NextResponse.json({ success: true });
}
