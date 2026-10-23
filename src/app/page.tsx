import { Navbar } from "@/components/layout/Navbar/Navbar";
import { HeroCarousel } from "@/components/home/HeroCarousel/HeroCarousel";
import { AboutSection } from "@/components/home/AboutSection/AboutSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs/WhyChooseUs";
import { ServicesGrid } from "@/components/home/ServicesGrid/ServicesGrid";
import { HowItWorks } from "@/components/home/HowItWorks/HowItWorks";
import { Pricing } from "@/components/home/Pricing/Pricing";
import { Reviews } from "@/components/home/Reviews/Reviews";
import { DownloadApp } from "@/components/home/DownloadApp/DownloadApp";
import { Faq } from "@/components/shared/Faq/Faq";
import { Footer } from "@/components/layout/Footer/Footer";
import { fetchHelpNowHome } from "@/lib/api/helpNowHome";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { buildHelpNowMetadata } from "@/lib/seo/helpNowSeo";

// Admin → SEO Manager → "Help Now — Home"; the layout's defaults otherwise.
export function generateMetadata() {
  return buildHelpNowMetadata("/", { alternates: { canonical: "/" } });
}

export default async function HomePage() {
  // Admin → Website Section → Help Now. null (API down) keeps each section's
  // built-in content.
  const content = await fetchHelpNowHome();

  return (
    <div style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      {/* <Topbar /> — hidden on the live site; import from "@/components/layout/Topbar/Topbar" to enable. */}
      <SeoJsonLd path="/" />
      <Navbar />
      <HeroCarousel cmsSlides={content?.hero.slides} marquee={content ? content.marquee : undefined} />
      <AboutSection about={content ? content.about : undefined} />
      <WhyChooseUs services={content ? content.services : undefined} />
      <ServicesGrid popular={content ? content.popular : undefined} />
      <HowItWorks content={content ? content.steps : undefined} />
      <Pricing content={content ? content.pricing : undefined} />
      <Reviews testimonials={content ? content.testimonials : undefined} />
      <DownloadApp />
      <Faq faq={content ? content.faq : undefined} />
      <Footer />
    </div>
  );
}
