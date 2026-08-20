import { NextResponse } from "next/server";
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini AI is not configured" }, { status: 503 });
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: "You write concise, thoughtful sales follow-up emails for a small marketing agency. Return only the message body." }] }, contents: [{ role: "user", parts: [{ text: `Lead: ${leadName}\nDirection: ${direction}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 300 } }) });
  if (!response.ok) return NextResponse.json({ error: "Gemini request failed" }, { status: 502 });
  const result = await response.json();
  const message = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!message) return NextResponse.json({ error: "Gemini returned no message" }, { status: 502 });
  return NextResponse.json({ message });
}
