import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, workspaceId: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, workspaceId: null };
  const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single();
  return { supabase, user, workspaceId: profile?.workspace_id ?? null };
}

export async function GET() {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("tasks").select("*").eq("workspace_id", workspaceId).order("due_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}

export async function POST(request: Request) {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("tasks").insert({ workspace_id: workspaceId, lead_id: body.lead_id, assignee_id: body.assignee_id || user.id, title: body.title, due_at: body.due_at }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, completed } = await request.json();
  const { data, error } = await supabase.from("tasks").update({ completed_at: completed ? new Date().toISOString() : null }).eq("id", id).eq("workspace_id", workspaceId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ task: data });
}
