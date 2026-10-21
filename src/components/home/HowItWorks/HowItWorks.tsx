"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Home, CalendarDays, MapPin, CreditCard, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: Home, number: "01", title: "Choose Service", desc: "Select the service you need from our wide range of cleaning options." },
  { icon: CalendarDays, number: "02", title: "Select Date & Time", desc: "Pick your preferred date and convenient time slot for the service." },
  { icon: MapPin, number: "03", title: "Add Details", desc: "Enter your address and any additional details about your home." },
  { icon: CreditCard, number: "04", title: "Make Payment", desc: "Pay securely online via UPI, card, or net banking. Safe & easy." },
  { icon: CheckCircle2, number: "05", title: "Maid Arrives", desc: "Your verified maid arrives on time and clean. Guaranteed satisfaction." },
];

// Scroll-driven: as the section moves up the screen a gold line fills along
// the steps (left → right, top → bottom on phones) and each step lights up
// when the line reaches it. Cards rise in one after another.
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.85", "center 0.45"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const fill = useTransform(progress, [0, 1], [0, 1]);
  // How many steps the line has reached (0–5).
  const [reached, setReached] = useState(0);
  useMotionValueEvent(progress, "change", (value) => {
    const next = Math.min(steps.length, Math.floor(value * (steps.length - 1) + 1.0001));
    setReached(value <= 0.02 ? 0 : next);
  });
  const lit = (i: number) => reduceMotion || i < reached;

  return (
    <section ref={sectionRef} id="how-it-works" className="relative overflow-hidden bg-[#fffbf2] px-4 py-16 md:px-6 md:py-20">
      {/* Soft warm glows */}
      <span aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#f5a623]/10 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#f5a623]/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]">Your Guide</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-tight text-[#1a1a1a]">
            Simple Steps to Book a <span className="text-[#f5a623]">Maid</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Track + scroll-filled line: across on desktop, down on phones */}
          <div aria-hidden className="absolute left-[10%] right-[10%] top-8 hidden h-[3px] rounded-full bg-[#f5a623]/15 md:block">
            <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-[#ffcf24] to-[#f5a623] shadow-[0_0_12px_rgba(245,166,35,0.6)]" style={{ scaleX: reduceMotion ? 1 : fill }} />
          </div>
          <div aria-hidden className="absolute bottom-8 left-8 top-8 w-[3px] rounded-full bg-[#f5a623]/15 md:hidden">
            <motion.div className="w-full h-full origin-top rounded-full bg-gradient-to-b from-[#ffcf24] to-[#f5a623]" style={{ scaleY: reduceMotion ? 1 : fill }} />
          </div>

          <ol className="relative flex flex-col gap-8 md:flex-row md:gap-0">
            {steps.map((s, i) => {
              const on = lit(i);
              return (
                <motion.li
                  key={s.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 items-start gap-5 md:flex-col md:items-center md:gap-0 md:px-3 md:text-center"
                >
                  <div className="relative shrink-0 md:mb-6">
                    <motion.div
                      animate={{ scale: on ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className={`relative flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-[#f5a623] transition-colors duration-500 ${
                        on ? "bg-gradient-to-b from-[#ffcf24] to-[#f5a623] shadow-[0_10px_26px_-8px_rgba(245,166,35,0.9)]" : "bg-white shadow-[0_4px_16px_rgba(245,166,35,0.18)]"
                      }`}
                    >
                      {/* Ring that pings once as the step lights up */}
                      {on && !reduceMotion && (
                        <motion.span
                          aria-hidden
                          initial={{ scale: 1, opacity: 0.7 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full border-2 border-[#f5a623]"
                        />
                      )}
                      <s.icon className={`h-7 w-7 transition-colors duration-500 ${on ? "text-white" : "text-[#f5a623]"}`} />
                      <span
                        className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold transition-colors duration-500 ${
                          on ? "bg-[#1a1a1a] text-white" : "bg-[#f5a623] text-white"
                        }`}
                      >
                        {s.number}
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{ y: on ? -4 : 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-2xl border px-4 py-3 transition-[background-color,border-color,box-shadow] duration-500 md:w-full ${
                      on ? "border-[#f5a623]/40 bg-white shadow-[0_14px_30px_-18px_rgba(245,166,35,0.7)]" : "border-transparent bg-transparent"
                    }`}
                  >
                    <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-[#1a1a1a]">{s.title}</h3>
                    <p className="text-[12.5px] leading-relaxed text-[#777]">{s.desc}</p>
                  </motion.div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
