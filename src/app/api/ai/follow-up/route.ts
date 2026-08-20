import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const leadName = body.leadName || "the lead";
  const direction = body.direction || "Write a warm, concise follow-up that moves the conversation forward.";
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI provider is not configured" }, { status: 503 });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({ model: "gpt-4o-mini", temperature: 0.7, messages: [{ role: "system", content: "You write concise, thoughtful sales follow-up emails for a small marketing agency. Return only the message body." }, { role: "user", content: `Lead: ${leadName}\nDirection: ${direction}` }] });
  return NextResponse.json({ message: completion.choices[0]?.message.content || "Unable to generate a message." });
}
