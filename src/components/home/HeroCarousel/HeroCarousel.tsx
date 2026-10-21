"use client";

import { Fragment, useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { preload } from "react-dom";
import {
  ChevronRight, ShieldCheck, Clock, Star, Zap, Sparkles, BookOpen, BadgeCheck, Heart, Home, Users,
  type LucideIcon,
} from "lucide-react";
import { helpNowImageUrl, type HelpNowHeroSlide, type HelpNowMarquee } from "@/lib/api/helpNowHome";
const h1 = "/assets/Banner/h1.png";
const h2 = "/assets/Banner/h2.png";
const h3 = "/assets/Banner/h3.png";

interface Slide {
  id: number;
  image: string;
  alt?: string;
  badge: string;
  title: string[];
  description: string;
  buttons?: { primary?: { text: string; link: string }; secondary?: { text: string; link: string } };
}

// Built-in content, shown if the CMS (Admin → Website Section → Help Now)
// can't be reached.
const defaultSlides: Slide[] = [
  {
    id: 1,
    image: h1,
    badge: "PREMIUM MAID SERVICES",
    title: ["Your Home,", "Our Priority."],
    description:
      "Transform your lifestyle with our expert, background-checked maids. Dedicated home care tailored for your daily comfort.",
  },
  {
    id: 2,
    image: h2,
    badge: "SAME-DAY HOURLY BOOKING",
    title: ["Book in Minutes,", "Relax for Hours."],
    description:
      "Flexible hourly booking — choose your preferred time slot, and we handle the rest with perfection.",
  },
  {
    id: 3,
    image: h3,
    badge: "100% SATISFACTION GUARANTEED",
    title: ["Expert Maids,", "Spotless Homes."],
    description:
      "Background-verified professionals arrive on time with complete supplies. Transparent pricing without hidden fees.",
  },
];

const MARQUEE_ICONS: Record<string, LucideIcon> = { BookOpen, Clock, ShieldCheck, Star, Sparkles, BadgeCheck, Heart, Home, Zap, Users };

const defaultMarquee: HelpNowMarquee = {
  items: [
    { icon: "BookOpen", label: "Book trusted maids by the hour" },
    { icon: "Clock", label: "Flexible timings" },
    { icon: "ShieldCheck", label: "Safe & secure" },
    { icon: "Star", label: "100% satisfaction" },
    { icon: "Sparkles", label: "A part of CityCalls" },
  ],
};

const DEFAULT_BUTTONS = {
  primary: { text: "Book Service Now", link: "#services" },
  secondary: { text: "Explore Process", link: "#how-it-works" },
};

function fromCms(slides: HelpNowHeroSlide[]): Slide[] {
  return slides.map((slide, i) => ({
    id: i + 1,
    image: helpNowImageUrl(slide.image),
    alt: slide.alt,
    badge: slide.badge,
    title: [slide.titleLine1, slide.titleLine2],
    description: slide.description,
    buttons: {
      primary: slide.primaryButtonText ? { text: slide.primaryButtonText, link: slide.primaryButtonLink || "#services" } : undefined,
      secondary: slide.secondaryButtonText ? { text: slide.secondaryButtonText, link: slide.secondaryButtonLink || "#how-it-works" } : undefined,
    },
  }));
}

const trustBadges = [
  { icon: ShieldCheck, label: "Verified Maids" },
  { icon: Clock, label: "Hourly Service" },
  { icon: Star, label: "Background Checked" },
  { icon: Zap, label: "Safe & Trusted" },
];

// Each slide's time on screen.
const INTERVAL = 3000;

// How long the old slide's text takes to leave before the new text comes in.
const TEXT_EXIT_MS = 450;

// `cmsSlides` / `marquee` come from the CMS via the home page; undefined
// means it couldn't be reached (built-in content), a null marquee is hidden.
export function HeroCarousel({ cmsSlides, marquee = defaultMarquee }: { cmsSlides?: HelpNowHeroSlide[]; marquee?: HelpNowMarquee | null } = {}) {
  const slides = cmsSlides?.length ? fromCms(cmsSlides) : defaultSlides;
  // `current` drives the image (changes at once), `shown` the text (changes
  // once the old text has left). `tick` restarts the image transition.
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [shown, setShown] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hold the opening (all animations paused) until the first image has
  // loaded, so the first transition is seen instead of playing over a blank.
  const [ready, setReady] = useState(false);
  const firstImage = slides[0]?.image;
  // Fetch it with the page's HTML rather than after hydration.
  if (firstImage) preload(firstImage, { as: "image", fetchPriority: "high" });

  useEffect(() => {
    if (!firstImage) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const img = new Image();
    img.onload = start;
    img.onerror = start;
    img.src = firstImage;
    const fallback = setTimeout(start, 2500);
    return () => {
      done = true;
      clearTimeout(fallback);
    };
  }, [firstImage]);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setPrev(current);
      setCurrent(index);
      setTick((t) => t + 1);
      setLeaving(true);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => {
        setShown(index);
        setTextKey((k) => k + 1);
        setLeaving(false);
      }, TEXT_EXIT_MS);
    },
    [current]
  );

  // Autoplay; restarts whenever the slide changes, so a click gets a full turn.
  useEffect(() => {
    if (!ready || slides.length < 2) return;
    const t = setTimeout(() => goTo((current + 1) % slides.length), INTERVAL);
    return () => clearTimeout(t);
  }, [ready, current, tick, goTo, slides.length]);

  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const slide = slides[shown] ?? slides[0];
  const buttons = slide.buttons ?? DEFAULT_BUTTONS;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap');

        .hn-hero {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          /* Banners are 2.25:1 — follow that, so the image isn't cropped/zoomed. */
          height: clamp(560px, calc(100vw / 2.25), 92vh);
          overflow: hidden;
          background: #f6f1e7;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 96px;
        }

        /* ── Cinematic background: every slide is a layer; the new one wipes in
           on a diagonal over the old one, which recedes underneath. ── */
        .hn-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0;
          overflow: hidden;
          perspective: 1600px; /* gives the image's zoom real 3D depth */
        }
        .hn-layer-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: right center; /* the maid is on the right */
          transform-origin: 72% 40%; /* zoom towards her */
          will-change: transform;
        }
        .hn-layer.is-prev { opacity: 1; z-index: 1; }
        .hn-layer.is-prev .hn-layer-img {
          animation: hn-recede 1.5s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        .hn-layer.is-active {
          opacity: 1;
          z-index: 2;
          animation: hn-wipe 1.5s cubic-bezier(0.77, 0, 0.18, 1) both;
        }
        .hn-layer.is-active .hn-layer-img {
          animation: hn-settle ${INTERVAL + 1500}ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        /* Nothing plays until the first image is in. */
        .hn-hero:not(.is-ready) *,
        .hn-hero:not(.is-ready) *::before,
        .hn-hero:not(.is-ready) *::after {
          animation-play-state: paused !important;
        }
        @keyframes hn-wipe {
          from { clip-path: polygon(100% 0, 110% 0, 110% 100%, 118% 100%); }
          to   { clip-path: polygon(-18% 0, 110% 0, 110% 100%, 0% 100%); }
        }
        /* 3D camera zoom: the image starts close to the camera and tilted, swings
           back flat to the full frame, then dollies slowly in towards the maid. */
        @keyframes hn-settle {
          0%   { transform: translateZ(440px) rotateY(-10deg) rotateX(4deg); filter: brightness(1.18) saturate(1.2) contrast(1.05) blur(4px); }
          26%  { transform: translateZ(0) rotateY(0) rotateX(0); filter: brightness(1) saturate(1.05) contrast(1) blur(0); }
          100% { transform: translateZ(150px) rotateY(-2deg) rotateX(0.6deg); filter: brightness(1) saturate(1.05) contrast(1) blur(0); }
        }
        @keyframes hn-recede {
          from { transform: translateZ(150px) rotateY(-2deg) rotateX(0.6deg); filter: brightness(1); }
          to   { transform: translateZ(260px) translateX(-4%) rotateY(5deg); filter: brightness(0.94) blur(4px); }
        }

        /* A soft golden light beam that rides the wipe's edge. */
        .hn-beam {
          position: absolute;
          top: -10%;
          bottom: -10%;
          left: 0;
          width: 22vw;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,236,190,0.55) 45%, rgba(255,255,255,0.85) 52%, rgba(255,236,190,0.4) 60%, rgba(255,255,255,0) 100%);
          mix-blend-mode: soft-light;
          filter: blur(6px);
          transform: translateX(110vw) skewX(-8deg);
          animation: hn-beam 1.5s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        @keyframes hn-beam {
          0%   { transform: translateX(105vw) skewX(-8deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(-30vw) skewX(-8deg); opacity: 0; }
        }

        /* Warm light flare that blooms over the maid as each slide lands. */
        .hn-flare {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background:
            radial-gradient(circle at 74% 34%, rgba(255, 244, 214, 0.9) 0%, rgba(255, 214, 120, 0.35) 18%, rgba(255, 214, 120, 0) 42%),
            radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 22%);
          mix-blend-mode: screen;
          opacity: 0;
          animation: hn-flare 1.6s ease-out 0.55s both;
        }
        @keyframes hn-flare {
          0%   { opacity: 0; transform: scale(0.85); }
          35%  { opacity: 0.75; }
          100% { opacity: 0; transform: scale(1.15); }
        }
        /* Soft cinematic vignette, kept off the text side. */
        .hn-vignette {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: radial-gradient(ellipse 75% 95% at 68% 48%, rgba(0, 0, 0, 0) 60%, rgba(40, 24, 0, 0.16) 100%);
        }

        /* Top dark gradient overlay for navbar logo & text contrast */
        .hn-hero-overlay-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 70%, rgba(0,0,0,0) 100%);
          z-index: 2;
          pointer-events: none;
        }

        /* Content Container */
        .hn-hero-content {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 24px 48px;
          color: #0f172a;
        }

        .hn-hero-inner-max {
          max-width: 620px;
        }

        /* ── Text: enters line by line from behind a mask; leaves upward ── */
        .hn-gold-line {
          transform-origin: left center;
          animation: hn-grow 0.9s cubic-bezier(0.19, 1, 0.22, 1) calc(0.1s) both;
        }
        .hn-badge-text {
          animation: hn-track-in 1.1s cubic-bezier(0.19, 1, 0.22, 1) calc(0.18s) both;
        }
        .hn-line { display: block; }
        .hn-line.is-accent { font-size: 0.84em; margin-top: 0.08em; } /* gold line a touch smaller */
        /* Each word rises from behind its own mask, one after another. */
        .hn-word {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          padding-bottom: 0.1em;
          margin-bottom: -0.1em;
        }
        .hn-line-inner {
          display: inline-block;
          transform-origin: left bottom;
          animation: hn-line-up 1.1s cubic-bezier(0.19, 1, 0.22, 1) calc(0.28s + var(--i, 0) * 0.09s) both;
        }
        /* Gold line gets a single shine once it has landed. */
        .hn-line.is-accent .hn-line-inner {
          color: transparent;
          background: linear-gradient(110deg, #d97706 0%, #d97706 40%, #fde3a1 50%, #d97706 60%, #d97706 100%);
          background-size: 260% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          animation:
            hn-line-up 1.1s cubic-bezier(0.19, 1, 0.22, 1) calc(0.28s + var(--i, 0) * 0.09s) both,
            hn-shine 1.3s ease-in-out calc(1.15s + var(--i, 0) * 0.09s) both;
        }
        .hn-anim-desc {
          animation: hn-rise-blur 1.1s cubic-bezier(0.19, 1, 0.22, 1) calc(0.58s) both;
        }
        .hn-anim-btns {
          animation: hn-rise-blur 1.1s cubic-bezier(0.19, 1, 0.22, 1) calc(0.72s) both;
        }

        .hn-hero-content.is-leaving .hn-subtitle-wrap,
        .hn-hero-content.is-leaving .hn-line-inner,
        .hn-hero-content.is-leaving .hn-anim-desc,
        .hn-hero-content.is-leaving .hn-anim-btns {
          animation: hn-leave 0.42s cubic-bezier(0.55, 0, 1, 0.45) both;
        }
        .hn-hero-content.is-leaving .hn-line-inner { animation-name: hn-line-out; }
        .hn-hero-content.is-leaving .hn-line-inner { animation-delay: calc(var(--i, 0) * 0.025s); }
        .hn-hero-content.is-leaving .hn-anim-desc { animation-delay: 0.06s; }
        .hn-hero-content.is-leaving .hn-anim-btns { animation-delay: 0.1s; }

        @keyframes hn-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes hn-track-in {
          from { opacity: 0; letter-spacing: 0.6em; filter: blur(8px); }
          to   { opacity: 1; letter-spacing: 0.25em; filter: blur(0); }
        }
        @keyframes hn-line-up {
          from { transform: translateY(115%) rotate(6deg); filter: blur(4px); }
          to   { transform: translateY(0) rotate(0); filter: blur(0); }
        }
        @keyframes hn-shine {
          from { background-position: 100% 0; }
          to   { background-position: 0% 0; }
        }
        @keyframes hn-rise-blur {
          from { opacity: 0; transform: translateY(26px); filter: blur(8px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes hn-leave {
          to { opacity: 0; transform: translateY(-14px); filter: blur(6px); }
        }
        @keyframes hn-line-out {
          to { transform: translateY(-110%); }
        }

        /* Subtitle Bar */
        .hn-subtitle-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .hn-gold-line {
          width: 36px;
          height: 2px;
          background: #e09500;
        }
        .hn-badge-text {
          font-size: 12px;
          font-weight: 800;
          color: #d97706;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Title - Dark Text */
        .hn-hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          color: #0f172a;
          text-shadow: none;
        }

        /* Description - Dark Text */
        .hn-hero-desc {
          font-size: clamp(14.5px, 1.4vw, 16px);
          color: #334155;
          line-height: 1.65;
          font-weight: 600;
          margin-bottom: 28px;
          max-width: 560px;
          text-shadow: none;
        }

        /* Buttons */
        .hn-hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hn-btn-cc-gold {
          position: relative;
          overflow: hidden;
          padding: 12px 28px;
          background: #f5a623;
          color: #000000;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border: 1px solid #f5a623;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 4px 14px rgba(245, 166, 35, 0.4);
          transition: all 0.4s ease;
        }
        .hn-btn-cc-gold:hover {
          color: #ffffff;
          background: #0f172a;
          border-color: #0f172a;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.3);
        }

        .hn-btn-cc-outline {
          position: relative;
          overflow: hidden;
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.85);
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border: 1px solid #0f172a;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          backdrop-filter: blur(8px);
          transition: all 0.4s ease;
        }
        .hn-btn-cc-outline:hover {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* Slide Indicator (ccsaloon style) */
        .hn-indicators {
          position: absolute;
          bottom: 32px;
          right: 36px;
          z-index: 20;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .hn-counter {
          font-size: 12px;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.45);
          letter-spacing: 0.12em;
          margin-right: 4px;
          font-variant-numeric: tabular-nums;
        }
        .hn-counter b {
          display: inline-block;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-right: 4px;
          animation: hn-rise-blur 0.7s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        .hn-indicator-btn {
          position: relative;
          overflow: hidden;
          width: 28px;
          height: 4px;
          padding: 0;
          background: rgba(0, 0, 0, 0.18);
          border: none;
          cursor: pointer;
          transition: width 0.5s cubic-bezier(0.19, 1, 0.22, 1), background 0.3s ease;
          border-radius: 2px;
        }
        .hn-indicator-btn:hover { background: rgba(0, 0, 0, 0.32); }
        .hn-indicator-btn.active { width: 60px; }
        /* Fills over the slide's time on screen. */
        .hn-indicator-fill {
          position: absolute;
          inset: 0;
          background: #f5a623;
          transform-origin: left center;
          animation: hn-fill ${INTERVAL}ms linear both;
        }
        @keyframes hn-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* Bottom Marquee Strip */
        .hn-strip {
          background: #f5a623;
          padding: 12px 0;
          overflow: hidden;
          position: relative;
          z-index: 10;
          box-shadow: none;
        }
        .hn-strip-track {
          display: flex;
          width: max-content;
          animation: hn-marquee 24s linear infinite;
          align-items: center;
        }
        @keyframes hn-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hn-strip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 28px;
          font-size: 11.5px;
          font-weight: 600;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
          text-shadow: none;
        }
        .hn-strip-icon {
          color: #ffffff;
          flex-shrink: 0;
          filter: drop-shadow(0 0 1px rgba(0,0,0,0.2));
        }
        .hn-strip-dot { color: #ffffff; font-size: 14px; text-shadow: none; }

        @media (max-width: 1023px) {
          .hn-hero { height: auto; min-height: 640px; }
          .hn-layer-img { background-position: 72% center; }
          .hn-beam { width: 40vw; }
        }
        @media (max-width: 768px) {
          .hn-hero { min-height: 90vh; padding-top: 100px; }
          .hn-hero-content { padding: 40px 20px 60px; }
          .hn-hero-title { font-size: 30px; }
          .hn-indicators { right: 20px; bottom: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hn-hero *, .hn-hero *::before, .hn-hero *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
          .hn-beam { display: none; }
        }

        /* ── Tailored Scaling for 15.6" Laptops & Larger Displays ── */
        @media (min-width: 1360px) {
          .hn-hero-inner-max {
            max-width: 760px;
          }
          .hn-badge-text {
            font-size: 13px;
          }
          .hn-gold-line {
            width: 42px;
          }
          .hn-hero-title {
            font-size: 50px;
            margin-bottom: 18px;
          }
          .hn-hero-desc {
            font-size: 16.5px;
            max-width: 600px;
            line-height: 1.68;
            margin-bottom: 30px;
          }
          .hn-btn-cc-gold,
          .hn-btn-cc-outline {
            font-size: 11.5px;
            padding: 13px 30px;
          }
        }

        @media (min-width: 1600px) {
          .hn-hero-inner-max {
            max-width: 800px;
          }
          .hn-badge-text {
            font-size: 13.5px;
          }
          .hn-hero-title {
            font-size: 54px;
          }
          .hn-hero-desc {
            font-size: 17px;
            max-width: 640px;
          }
          .hn-btn-cc-gold,
          .hn-btn-cc-outline {
            font-size: 12px;
            padding: 14px 32px;
          }
        }
      `}</style>

      <section className={`hn-hero${ready ? " is-ready" : ""}`}>
        {/* Background layers — all mounted, so every image is loaded up front.
            The active one is re-keyed per change to replay its transition. */}
        {slides.map((s, i) => {
          const isActive = i === current;
          const state = isActive ? "is-active" : i === prev ? "is-prev" : "";
          return (
            <div key={isActive ? `active-${tick}` : `layer-${i}`} className={`hn-layer ${state}`} aria-hidden={!isActive || undefined}>
              <div
                className="hn-layer-img"
                role={isActive ? "img" : undefined}
                aria-label={isActive ? s.alt || `${s.title.join(" ")} — Help Now` : undefined}
                style={{ backgroundImage: `url(${s.image})` }}
              />
            </div>
          );
        })}
        <div key={`beam-${tick}`} className="hn-beam" />
        <div key={`flare-${tick}`} className="hn-flare" />
        <div className="hn-vignette" />

        {/* Top Navbar Dark Overlay for Logo & Text Visibility */}
        <div className="hn-hero-overlay-top" />

        {/* Hero Text Content */}
        <div className={`hn-hero-content${leaving ? " is-leaving" : ""}`} key={`content-${textKey}`}>
          <div className="hn-hero-inner-max">
            {/* Subtitle */}
            <div className="hn-subtitle-wrap">
              <span className="hn-gold-line" />
              <span className="hn-badge-text">
                <Sparkles size={14} />
                {slide.badge}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="hn-hero-title">
              {slide.title.map((line, l) => {
                const before = slide.title.slice(0, l).join(" ").split(/\s+/).filter(Boolean).length;
                return (
                  <span key={l} className={`hn-line${l === 1 ? " is-accent" : ""}`}>
                    {line.split(/\s+/).filter(Boolean).map((word, w) => (
                      <Fragment key={w}>
                        {w > 0 && " "}
                        <span className="hn-word">
                          <span className="hn-line-inner" style={{ "--i": before + w } as CSSProperties}>{word}</span>
                        </span>
                      </Fragment>
                    ))}
                  </span>
                );
              })}
            </h1>

            {/* Description */}
            <p className="hn-hero-desc hn-anim-desc">
              {slide.description}
            </p>

            {/* Buttons */}
            <div className="hn-hero-btns hn-anim-btns">
              {buttons.primary && (
                <a href={buttons.primary.link} className="hn-btn-cc-gold">
                  <span>{buttons.primary.text}</span>
                  <ChevronRight size={15} />
                </a>
              )}
              {buttons.secondary && (
                <a href={buttons.secondary.link} className="hn-btn-cc-outline">
                  <span>{buttons.secondary.text}</span>
                  <Sparkles size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="hn-indicators">
          <span className="hn-counter" aria-hidden>
            <b key={`n-${tick}`}>{pad(current + 1)}</b>/ {pad(slides.length)}
          </span>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hn-indicator-btn${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current || undefined}
            >
              {i === current && <span key={`fill-${tick}`} className="hn-indicator-fill" />}
            </button>
          ))}
        </div>
      </section>

      {/* Marquee Strip — the items twice over, for a seamless loop */}
      {marquee && marquee.items.length > 0 && (
        <div className="hn-strip">
          <div className="hn-strip-track">
            {[...marquee.items, ...marquee.items].map((item, i) => {
              const Icon = MARQUEE_ICONS[item.icon] ?? Sparkles;
              return (
                <div key={i} className="hn-strip-item" aria-hidden={i >= marquee.items.length || undefined}>
                  <Icon size={14} className="hn-strip-icon" />
                  <span>{item.label}</span>
                  <span className="hn-strip-dot">✦</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
