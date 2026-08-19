import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (provider !== "gmail" && provider !== "calendar") return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/integrations/google/callback`;
  if (!clientId) return NextResponse.json({ error: "Google integration is not configured", setup: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"] }, { status: 503 });
  const scope = provider === "gmail" ? "https://www.googleapis.com/auth/gmail.send" : "https://www.googleapis.com/auth/calendar.events";
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId); authUrl.searchParams.set("redirect_uri", redirectUri); authUrl.searchParams.set("response_type", "code"); authUrl.searchParams.set("access_type", "offline"); authUrl.searchParams.set("prompt", "consent"); authUrl.searchParams.set("scope", `openid email ${scope}`);
  return NextResponse.redirect(authUrl);
}
