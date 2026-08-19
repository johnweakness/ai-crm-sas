import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "orbit-crm", configured: { supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), ai: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) } });
}
