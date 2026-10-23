"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  Heart,
  Sparkles,
} from "lucide-react";
import { helpNowServices, type HelpNowServiceSlug } from "@/data/helpNowServices";
import { BookingModal } from "@/components/booking/BookingModal";
import { helpNowImageUrl, splitHighlight, type HelpNowPopular } from "@/lib/api/helpNowHome";
import { useHelpNowRates } from "@/components/rates/HelpNowRates";

// Built-in content, shown if the CMS (Admin → Website Section → Help Now →
// Popular Services) can't be reached.
const defaultPopular: HelpNowPopular = {
  eyebrow: "Our Popular Services",
  heading: "Choose Your Cleaning Service — one tap away.",
  highlight: "— one tap away.",
  description: "Verified helpers, transparent pricing, and flexible booking for every home cleaning need.",
  cards: helpNowServices.map((service) => ({
    slug: service.slug,
    description: service.short,
    image: service.image,
    alt: `${service.name} by a Help Now helper`,
    badge: service.slug === "dish-washing" ? "Most Booked" : "",
  })),
};

// One card per service, in the admin's order; name and price are always the
// booking ones. The hover image is the next card's.
function cardsFrom(popular: HelpNowPopular, rateOf: (slug: string) => number) {
  const cards = popular.cards.flatMap((card) => {
    const service = helpNowServices.find((s) => s.slug === card.slug);
    return service ? [{ card, service }] : [];
  });
  const imageOf = ({ card, service }: (typeof cards)[number]) => (card.image ? helpNowImageUrl(card.image, 640) : service.image);
  return cards.map((entry, i) => ({
    id: i + 1,
    slug: entry.service.slug,
    href: `/services/${entry.service.slug}`,
    name: entry.service.name,
    short: entry.card.description || entry.service.short,
    price: `₹${rateOf(entry.service.slug)}/hr`,
    badge: entry.card.badge,
    image: imageOf(entry),
    alt: entry.card.alt || entry.service.name,
    hoverImage: imageOf(cards[(i + 1) % cards.length]),
  }));
}

// Words of a heading part, each rising from its own mask; real spaces between
// them so the heading reads as text.
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).filter(Boolean).map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

const lineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const wordVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// `popular` comes from the CMS via the home page: undefined means it couldn't
// be reached (built-in content), null means it's switched off.
export function ServicesGrid({ popular = defaultPopular }: { popular?: HelpNowPopular | null } = {}) {
  const services = cardsFrom(popular ?? defaultPopular, useHelpNowRates());
  const [before, highlight, after] = splitHighlight(popular?.heading ?? "", popular?.highlight ?? "");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // Booking modal for the clicked service.
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<HelpNowServiceSlug>(helpNowServices[0].slug);

  const sectionRef = useRef(null);

  // Triple services array for seamless infinite marquee loop
  const infiniteServices = [...services, ...services, ...services];

  // Infinite smooth scroll animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const cardWidth = 320; // card width + gap
        const totalWidth = cardWidth * services.length;
        const newPosition = prev + 1;

        if (newPosition >= totalWidth) {
          return 0;
        }
        return newPosition;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [isPlaying, services.length]);

  if (!popular || services.length === 0) return null;

  const handleOpenBooking = (slug: HelpNowServiceSlug) => {
    setSelectedSlug(slug);
    setModalOpen(true);
  };

  const handlePrevious = () => {
    setScrollPosition((prev) => Math.max(0, prev - 320));
  };

  const handleNext = () => {
    setScrollPosition((prev) => prev + 320);
  };

  return (
    <>
      <section ref={sectionRef} id="services" className="pt-12 pb-14 bg-slate-50 overflow-hidden font-sans">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="h-px w-8 bg-[#f5a623]" />
                <span className="uppercase tracking-[0.3em] text-[#b5730f] font-bold text-[12px]">
                  {popular.eyebrow}
                </span>
                <div className="h-px w-8 bg-[#f5a623]" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-slate-900 leading-tight relative inline-block">
                <span className="inline overflow-hidden">
                  <motion.span
                    variants={lineVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="inline"
                  >
                    <Words text={before} />
                  </motion.span>
                </span>
                {highlight && <span className="text-[#f5a623] relative inline-block">
                  <span className="inline overflow-hidden">
                    <motion.span
                      variants={lineVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delayChildren: 0.35 }}
                      className="inline"
                    >
                      <Words text={highlight} />
                    </motion.span>
                  </span>
                  <motion.svg
                    viewBox="0 0 200 16"
                    preserveAspectRatio="none"
                    className="absolute left-0 -bottom-2 w-full h-3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.75 }}
                  >
                    <path
                      d="M2 8 Q 50 14, 100 8 T 198 8"
                      fill="none"
                      stroke="#f5a623"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>}
                {after && <> {after}</>}
              </h2>

              {popular.description && (
                <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mt-2 font-medium">
                  {popular.description}
                </p>
              )}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevious}
                className="p-2.5 rounded-full border-2 border-slate-200 hover:border-[#f5a623] hover:bg-[#fff6e8] text-slate-800 transition-colors shadow-sm cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-full border-2 border-slate-200 hover:border-[#f5a623] hover:bg-[#fff6e8] text-slate-800 transition-colors shadow-sm cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full border-2 border-slate-200 hover:border-[#f5a623] hover:bg-[#fff6e8] text-slate-800 transition-colors shadow-sm cursor-pointer"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>
          </div>

          {/* Infinite Marquee Track */}
          <div className="relative overflow-hidden pt-2 pb-6">
            <div
              className="flex gap-6 transition-transform"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                willChange: "transform",
              }}
            >
              {infiniteServices.map((service, index) => (
                <div
                  key={`${service.id}-${index}`}
                  className="flex-shrink-0 w-[295px]"
                  onMouseEnter={() => setHoveredId(index)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className="bg-white rounded-xl overflow-hidden border border-slate-200/90 transition-all duration-300 group hover:shadow-xl hover:border-[#f5a623]"
                    style={{
                      boxShadow:
                        "rgba(60, 64, 67, 0.12) 0px 1px 3px 0px, rgba(60, 64, 67, 0.08) 0px 1px 2px 0px",
                    }}
                  >
                    {/* Image with Hover Change & Overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer">
                      <button type="button" onClick={() => handleOpenBooking(service.slug)} className="absolute inset-0 z-0 cursor-pointer" aria-label={`Book ${service.name}`}>
                        {/* Default Image */}
                        <img
                          src={service.image}
                          alt={service.alt}
                          className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
                            hoveredId === index ? "opacity-0 scale-110" : "opacity-100 scale-100"
                          }`}
                        />

                        {/* Hover Image */}
                        <img
                          src={service.hoverImage}
                          alt=""
                          className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
                            hoveredId === index ? "opacity-100 scale-100" : "opacity-0 scale-110"
                          }`}
                        />
                      </button>

                      {/* Badge, e.g. "Most Booked" */}
                      {service.badge && (
                        <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-[#f5a623] to-[#e07a1f] text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 flex items-center gap-1 pointer-events-none">
                          <Sparkles size={10} /> {service.badge}
                        </div>
                      )}

                      {/* Hover Overlay with Icons */}
                      <div
                        className={`absolute top-2.5 right-2.5 flex gap-1.5 transition-opacity duration-300 z-20 ${
                          hoveredId === index && !service.badge ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button className="p-1.5 bg-white/95 rounded-full hover:bg-white text-slate-800 transition-colors shadow-md cursor-pointer">
                          <Heart size={13} className="hover:text-red-500" />
                        </button>
                        <Link
                          href={service.href}
                          aria-label={`View ${service.name} page`}
                          className="p-1.5 bg-white/95 rounded-full hover:bg-[#f5a623] hover:text-white text-slate-800 transition-colors shadow-md cursor-pointer flex items-center justify-center"
                        >
                          <Eye size={13} />
                        </Link>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 pt-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <button type="button" onClick={() => handleOpenBooking(service.slug)} className="block text-left cursor-pointer">
                          <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-[#b5730f] uppercase tracking-wider transition-colors duration-300">
                            {service.name}
                          </h3>
                        </button>
                      </div>

                      <p className="text-slate-500 text-[12.5px] leading-relaxed mb-3 line-clamp-2 min-h-[38px]">
                        {service.short}
                      </p>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-red-500 font-semibold uppercase tracking-wider">
                            Starting from
                          </span>
                          <span className="text-[14px] font-semibold text-emerald-600">
                            {service.price}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenBooking(service.slug)}
                          className="inline-flex items-center gap-1.5 text-[#b5730f] text-[11px] font-bold uppercase tracking-widest hover:text-slate-900 transition-colors duration-300 cursor-pointer"
                        >
                          Book Service
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Drawer / Modal */}
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceSlug={selectedSlug} />
    </>
  );
}

