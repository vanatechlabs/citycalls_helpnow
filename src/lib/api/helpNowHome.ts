const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

// Admin → Website Section → Help Now (backend help-now/home-page). A section
// is null when it's switched off in admin.
export interface HelpNowHeroSlide {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface HelpNowMarquee {
  items: { label: string; icon: string }[];
}

export interface HelpNowAbout {
  eyebrow: string;
  heading: string;
  highlight: string;
  headingLine2: string;
  description: string;
  points: string[];
  cards: { title: string; description: string; image: string; alt: string }[];
}

export interface HelpNowServiceCards {
  cards: { title: string; subtitle: string; subtitle2: string; description: string; image: string; alt: string }[];
}

export interface HelpNowFaq {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  items: { question: string; answer: string; image: string; alt: string }[];
}

// Admin → Pages Section → Testimonials, reviews marked Help Now.
export interface HelpNowTestimonial {
  _id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  message: string;
  color: string;
}

// "Our Popular Services": one card per service (name and rate come from
// data/helpNowServices.ts — the booking prices).
export interface HelpNowPopular {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  cards: { slug: string; description: string; image: string; alt: string; badge: string }[];
}

// "Simple Steps to Book" — `icon` is a lucide-react name.
export interface HelpNowSteps {
  eyebrow: string;
  heading: string;
  highlight: string;
  items: { icon: string; title: string; description: string }[];
}

// The text around the "Fair Pricing" calculator.
export interface HelpNowPricingText {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  perks: { icon: string; title: string; text: string }[];
  note: string;
}

export interface HelpNowHomeContent {
  hero: { slides: HelpNowHeroSlide[] };
  marquee: HelpNowMarquee | null;
  about: HelpNowAbout | null;
  services: HelpNowServiceCards | null;
  faq: HelpNowFaq | null;
  popular: HelpNowPopular | null;
  steps: HelpNowSteps | null;
  pricing: HelpNowPricingText | null;
  testimonials: HelpNowTestimonial[];
}

// Splits a heading around its highlight: [before, highlight, after].
export function splitHighlight(heading: string, highlight: string): [string, string, string] {
  const index = highlight ? heading.indexOf(highlight) : -1;
  if (index < 0) return [heading, "", ""];
  return [heading.slice(0, index), highlight, heading.slice(index + highlight.length)];
}

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, "");
// Matches an upload URL that has no transformation yet.
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?![a-z]{1,3}_[^/]*\/)/i;

// Cloudinary uploads get an auto-format, width-capped version; local uploads
// are served by the API; bundled ones (/assets/...) are used as they are.
export function helpNowImageUrl(image: string, width = 1600) {
  if (/^https?:\/\//i.test(image)) return image.replace(CLOUDINARY_UPLOAD, `$1f_auto,q_auto,c_limit,w_${width}/`);
  if (image.startsWith("/uploads/")) return `${API_ORIGIN}${image}`;
  return image;
}

// Server-side, refreshed every minute. null when the API can't be reached —
// the sections then show their built-in content.
export async function fetchHelpNowHome(): Promise<HelpNowHomeContent | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/websites/help-now/home-page`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: HelpNowHomeContent };
    return body.data ?? null;
  } catch {
    return null;
  }
}
