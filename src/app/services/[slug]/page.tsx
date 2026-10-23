import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { ServiceAreas } from "@/components/dish-washing/ServiceAreas/ServiceAreas";
import { ServiceHero } from "@/components/services/ServiceHero/ServiceHero";
import { ServiceBookingSection } from "@/components/services/ServiceBookingSection/ServiceBookingSection";
import { MoreServices, ServiceFaq, ServiceIncluded, ServiceSteps } from "@/components/services/ServiceDetails/ServiceDetails";
import { findHelpNowService, helpNowServices } from "@/data/helpNowServices";
import { fetchHelpNowServiceHero } from "@/lib/api/helpNowServiceHero";
import { fetchHelpNowRates } from "@/lib/api/helpNowRates";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { buildHelpNowMetadata } from "@/lib/seo/helpNowSeo";

// Only the services in helpNowServices exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return helpNowServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = findHelpNowService(slug);
  if (!service) return {};
  // The admin's hero heading doubles as the page title (same request as the page, so fetched once).
  const [hero, rates] = await Promise.all([fetchHelpNowServiceHero(service.slug), fetchHelpNowRates()]);
  const title = hero ? `${hero.heading} | Help Now by CityCalls` : `${service.name} Service in Delhi NCR | Help Now by CityCalls`;
  const description = `${hero?.description || service.short} Book verified Help Now helpers from ₹${rates[service.slug] ?? service.ratePerHour}/hour. Pay online or after service.`;
  // Admin → SEO Manager → "Help Now — <service>" overrides any of these.
  return buildHelpNowMetadata(`/services/${service.slug}`, {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title, description, url: `/services/${service.slug}`, images: [{ url: hero?.image || service.heroImage, alt: hero?.imageAlt || service.name }] },
  });
}

export default async function HelpNowServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = findHelpNowService(slug);
  if (!service) notFound();
  // Admin → Help Now → Service Page Hero; null keeps the built-in hero.
  const hero = await fetchHelpNowServiceHero(service.slug);

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      <SeoJsonLd path={`/services/${service.slug}`} />
      <Navbar />
      <ServiceHero slug={service.slug} hero={hero} />
      <ServiceBookingSection slug={service.slug} />
      <ServiceIncluded service={service} />
      <ServiceSteps />
      <ServiceAreas />
      <ServiceFaq service={service} />
      <MoreServices current={service.slug} />
      <Footer />
    </div>
  );
}
