import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit CRM | Calm, focused growth",
  description: "AI-powered CRM and lead management for small marketing teams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
