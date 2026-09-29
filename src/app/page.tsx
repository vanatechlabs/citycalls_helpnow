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

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      {/* <Topbar /> — hidden on the live site; import from "@/components/layout/Topbar/Topbar" to enable. */}
      <Navbar />
      <HeroCarousel />
      <AboutSection />
      <WhyChooseUs />
      <ServicesGrid />
      <HowItWorks />
      <Pricing />
      <Reviews />
      <DownloadApp />
      <Faq />
      <Footer />
    </div>
  );
}
