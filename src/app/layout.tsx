import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Help Now | CityCalls On-Demand Home Maid & Cleaning Services",
  description:
    "CityCalls is Ghaziabad's premier marketplace for trusted, background-verified home services. Book AC repair, deep cleaning, pest control, salon at home, and more in under 60 minutes.",
  keywords: [
    "home services",
    "appliance repair",
    "pest control",
    "deep cleaning",
    "sofa cleaning",
    "salon at home",
    "Ghaziabad services",
    "CityCalls",
  ],
  authors: [{ name: "CityCalls" }],
  openGraph: {
    title: "CityCalls — Fast & Reliable Home Services",
    description:
      "Verified professionals. Transparent pricing. Doorstep service across Ghaziabad in under 60 minutes. Book your service today.",
    type: "website",
    siteName: "CityCalls",
  },
  twitter: {
    card: "summary_large_image",
    title: "CityCalls | Trusted Home Services",
    description: "Ghaziabad's top-rated home services marketplace. Book AC repair, cleaning, pest control and more instantly.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
