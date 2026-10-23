import { helpNowServices } from "@/data/helpNowServices";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

// Hourly rate per helper, by service slug.
export type HelpNowRates = Record<string, number>;

// The built-in rates (data/helpNowServices.ts) — used until the API answers.
export const DEFAULT_HELP_NOW_RATES: HelpNowRates = Object.fromEntries(helpNowServices.map((s) => [s.slug, s.ratePerHour]));

// The rates bookings are charged at (Admin → Help Now → Popular Services sets
// them). Server-side, refreshed every minute; the built-in rates if the API
// can't be reached.
export async function fetchHelpNowRates(): Promise<HelpNowRates> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/websites/help-now/bookings/rates`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return DEFAULT_HELP_NOW_RATES;
    const body = (await response.json()) as { data?: HelpNowRates };
    return { ...DEFAULT_HELP_NOW_RATES, ...(body.data ?? {}) };
  } catch {
    return DEFAULT_HELP_NOW_RATES;
  }
}
