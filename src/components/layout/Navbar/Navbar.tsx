"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, House, Zap, ArrowRight, type LucideIcon } from "lucide-react";
import { helpNowServices } from "@/data/helpNowServices";
import { HelpNowQuickBook } from "@/components/booking/QuickBook/HelpNowQuickBook";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Every service page; the desktop bar has room for the first five.
  const serviceLinks = helpNowServices.map((s) => ({ label: s.name, href: `/services/${s.slug}`, icon: s.icon as LucideIcon }));
  const pathname = usePathname();
  // Home (only shown in the top bar) + the first five service pages.
  const navLinks = [{ label: "Home", href: "/", icon: House as LucideIcon, home: true }, ...serviceLinks.slice(0, 5).map((l) => ({ ...l, home: false }))];
  // "Book Now" opens the instant Quick Booking form.
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const closeQuickBook = useCallback(() => setQuickBookOpen(false), []);


  return (
    <>
      <style>{`
        .hn-navbar {
          font-family: 'Roboto', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
          position: fixed;
          /* At the top: transparent over the hero, white logo and text. Once
             scrolled it drops into a floating white pill. */
          top: ${scrolled ? "18px" : "0"};
          left: ${scrolled ? "6%" : "0"};
          right: ${scrolled ? "6%" : "0"};
          z-index: 100;
          border-radius: ${scrolled ? "999px" : "0"};
          background: ${scrolled ? "rgba(255, 255, 255, 0.96)" : "transparent"};
          -webkit-backdrop-filter: ${scrolled ? "blur(16px) saturate(160%)" : "none"};
          backdrop-filter: ${scrolled ? "blur(16px) saturate(160%)" : "none"};
          border: 1px solid ${scrolled ? "rgba(245, 166, 35, 0.35)" : "transparent"};
          ${scrolled ? "" : "border-bottom-color: rgba(255, 255, 255, 0.12);"}
          box-shadow: ${scrolled ? "0 18px 40px -16px rgba(0,0,0,0.3)" : "none"};
          animation: ${scrolled ? "hn-nav-drop 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none"};
          transition: top 0.5s cubic-bezier(0.16, 1, 0.3, 1), left 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            right 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.5s, background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.4s, box-shadow 0.4s;
        }
        @keyframes hn-nav-drop {
          from { transform: translateY(-130%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hn-navbar { animation: none; transition: none; }
        }
        .hn-nav-inner {
          position: relative;
          /* In the pill the content spreads to its edges; over the hero it
             keeps the original centred width. */
          max-width: ${scrolled ? "none" : "1280px"};
          margin: 0 auto;
          padding: ${scrolled ? "0 22px" : "0 24px"};
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: ${scrolled ? "60px" : "76px"};
          gap: 20px;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hn-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hn-logo-img {
          height: 38px;
          width: auto;
          object-fit: contain;
                  }
        .hn-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .hn-nav-link-wrap {
          position: relative;
        }
        .hn-nav-link {
          font-family: 'Roboto', 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          text-decoration: none;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 3px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          white-space: nowrap;
          border-radius: ${scrolled ? "999px" : "6px"};
          transition: color 0.3s, background 0.3s, box-shadow 0.3s;
          position: relative;
                  }
        .hn-nav-link::after {
          content: '';
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: -1px;
          height: 2px;
          background: #f5a623;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s;
        }
        /* Over the hero: gold text with the underline sweep; in the white
           pill the link lifts into its own small capsule. */
        .hn-nav-link:hover { color: ${scrolled ? "#b5730f" : "#f5a623"} !important; }
        ${scrolled
          ? `.hn-nav-link:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px -6px rgba(0,0,0,0.25);
        }`
          : `.hn-nav-link:hover::after { transform: scaleX(1); }`}
        /* Every link has a line icon, and Book Now (with its strike) shows in
           both states. At the top the links are white with thin dividers on
           the hero; the current page gets a gold icon and underline, hover
           gold text. In the scrolled white pill Home is left out. */
        .hn-nav-icon {
          width: ${scrolled ? "16px" : "20px"};
          height: ${scrolled ? "16px" : "20px"};
          stroke-width: 1.7;
          color: currentColor;
          flex-shrink: 0;
          ${scrolled ? "" : "filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));"}
        }
        .hn-nav-link.is-active .hn-nav-icon { color: #f5a623; filter: none; }
        ${scrolled ? `
        .hn-home-item { display: none !important; }
        .hn-nav-link { gap: 6px; }
        /* Tighter on laptops so the links and Book Now fit in the pill */
        @media (max-width: 1440px) {
          .hn-nav-links { gap: 2px; }
          .hn-nav-link { padding: 8px 9px; font-size: 11.5px; letter-spacing: 0.07em; }
        }` : `
        .hn-logo-img { height: 40px; filter: brightness(0) invert(1); }
        .hn-nav-links { gap: 0; }
        .hn-nav-link-wrap + .hn-nav-link-wrap::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          height: 22px;
          width: 1px;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.28);
        }
        .hn-nav-link {
          gap: 8px;
          border-radius: 999px;
          padding: 10px 15px;
          font-size: 13.5px;
          text-transform: none;
          letter-spacing: 0.01em;
          color: #ffffff !important;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        }
        /* Hover, like the current page: text stays white — only the icon
           and the underline turn gold. */
        .hn-nav-link:hover { color: #ffffff !important; }
        .hn-nav-link:hover .hn-nav-icon { color: #f5a623; filter: none; }
        .hn-nav-link::after { left: 15px; right: 15px; bottom: 2px; }
        .hn-nav-link.is-active::after { transform: scaleX(1); }
        @media (max-width: 1440px) {
          .hn-nav-link { padding: 10px 10px; font-size: 13px; gap: 6px; }
          .hn-nav-icon { width: 18px; height: 18px; }
        }`}
        /* Book Now: an electric arc runs round the border all the time; every
           3s the bolt trembles while it charges, then strikes — bolts crack
           out on four sides, a flash sweeps across, and the glow rings out. */
        @property --hn-arc {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .hn-book-now {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: ${scrolled ? "4px 4px 4px 14px" : "6px 6px 6px 18px"};
          border-radius: 999px;
          border: 1.5px solid ${scrolled ? "rgba(26, 26, 26, 0.18)" : "rgba(255, 255, 255, 0.55)"};
          background: ${scrolled ? "rgba(245, 166, 35, 0.06)" : "rgba(255, 255, 255, 0.06)"};
          color: ${scrolled ? "#1a1a1a" : "#ffffff"};
          font-size: ${scrolled ? "13.5px" : "15px"};
          font-weight: 600;
          letter-spacing: 0.01em;
          text-decoration: none;
          white-space: nowrap;
          text-shadow: ${scrolled ? "none" : "0 1px 4px rgba(0, 0, 0, 0.5)"};
          cursor: pointer;
          position: relative;
          isolation: isolate;
          font-family: inherit;
          transition: color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          animation: hn-book-glow 3s ease-in-out infinite;
        }
        .hn-book-now:hover { color: #f5a623; border-color: #f5a623; transform: translateY(-1px); }
        /* The travelling arc on the border */
        .hn-book-now::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          padding: 2px;
          border-radius: inherit;
          background: conic-gradient(from var(--hn-arc), transparent 0deg 250deg, #f5a623 300deg, #fff3b0 335deg, #ffcf24 350deg, transparent 360deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          filter: drop-shadow(0 0 4px rgba(245, 166, 35, 0.9));
          pointer-events: none;
          animation: hn-arc 2.2s linear infinite;
        }
        @keyframes hn-arc { to { --hn-arc: 360deg; } }
        @keyframes hn-book-glow {
          0%, 68%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0); }
          73% { box-shadow: 0 0 0 3px rgba(245,166,35,0.5), 0 0 30px 8px rgba(245,166,35,0.65); }
          92% { box-shadow: 0 0 0 16px rgba(245,166,35,0), 0 0 10px 2px rgba(245,166,35,0.15); }
        }
        /* White flash that sweeps across on each strike */
        .hn-book-shine {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }
        .hn-book-shine::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -60%;
          width: 45%;
          transform: skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255, 240, 180, 0.65), transparent);
          animation: hn-shine 3s ease-in-out infinite;
        }
        @keyframes hn-shine {
          0%, 70% { left: -60%; opacity: 0; }
          71% { opacity: 1; }
          84% { left: 130%; opacity: 1; }
          85%, 100% { left: 130%; opacity: 0; }
        }
        .hn-book-label { animation: hn-label 3s ease-in-out infinite; }
        @keyframes hn-label {
          0%, 70%, 100% { text-shadow: inherit; }
          73% { text-shadow: 0 0 10px rgba(255, 207, 36, 0.95), 0 0 2px rgba(255, 255, 255, 0.9); }
        }
        .hn-book-zap {
          position: relative;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 30%, #fff3b0, #ffcf24 45%, #f59e0b);
          color: #111;
          box-shadow: 0 0 12px rgba(245,166,35,0.75);
          animation: hn-zap 3s ease-in-out infinite;
        }
        /* Trembles while it charges, then strikes */
        @keyframes hn-zap {
          0%, 58%, 100% { transform: scale(1) rotate(0); }
          60% { transform: scale(0.88) rotate(-16deg); }
          62% { transform: scale(0.88) rotate(14deg); }
          64% { transform: scale(0.88) rotate(-12deg); }
          66% { transform: scale(0.88) rotate(10deg); }
          68% { transform: scale(0.86) rotate(-6deg); box-shadow: 0 0 6px rgba(245,166,35,0.5); }
          72% { transform: scale(1.4) rotate(0); box-shadow: 0 0 0 5px rgba(255,247,204,0.95), 0 0 28px 10px rgba(245,166,35,1); }
          84% { transform: scale(1); box-shadow: 0 0 12px rgba(245,166,35,0.75); }
        }
        .hn-bolt {
          position: absolute;
          width: 11px;
          height: 18px;
          color: #ffe066;
          opacity: 0;
          filter: drop-shadow(0 0 3px #fff) drop-shadow(0 0 6px #f5a623);
          pointer-events: none;
          animation: hn-bolt 3s linear infinite;
        }
        .hn-bolt-1 { left: -13px; top: -11px; transform: rotate(-30deg); }
        .hn-bolt-2 { right: -13px; bottom: -11px; transform: rotate(150deg); animation-delay: 0.04s; }
        .hn-bolt-3 { right: -12px; top: -12px; transform: rotate(35deg) scale(0.8); animation-delay: 0.08s; }
        .hn-bolt-4 { left: -12px; bottom: -12px; transform: rotate(-145deg) scale(0.8); animation-delay: 0.12s; }
        @keyframes hn-bolt {
          0%, 70%, 100% { opacity: 0; }
          72% { opacity: 1; }
          75% { opacity: 0.1; }
          78% { opacity: 1; }
          81% { opacity: 0.3; }
          86% { opacity: 0; }
        }
        .hn-instant-badge {
          position: absolute;
          top: -9px;
          right: 22px;
          padding: 1px 7px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ffcf24, #f5a623);
          color: #111;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-shadow: none;
          box-shadow: 0 0 10px rgba(245,166,35,0.7);
          animation: hn-badge 1.6s ease-in-out infinite;
        }
        @keyframes hn-badge {
          50% { transform: translateY(-2px); box-shadow: 0 0 16px rgba(245,166,35,0.95); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hn-book-now, .hn-book-now::before, .hn-book-shine::after, .hn-book-label, .hn-book-zap, .hn-bolt, .hn-instant-badge { animation: none; }
        }
        .hn-book-now-arrow {
          display: grid;
          place-items: center;
          width: ${scrolled ? "28px" : "32px"};
          height: ${scrolled ? "28px" : "32px"};
          border-radius: 999px;
          background: ${scrolled ? "#1a1a1a" : "#ffffff"};
          color: ${scrolled ? "#ffffff" : "#111"};
          transition: background 0.25s ease;
        }
        .hn-book-now:hover .hn-book-now-arrow { background: #f5a623; }
        @media (max-width: 1440px) {
          .hn-book-now { font-size: 13.5px; padding: 5px 5px 5px 14px; gap: 8px; }
          .hn-book-now-arrow { width: 28px; height: 28px; }
        }
        @media (max-width: 1300px) {
          .hn-book-now { display: none; }
        }
        .hn-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .hn-nav-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #1a1a1a;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          padding: 6px 0;
          letter-spacing: -0.2px;
        }
        .hn-nav-phone:hover { color: #f5a623; }
        /* Uiverse Book Now button (mustard) */
        .hn-book-btn {
          -moz-appearance: none;
          -webkit-appearance: none;
          appearance: none;
          border: none;
          background: none;
          color: #1a1a1a;
          cursor: pointer;
          position: relative;
          padding: 6px;
          margin-bottom: 0;
          text-transform: uppercase;
          font-weight: 700;
          font-size: 11.5px;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0.08em;
          transition: all .15s ease;
          text-decoration: none;
          display: inline-block;
          white-space: nowrap;
        }
        .hn-book-btn::before,
        .hn-book-btn::after {
          content: '';
          display: block;
          position: absolute;
          right: 0;
          left: 0;
          height: calc(50% - 5px);
          border: 1px solid #f5a623;
          transition: all .15s ease;
        }
        .hn-book-btn::before {
          top: 0;
          border-bottom-width: 0;
        }
        .hn-book-btn::after {
          bottom: 0;
          border-top-width: 0;
        }
        .hn-book-btn:active::before,
        .hn-book-btn:active::after {
          right: 3px;
          left: 3px;
        }
        .hn-book-btn:active::before { top: 3px; }
        .hn-book-btn:active::after { bottom: 3px; }
        .hn-book-btn .hn-btn-lg {
          position: relative;
          display: block;
          padding: 8px 18px;
          color: #fff;
          background-color: #1a1a1a;
          overflow: hidden;
          box-shadow: inset 0px 0px 0px 1px transparent;
        }
        .hn-book-btn .hn-btn-lg::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 2px;
          background-color: #1a1a1a;
        }
        .hn-book-btn .hn-btn-lg::after {
          content: '';
          display: block;
          position: absolute;
          right: 0;
          bottom: 0;
          width: 4px;
          height: 4px;
          background-color: #1a1a1a;
          transition: all .2s ease;
        }
        .hn-book-btn .hn-btn-sl {
          display: block;
          position: absolute;
          top: 0;
          bottom: -1px;
          left: -8px;
          width: 0;
          background-color: #f5a623;
          transform: skew(-15deg);
          transition: all .2s ease;
        }
        .hn-book-btn .hn-btn-text {
          position: relative;
        }
        .hn-book-btn:hover { color: #1a1a1a; }
        .hn-book-btn:hover .hn-btn-sl { width: calc(100% + 15px); }
        .hn-book-btn:hover .hn-btn-text { color: #1a1a1a; }
        .hn-book-btn:hover .hn-btn-lg::after { background-color: #fff; }
        .hn-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #1a1a1a;
        }
        @media (max-width: 1024px) {
          .hn-nav-links { display: none; }
          .hn-nav-phone { display: none; }
        }
        @media (max-width: 768px) {
          .hn-menu-btn { display: flex; }
        }
        /* Swinging pendant — reuses global .Btn from styles.css */
        @keyframes hn-swing {
          0%, 100% { transform: rotate(-2.5deg); }
          50% { transform: rotate(2.5deg); }
        }
        .hn-animate-swing {
          animation: hn-swing 1.8s ease-in-out infinite;
          transform-origin: top center;
        }
        /* Mobile Drawer */
        .hn-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 300;
        }
        .hn-mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: #fff;
          z-index: 310;
          display: flex;
          flex-direction: column;
          padding: 0;
        }
        .hn-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .hn-mobile-links {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .hn-mobile-link {
          display: block;
          padding: 14px 20px;
          font-family: 'Roboto', 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: color 0.2s, background 0.2s;
        }
        .hn-mobile-link:hover { color: #f5a623; background: #fffaf0; }
        .hn-mobile-footer {
          padding: 16px 20px;
          border-top: 1px solid #f0f0f0;
        }
        .hn-mobile-book {
          border: none;
          cursor: pointer;
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e09500);
          color: #fff;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 13px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
        }
      `}</style>

      <nav className="hn-navbar">
        <div className="hn-nav-inner">
          {/* Brand — CityCalls logo */}
          <Link href="/" className="hn-nav-brand">
            {/* White over the hero; logo-dark.png ("Calls" in dark text) on the white pill */}
            <img src={scrolled ? "/logo-dark.png" : "/logo.png"} alt="CityCalls Logo" className="hn-logo-img" />
          </Link>

          {/* Desktop nav links */}
          <ul className="hn-nav-links">
            {navLinks.map((l) => (
              <li key={l.label} className={`hn-nav-link-wrap${l.home ? " hn-home-item" : ""}`}>
                <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={`hn-nav-link${pathname === l.href ? " is-active" : ""}`}>
                  <l.icon aria-hidden className="hn-nav-icon" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Right */}
          <div className="hn-nav-right">
            <button type="button" onClick={() => setQuickBookOpen(true)} className="hn-book-now" aria-label="Book Now — instant booking">
              <span className="hn-instant-badge" aria-hidden>Instant</span>
              <span className="hn-book-shine" aria-hidden />
              <span className="hn-book-zap" aria-hidden>
                <Zap size={16} strokeWidth={2.5} fill="currentColor" />
                {/* Little bolts that crack out on each strike */}
                {[1, 2, 3, 4].map((n) => (
                  <svg key={n} className={`hn-bolt hn-bolt-${n}`} viewBox="0 0 12 20" fill="currentColor">
                    <path d="M7 0 0 11h5l-2 9 9-12H7l2-8z" />
                  </svg>
                ))}
              </span>
              <span className="hn-book-label">Book Now</span>
              <span className="hn-book-now-arrow" aria-hidden>
                <ArrowRight size={17} strokeWidth={2.5} />
              </span>
            </button>
            <button
              className="hn-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="hn-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="hn-mobile-drawer">
            <div className="hn-mobile-header">
              <Link href="/" className="hn-nav-brand" onClick={() => setMobileOpen(false)}>
                <img src="/logo.png" alt="CityCalls Logo" style={{ height: 32, width: "auto", objectFit: "contain" }} />
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>
            <div className="hn-mobile-links">
              {serviceLinks.map((l) => (
                l.href.startsWith("/") && !l.href.includes("#") ? (
                  <Link key={l.label} href={l.href} className="hn-mobile-link" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.label} href={l.href} className="hn-mobile-link" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </a>
                )
              ))}
              <Link href="/about" className="hn-mobile-link" onClick={() => setMobileOpen(false)}>About Us</Link>
              <Link href="/contact" className="hn-mobile-link" onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>
            <div className="hn-mobile-footer">
              <button
                type="button"
                className="hn-mobile-book"
                onClick={() => {
                  setMobileOpen(false);
                  setQuickBookOpen(true);
                }}
              >
                ⚡ Book a Maid Now — Instant
              </button>
            </div>
          </div>
        </>
      )}
      <HelpNowQuickBook open={quickBookOpen} onClose={closeQuickBook} />
    </>
  );
}
