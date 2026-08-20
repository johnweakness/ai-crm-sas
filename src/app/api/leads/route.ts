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
  const { data, error } = await supabase.from("leads").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(request: Request) {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("leads").insert({ workspace_id: workspaceId, owner_id: user.id, name: body.name, company: body.company, email: body.email, deal_value: Number(body.deal_value || 0), stage: body.stage || "New leads", source: body.source || "Website", notes: body.notes }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lead: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from("leads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).eq("workspace_id", workspaceId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lead: data });
}

export async function DELETE(request: Request) {
  const { supabase, user, workspaceId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  if (!user || !workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const { error } = await supabase.from("leads").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
