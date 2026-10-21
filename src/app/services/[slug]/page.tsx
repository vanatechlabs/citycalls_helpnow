import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { ServiceAreas } from "@/components/dish-washing/ServiceAreas/ServiceAreas";
import { ServiceHero } from "@/components/services/ServiceHero/ServiceHero";
import { ServiceBookingSection } from "@/components/services/ServiceBookingSection/ServiceBookingSection";
import { MoreServices, ServiceFaq, ServiceIncluded, ServiceSteps } from "@/components/services/ServiceDetails/ServiceDetails";
import { findHelpNowService, helpNowServices } from "@/data/helpNowServices";

// Only the services in helpNowServices exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return helpNowServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = findHelpNowService(slug);
  if (!service) return {};
  return {
    title: `${service.name} Service in Ghaziabad | Help Now by CityCalls`,
    description: `${service.short} Book verified Help Now helpers from ₹${service.ratePerHour}/hour. Pay online or after service.`,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function HelpNowServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = findHelpNowService(slug);
  if (!service) notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      <Navbar />
      <ServiceHero slug={service.slug} />
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
