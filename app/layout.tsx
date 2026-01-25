import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "./lib/authprovider";

export const metadata: Metadata = {
  title: {
    default: "DressAI",
    template: "%s • DressAI",
  },
  description: "AI Outfit Advisor — Wardrobe Intelligence",
  applicationName: "DressAI",
  keywords: ["AI fashion", "outfit generator", "wardrobe", "stylist", "DressAI"],
  authors: [{ name: "DressAI" }],
  creator: "DressAI",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "DressAI",
    description: "AI Outfit Advisor — Wardrobe Intelligence",
    type: "website",
    siteName: "DressAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "DressAI",
    description: "AI Outfit Advisor — Wardrobe Intelligence",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06040b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
