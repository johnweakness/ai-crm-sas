import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL("/?integration=error", request.url));
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_REDIRECT_URI || new URL("/api/integrations/google/callback", request.url).toString(), grant_type: "authorization_code" }) });
  if (!response.ok) return NextResponse.redirect(new URL("/?integration=error", request.url));
  // Store these encrypted in Supabase Vault or a dedicated integrations table before production use.
  return NextResponse.redirect(new URL("/?integration=connected", request.url));
}
