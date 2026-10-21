"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import type { HelpNowService } from "@/data/helpNowServices";
import { BookingStepper } from "./BookingModal/BookingStepper";
import { Step1 } from "./BookingModal/Step1";
import { Step2 } from "./BookingModal/Step2";
import { Step3 } from "./BookingModal/Step3";
import { Step4 } from "./BookingModal/Step4";
import { Step5 } from "./BookingModal/Step5";
import { useHelpNowBooking, type BookingSummary } from "./useHelpNowBooking";

const pathVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.2, ease: "easeInOut", delay: 0.4 }, opacity: { duration: 0.3, delay: 0.4 } },
  },
};

// The Help Now booking flow — "Book a Service" heading, the five-step
// stepper and the steps — used inside the booking modal and on the service
// pages. `onStepChange` lets the modal's sidebar follow along.
export function HelpNowBookingFlow({
  service,
  onClose,
  closeLabel,
  onStepChange,
  onSummaryChange,
  initialCoupon,
}: {
  service: HelpNowService;
  // A coupon picked before opening (pricing section); applied on Review.
  initialCoupon?: string;
  onClose?: () => void;
  closeLabel?: string;
  onStepChange?: (step: number) => void;
  onSummaryChange?: (summary: BookingSummary) => void;
}) {
  const b = useHelpNowBooking(service, onSummaryChange, initialCoupon);
  const top = useRef<HTMLDivElement>(null);
  const done = Boolean(b.confirmation);

  useEffect(() => {
    onStepChange?.(done ? 6 : b.step);
  }, [b.step, done, onStepChange]);

  // Bring the top of the flow into view on every step change.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [b.step, done]);

  return (
    <div ref={top} className="scroll-mt-24">
      {!done && (
        <>
          <div className="mb-5">
            <h2 className="text-[22px] font-sans font-black uppercase tracking-tight text-ink leading-tight flex items-center flex-wrap gap-x-1">
              <span>Book a</span>
              <span className="text-[#f5a623] relative inline-block">
                Service
                <motion.svg className="absolute -bottom-1 left-0 w-full h-2.5" viewBox="0 0 150 10" fill="none" initial="hidden" animate="visible">
                  <motion.path d="M0 8 L 150 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={pathVariants} />
                </motion.svg>
              </span>
              <span className="text-[16px] text-[#0D47A1] mt-0.5 whitespace-nowrap">- {service.name}</span>
            </h2>
            <p className="text-ink/60 text-xs mt-1.5 font-medium">
              Verified maids <span className="inline-block w-1 h-1 rounded-full bg-black/20 mx-1 align-middle" /> ₹{service.ratePerHour}/hr per maid{" "}
              <span className="inline-block w-1 h-1 rounded-full bg-black/20 mx-1 align-middle" /> Same-day service available
            </p>
          </div>

          <BookingStepper step={b.step} />
        </>
      )}

      {b.error && !done && (
        <div role="alert" className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-medium text-red-700">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {b.error}
        </div>
      )}

      <div className={done ? "mt-0" : "mt-6"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={done ? "done" : b.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {b.step === 1 && <Step1 b={b} />}
            {b.step === 2 && <Step2 b={b} />}
            {b.step === 3 && <Step3 b={b} />}
            {b.step === 4 && <Step4 b={b} />}
            {b.step === 5 && <Step5 b={b} onClose={onClose} closeLabel={closeLabel} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
