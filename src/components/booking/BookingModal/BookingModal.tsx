"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import { findHelpNowService } from "@/data/helpNowServices";
import { HelpNowBookingFlow } from "../HelpNowBookingFlow";
import { BookingSidebar } from "./BookingSidebar";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceSlug: string;
  initialCoupon?: string;
}

export function BookingModal({ isOpen, onClose, serviceSlug, initialCoupon }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const service = findHelpNowService(serviceSlug);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && service && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Book ${service.name}`}
            initial={{ opacity: 0, y: 40, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[95vw] max-w-[1000px] h-[90vh] bg-white rounded-none overflow-hidden flex flex-col md:flex-row"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors z-10 shadow-sm"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Left Sidebar */}
            <div className="w-[30%] min-w-[280px] hidden md:block border-r border-black/5 bg-[#f7fcf8]">
              <BookingSidebar step={step} />
            </div>

            {/* Right Content */}
            <div
              data-lenis-prevent
              className={`flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 pt-4 md:pt-6 lg:pt-6 relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3e8914]/40 hover:[&::-webkit-scrollbar-thumb]:bg-[#3e8914]/60 [&::-webkit-scrollbar-thumb]:rounded-full ${step === 6 ? "p-0 md:p-0 lg:p-0" : ""}`}
            >
              <div className="absolute top-1 right-16 z-10 pointer-events-none">
                <DotLottieReact src="https://lottie.host/6d23bfae-ca52-443b-8cf3-8cab57e69bc9/Fu7lMkANCg.lottie" loop autoplay className="w-[70px] h-[70px]" />
              </div>

              {/* key: a different service starts a fresh booking */}
              <HelpNowBookingFlow key={service.slug} service={service} onClose={onClose} onStepChange={setStep} initialCoupon={initialCoupon} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
