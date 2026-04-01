  import type { Metadata } from "next";
  import { Geist, Geist_Mono, Cormorant_Garamond, Cinzel } from "next/font/google";
  import "./globals.css";
  import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  const cormorant = Cormorant_Garamond({
    variable: "--font-cormorant",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    style: ["normal", "italic"],
  });

  const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
  });

  export const metadata: Metadata = {
    title: {
      template: "%s | The Shipyard",
      default: "The Shipyard — Forge Your Legacy",
    },
    description: "Join the most prestigious assembly of master builders. A platform to track, manage, and build your digital projects with precision and prestige.",
    keywords: ["developer", "projects", "shipyard", "portfolio", "development", "productivity"],
    authors: [{ name: "The Architect" }],
    openGraph: {
      type: "website",
      locale: "en_US",
      images: [{ url: '/api/og', width: 1200, height: 630 }],
      url: "https://shipyard-io.vercel.app",
      title: "ShipYard — The Developer Accountability Platform for Builders",  // 58 chars ✓
      description: "Declare your project publicly, break it into tasks, track your daily streak, and ship — or bury it in the graveyard for all to see.",  // 133 chars ✓
      siteName: "The Shipyard",
    },
    twitter: {
      card: "summary_large_image",
      title: "ShipYard — The Developer Accountability Platform for Builders",  // 58 chars ✓
      description: "Declare your project publicly, break it into tasks, track your daily streak, and ship — or bury it in the graveyard for all to see.",  // 133 chars ✓
      images: ['/api/og'],

    },
    icons: {
      icon: "/icon.svg",
    },
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${cinzel.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Providers>{children}
          <Analytics />
          <SpeedInsights />
          </Providers>
        </body>
      </html>
    );
  }
