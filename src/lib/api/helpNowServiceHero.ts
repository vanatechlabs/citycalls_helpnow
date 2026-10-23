const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

// Admin → Website Section → Help Now → Service Page Hero (backend
// help-now/service-heroes): the banner at the top of /services/<slug>.
export interface HelpNowServiceHeroContent {
  subheading: string;
  heading: string;
  highlight: string;
  description: string;
  features: { title: string; subtitle: string }[];
  image: string;
  imageAlt: string;
}

// Server-side, refreshed every minute. null when nothing is saved (or it's
// switched off, or the API can't be reached) — the page then shows its
// built-in hero.
export async function fetchHelpNowServiceHero(slug: string): Promise<HelpNowServiceHeroContent | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/websites/help-now/service-heroes/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: HelpNowServiceHeroContent | null };
    return body.data ?? null;
  } catch {
    return null;
  }
}
