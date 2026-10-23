import type { Metadata } from "next";

// SEO entries managed in Admin → SEO Manager → Add SEO Meta ("Help Now
// Website" group), one per page path. Re-fetched at most once a minute.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, "");
const SEO_REVALIDATE_SECONDS = 60;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://helpnow.citycalls.in").replace(/\/$/, "");
export const SITE_NAME = "Help Now by CityCalls";

export interface HelpNowSeoMeta {
  pagePath: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  openGraphTags?: string;
  schemaMarkup?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

// null when the page has no active SEO entry or the API is unreachable —
// pages then keep their own built-in metadata.
export async function fetchHelpNowSeo(path: string): Promise<HelpNowSeoMeta | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/websites/help-now/seo/meta?path=${encodeURIComponent(path)}`, {
      next: { revalidate: SEO_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data: HelpNowSeoMeta | null };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

// Pulls property/name → content out of pasted <meta ...> tags, e.g.
// <meta property="og:title" content="..."> → { "og:title": "..." }.
function parseMetaTags(html?: string): Record<string, string> {
  const tags: Record<string, string> = {};
  if (!html) return tags;
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /\bcontent\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
    if (key && content !== undefined) tags[key] = content;
  }
  return tags;
}

// Share images as-is (no format conversion — WhatsApp skips WebP previews).
const shareImageUrl = (image: string) =>
  /^https?:\/\//i.test(image) || image.startsWith("/assets/") ? image : `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;

const asText = (value: Metadata["title"]) => (typeof value === "string" ? value : undefined);

// The page's own metadata, overridden field by field by whatever the admin
// filled in for this path.
export async function buildHelpNowMetadata(path: string, fallback: Metadata = {}): Promise<Metadata> {
  const seo = await fetchHelpNowSeo(path);
  if (!seo) return fallback;

  const tags = parseMetaTags(seo.openGraphTags);
  const title = seo.metaTitle || asText(fallback.title);
  const description = seo.metaDescription || fallback.description || undefined;
  const image = seo.ogImage ? shareImageUrl(seo.ogImage) : tags["og:image"];
  const keywords = seo.metaKeywords?.split(",").map((k) => k.trim()).filter(Boolean);
  const fallbackImages = fallback.openGraph?.images;

  return {
    ...fallback,
    ...(title && { title }),
    ...(description && { description }),
    ...(keywords?.length && { keywords }),
    ...(seo.canonicalUrl && { alternates: { ...fallback.alternates, canonical: seo.canonicalUrl } }),
    openGraph: {
      ...fallback.openGraph,
      siteName: tags["og:site_name"] || SITE_NAME,
      type: tags["og:type"] === "article" ? "article" : "website",
      title: tags["og:title"] || title,
      description: tags["og:description"] || description,
      ...((tags["og:url"] || seo.canonicalUrl) && { url: tags["og:url"] || seo.canonicalUrl }),
      ...(image ? { images: [{ url: image }] } : fallbackImages ? { images: fallbackImages } : {}),
    },
    twitter: {
      ...fallback.twitter,
      card: tags["twitter:card"] === "summary" ? "summary" : "summary_large_image",
      title: tags["twitter:title"] || tags["og:title"] || title,
      description: tags["twitter:description"] || tags["og:description"] || description,
      ...((tags["twitter:image"] || image) && { images: [tags["twitter:image"] || image] }),
    },
  };
}
