import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("workspace_id, role").eq("id", user.id).single();
  if (profile?.role !== "admin" || !profile.workspace_id) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { email, role = "employee" } = await request.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  const { error } = await supabase.from("workspace_invitations").insert({ workspace_id: profile.workspace_id, invited_by: user.id, email: email.toLowerCase().trim(), role });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ invited: true }, { status: 201 });
}
