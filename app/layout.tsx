import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Linework Studio — Jasmine Johnson · Civil Engineering & CAD",
  description:
    "Field to finish. Site inspection reports, CAD drafting, and instant parcel research — one studio, precision-built.",
  metadataBase: new URL("https://jasminelineworks.com"),
  openGraph: {
    title: "Linework Studio",
    description: "Field to finish. Every line accounted for.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
