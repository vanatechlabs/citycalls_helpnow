"use client";

import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { BadgeCheck, Clock, IndianRupee, ShieldCheck } from "lucide-react";
import { findHelpNowService, type HelpNowServiceSlug } from "@/data/helpNowServices";
import { helpNowImageUrl } from "@/lib/api/helpNowHome";
import type { HelpNowServiceHeroContent } from "@/lib/api/helpNowServiceHero";

// Same treatment as the City Calls service-page hero (text with a soft
// glow over a full-bleed photo, glass chip, word-by-word title,
// glass feature icons, parallax on scroll) — without a dark overlay, in Help
// Now's font and gold.
const HERO_FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
// No text shadow — plain dark text on the photo.
const HERO_TEXT_SHADOW = "none";
const INK = "#0f172a";
const GOLD = "#f5b400";

// Built-in features; the admin's own (in the same order) take these icons.
const FEATURE_ICONS = [BadgeCheck, ShieldCheck, IndianRupee, Clock];
const DEFAULT_FEATURES = [
  { title: "Trained", subtitle: "Professionals" },
  { title: "Safe &", subtitle: "Reliable" },
  { title: "Hourly", subtitle: "Pricing" },
  { title: "Flexible", subtitle: "Time Slots" },
];

// The heading as up to two lines: the text before the highlight (dark), then
// the highlight and anything after it (gold, then dark).
function headingLines(heading: string, highlight: string) {
  const words = (text: string, gold: boolean) => text.split(/\s+/).filter(Boolean).map((word) => ({ word, gold }));
  const index = highlight ? heading.indexOf(highlight) : -1;
  if (index < 0) return [words(heading, false)];
  const before = words(heading.slice(0, index), false);
  const rest = [...words(highlight, true), ...words(heading.slice(index + highlight.length), false)];
  return before.length ? [before, rest] : [rest];
}

const lineVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

// Each word rises out of its line mask while coming into focus.
const wordVariants: Variants = {
  hidden: { y: "110%", opacity: 0, filter: "blur(8px)" },
  visible: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

// Takes the slug, not the service — the service holds an icon component,
// which can't be passed from the (server) page. `hero` is the admin's content
// (Website Section → Help Now → Service Page Hero); null shows the built-in one.
export function ServiceHero({ slug, hero }: { slug: HelpNowServiceSlug; hero?: HelpNowServiceHeroContent | null }) {
  const service = findHelpNowService(slug);
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  if (!service) return null;

  const content = hero ?? {
    subheading: "Trusted Home Services",
    heading: `Professional ${service.name}`,
    highlight: service.name,
    description: service.short,
    features: DEFAULT_FEATURES,
    image: service.heroImage,
    imageAlt: `${service.name} by a Help Now helper`,
  };
  const lines = headingLines(content.heading, content.highlight);
  const image = content.image ? helpNowImageUrl(content.image, 1920) : service.heroImage;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#fffaf2] pt-[76px] text-[#0f172a]"
      style={{ perspective: "1000px", fontFamily: HERO_FONT }}
    >
      <motion.div
        role="img"
        aria-label={content.imageAlt || `${service.name} by a Help Now helper`}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full bg-cover bg-[70%_center]"
        style={{ backgroundImage: `url(${image})`, y: reduceMotion ? 0 : bgY }}
      />

      <div className="container-x relative mx-auto flex max-w-7xl items-center px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <motion.div
          className="max-w-2xl transform-gpu"
          style={reduceMotion ? undefined : { y, opacity, rotateX, scale, transformOrigin: "top center" }}
        >
          {/* Subtitle — frosted glass chip with a live dot */}
          {content.subheading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <div className="relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-white/40 bg-gradient-to-br from-white/25 via-white/10 to-white/[0.06] px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150">
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5a623] shadow-[0_0_8px_rgba(245,166,35,0.9)]" />
                </span>
                <span className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#0f172a]" style={{ textShadow: HERO_TEXT_SHADOW }}>
                  {content.subheading}
                </span>
              </div>
            </motion.div>
          )}

          {/* Title — per-word slide-up reveal, masked per line */}
          <h1
            className="mb-4 text-[32px] font-extrabold leading-[1.12] tracking-tight sm:text-[38px] md:text-[44px] lg:text-[min(52px,3.6vw,7vh)]"
            style={{ letterSpacing: "-0.01em", textShadow: HERO_TEXT_SHADOW, color: INK }}
          >
            {lines.map((line, li) => (
              <motion.span key={li} variants={lineVariants} initial="hidden" animate="visible" className="block overflow-hidden pb-1">
                {/* Real spaces between words (and lines), so the H1 reads as text
                    — "Dish Washing in Delhi NCR", not "DishWashinginDelhiNCR". */}
                {line.map(({ word, gold }, wi) => (
                  <Fragment key={wi}>
                    <motion.span
                      variants={wordVariants}
                      className="inline-block will-change-transform"
                      style={gold ? { color: GOLD } : undefined}
                    >
                      {word}
                    </motion.span>{" "}
                  </Fragment>
                ))}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 max-w-xl text-[14px] font-semibold leading-relaxed tracking-wide text-slate-800 md:text-[15px] lg:text-[clamp(14px,2.6vh,16px)]"
            style={{ textShadow: HERO_TEXT_SHADOW }}
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-5 text-xs font-bold text-[#0f172a] md:gap-8"
          >
            {content.features.map(({ title, subtitle }, i) => {
              const Icon = FEATURE_ICONS[i] ?? BadgeCheck;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md">
                    <Icon size={20} className="text-[#e08e0b]" />
                  </div>
                  <span style={{ textShadow: HERO_TEXT_SHADOW }}>
                    {title}
                    <br />
                    {subtitle}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
