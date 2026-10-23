import { fetchHelpNowSeo } from "@/lib/seo/helpNowSeo";

// Renders the JSON-LD schema an admin saved for this page (SEO Manager).
// Server component — shares the cached fetch with the page's generateMetadata.
export async function SeoJsonLd({ path }: { path: string }) {
  const seo = await fetchHelpNowSeo(path);
  if (!seo?.schemaMarkup) return null;

  let json: string;
  try {
    // Re-serialise so only valid JSON reaches the page, and escape "<" so the
    // content can never close the <script> tag early.
    const raw = seo.schemaMarkup.trim().replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, "");
    json = JSON.stringify(JSON.parse(raw)).replace(/</g, "\\u003c");
  } catch {
    return null;
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
