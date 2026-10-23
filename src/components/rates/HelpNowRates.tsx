"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { DEFAULT_HELP_NOW_RATES, type HelpNowRates } from "@/lib/api/helpNowRates";

// Every price on the site reads the hourly rates from here, so they all match
// what the booking is charged (the root layout fetches them once).
const RatesContext = createContext<HelpNowRates>(DEFAULT_HELP_NOW_RATES);

export function HelpNowRatesProvider({ rates, children }: { rates: HelpNowRates; children: ReactNode }) {
  return <RatesContext.Provider value={rates}>{children}</RatesContext.Provider>;
}

// rateOf("dish-washing") → that service's hourly rate per helper.
export function useHelpNowRates() {
  const rates = useContext(RatesContext);
  return useCallback((slug: string) => rates[slug] ?? DEFAULT_HELP_NOW_RATES[slug] ?? 0, [rates]);
}

// For server components: renders a service's current hourly rate.
export function RatePerHour({ slug }: { slug: string }) {
  const rateOf = useHelpNowRates();
  return <>{rateOf(slug)}</>;
}
