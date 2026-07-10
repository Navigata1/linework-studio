import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Linework Studio — Inspired design, drafted true · Jasmine Johnson, CE",
  description:
    "A Southern California CAD & inspection studio. Sketches become drawings, site photos become reports, addresses become dossiers — inspired design, drafted true.",
  metadataBase: new URL("https://jasminelineworks.com"),
  openGraph: {
    title: "Linework Studio — Inspired design, drafted true",
    description: "CAD drafting, site inspection reports, and instant parcel research — one studio for Jasmine Johnson, CE.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
