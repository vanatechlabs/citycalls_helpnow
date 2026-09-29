"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { Faq } from "@/components/shared/Faq/Faq";
import { HeroSection } from "@/components/dish-washing/HeroSection/HeroSection";
import { BookingForm } from "@/components/dish-washing/BookingForm/BookingForm";
import { ServiceSidebar } from "@/components/dish-washing/ServiceSidebar/ServiceSidebar";
import { CleaningSupplies } from "@/components/dish-washing/CleaningSupplies/CleaningSupplies";
import { HowItWorks } from "@/components/dish-washing/HowItWorks/HowItWorks";
import { AppDownloadStatsBanner } from "@/components/dish-washing/AppDownloadStatsBanner/AppDownloadStatsBanner";
import { ParallaxBanner } from "@/components/dish-washing/ParallaxBanner/ParallaxBanner";
import { ServiceAreas } from "@/components/dish-washing/ServiceAreas/ServiceAreas";
import { OtherServices } from "@/components/dish-washing/OtherServices/OtherServices";

export function DishWashingView() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div
      className="bg-white min-h-screen text-slate-900"
      style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* <Topbar /> — hidden on the live site */}
      <Navbar />

      <HeroSection />

      {/* Main Booking Content Area (65% Form / 35% Sidebar) */}
      <section className="container-x mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[65%]">
            <BookingForm onStepChange={setCurrentStep} />
          </div>
          <div className="w-full lg:w-[35%]">
            <ServiceSidebar currentStep={currentStep} />
          </div>
        </div>
      </section>

      <CleaningSupplies />
      <HowItWorks />
      <AppDownloadStatsBanner />
      <ParallaxBanner />
      <ServiceAreas />
      <OtherServices />
      <Faq />
      <Footer />
    </div>
  );
}
