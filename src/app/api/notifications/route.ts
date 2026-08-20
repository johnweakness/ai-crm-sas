import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single();
  if (!profile?.workspace_id) return NextResponse.json({ notifications: [] });
  const { data, error } = await supabase.from("activity_log").select("*").eq("workspace_id", profile.workspace_id).order("created_at", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data });
}
