import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaizen AI — AI Chatbots & Voice Agents",
  description:
    "AI agents that answer every call, reply to every message, and book appointments — in any language, 24/7/365.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Kaizen AI — AI Chatbots & Voice Agents",
    description:
      "AI agents that answer every call, reply to every message, and book appointments — in any language, 24/7/365.",
    url: "https://kaizenai.dev",
    siteName: "Kaizen AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="halo-on grain-on" data-hero-variant="transcript">
        {children}
      </body>
    </html>
  );
}
