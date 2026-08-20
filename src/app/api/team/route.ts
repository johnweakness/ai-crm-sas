import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function adminContext() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, workspaceId: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, workspaceId: null };
  const { data: profile } = await supabase.from("profiles").select("workspace_id, role").eq("id", user.id).single();
  return { supabase, user, workspaceId: profile?.role === "admin" ? profile.workspace_id : null };
}

export async function GET() {
  const { supabase, user, workspaceId } = await adminContext();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { data, error } = await supabase.from("profiles").select("id, full_name, role, created_at").eq("workspace_id", workspaceId).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data });
}

export async function PATCH(request: Request) {
  const { supabase, user, workspaceId } = await adminContext();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id, role, full_name } = await request.json();
  if (id === user.id && role !== "admin") return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  const { data, error } = await supabase.from("profiles").update({ role, full_name }).eq("id", id).eq("workspace_id", workspaceId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ member: data });
}
