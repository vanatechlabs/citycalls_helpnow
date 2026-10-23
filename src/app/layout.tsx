import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/seo/helpNowSeo";
import { fetchHelpNowRates } from "@/lib/api/helpNowRates";
import { HelpNowRatesProvider } from "@/components/rates/HelpNowRates";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Site-wide defaults; each page (and Admin → SEO Manager, "Help Now Website")
// can override them.
const DEFAULT_TITLE = "Help Now | House Help & Home Cleaning Services in Delhi NCR";
const DEFAULT_DESCRIPTION =
  "Book verified house help by the hour for home cleaning, dish washing, kitchen help, bathroom cleaning and laundry across Delhi, Noida, Gurugram, Ghaziabad and Faridabad. Same-day slots, fixed prices.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "house help",
    "home cleaning services in Delhi NCR",
    "hourly house help",
    "dish washing service",
    "kitchen helper at home",
    "bathroom cleaning service",
    "laundry and ironing at home",
    "domestic help Noida",
    "house help Gurugram",
    "home cleaning Ghaziabad",
    "Help Now",
    "CityCalls",
  ],
  authors: [{ name: "CityCalls" }],
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: "/assets/Banner/h1.png", width: 1881, height: 836, alt: "Help Now helper cleaning a home in Delhi NCR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/assets/Banner/h1.png"],
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Hourly rates for every price on the site (Admin → Help Now → Popular Services).
  const rates = await fetchHelpNowRates();
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <HelpNowRatesProvider rates={rates}>{children}</HelpNowRatesProvider>
      </body>
    </html>
  );
}
