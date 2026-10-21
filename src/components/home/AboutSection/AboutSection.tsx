"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Star, Zap } from "lucide-react";
import { helpNowImageUrl, type HelpNowAbout } from "@/lib/api/helpNowHome";
const ab1 = "/assets/Images/ab1.png";
const ab2 = "/assets/Images/ab2.png";
const ab3 = "/assets/Images/ab3.png";
const ab4 = "/assets/Images/ab4.png";

const trustPoints = [
  {
    icon: ShieldCheck,
    image: ab1,
    title: "Trusted Brand with Years of Experience",
    desc: "Part of CityCalls — a trusted platform with thousands of verified service bookings.",
    // Animation 1: Enters from Top-Left (Diagonal-Down) with counter-clockwise rotation & spring
    animation: {
      initial: { opacity: 0, x: -90, y: -60, scale: 0.84, rotate: -6 },
      whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
      transition: { type: "spring" as const, stiffness: 110, damping: 16, delay: 0.1 },
    },
  },
  {
    icon: Lock,
    image: ab2,
    title: "Safe, Secure & Reliable",
    desc: "Your safety and privacy are our top priority at every step of the process.",
    // Animation 2: Enters from Top-Right (Diagonal-Down) with clockwise rotation & bounce
    animation: {
      initial: { opacity: 0, x: 90, y: -60, scale: 0.84, rotate: 6 },
      whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
      transition: { type: "spring" as const, stiffness: 105, damping: 16, delay: 0.22 },
    },
  },
  {
    icon: Star,
    image: ab3,
    title: "Verified & Trained Maids",
    desc: "Background-checked and well-trained professionals for every home.",
    // Animation 3: Enters from Bottom-Left (Diagonal-Up) with upward pop & tilt
    animation: {
      initial: { opacity: 0, x: -80, y: 80, scale: 0.82, rotate: 5 },
      whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
      transition: { type: "spring" as const, stiffness: 115, damping: 15, delay: 0.34 },
    },
  },
  {
    icon: Zap,
    image: ab4,
    title: "Flexible Hourly Booking",
    desc: "Book maids by the hour that fits your schedule. Flexible & hassle-free.",
    // Animation 4: Enters from Bottom-Right (Diagonal-Up) with smooth 3D swoop
    animation: {
      initial: { opacity: 0, x: 80, y: 80, scale: 0.82, rotate: -5 },
      whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
      transition: { type: "spring" as const, stiffness: 110, damping: 16, delay: 0.46 },
    },
  },
];

const points = [
  "Part of CityCalls — trusted brand with years of experience",
  "Verified & trained maids — background-checked and well-trained",
  "Safe, secure & reliable — your safety is our priority",
  "On-time service — maids arrive with all essentials",
  "No hidden charges — transparent pricing you can trust",
  "Flexible hourly booking — fits your schedule perfectly",
  "24/7 dedicated assistance — quick resolution for all your queries",
  "Complete satisfaction guarantee — hassle-free re-cleaning support",
];

// Built-in content, shown if the CMS (Admin → Website Section → Help Now)
// can't be reached.
const defaultAbout: HelpNowAbout = {
  eyebrow: "About HelpNow",
  heading: "A Part of CityCalls —",
  highlight: "CityCalls",
  headingLine2: "Trusted by Thousands of Homes",
  description:
    "HelpNow is the maid services division of CityCalls. With a legacy of trust and quality, we bring you reliable, background-verified maids for all your cleaning needs. Flexible hourly booking, transparent pricing, and a hassle-free experience — that's the HelpNow promise.",
  points,
  cards: trustPoints.map((t) => ({ title: t.title, description: t.desc, image: t.image, alt: t.title })),
};

function Heading({ heading, highlight }: { heading: string; highlight: string }) {
  const index = highlight ? heading.indexOf(highlight) : -1;
  if (index < 0) return <>{heading}</>;
  return (
    <>
      {heading.slice(0, index)}
      <span>{highlight}</span>
      {heading.slice(index + highlight.length)}
    </>
  );
}

// `about` comes from the CMS via the home page: undefined means it couldn't
// be reached (built-in content), null means the section is switched off.
export function AboutSection({ about = defaultAbout }: { about?: HelpNowAbout | null } = {}) {
  if (!about) return null;
  // Each card keeps the entrance animation of its grid position.
  const cards = about.cards.map((card, i) => ({ ...card, animation: trustPoints[i % trustPoints.length].animation }));

  return (
    <>
      <style>{`
        .hn-about {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 68px 24px 36px;
          background: #ffffff;
          overflow: hidden;
        }
        .hn-about-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .hn-about-left {}
        .hn-section-tag {
          font-size: 11px;
          font-weight: 800;
          color: #f5a623;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
        }
        .hn-section-title {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .hn-section-title span { color: #f5a623; }
        .hn-about-text {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.8;
          margin-top: 16px;
          margin-bottom: 24px;
        }
        .hn-about-points {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hn-about-point {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #1e293b;
        }
        .hn-about-point::before {
          content: "✓";
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fffaf0;
          color: #f5a623;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
          border: 1.5px solid #f5a623;
        }
        .hn-about-right {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .hn-trust-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 14px 14px;
          box-shadow: rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(27, 31, 35, 0.12) 0px 0px 0px 1px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          will-change: transform, opacity;
          border: 1px solid transparent;
        }
        .hn-card-img-wrap {
          height: 155px;
          opacity: 1;
          overflow: hidden;
          border-radius: 9px;
          margin-bottom: 14px;
          background: #f8fafc;
        }
        .hn-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 9px;
          filter: brightness(0.96);
          transition: transform 0.45s ease;
        }
        .hn-trust-card:hover .hn-card-img-wrap img {
          transform: scale(1.07);
        }
        .hn-trust-card h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
          line-height: 1.35;
        }
        .hn-trust-card p {
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
        }
        @media (max-width: 900px) {
          .hn-about-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 480px) {
          .hn-about-right { grid-template-columns: 1fr; }
          .hn-about { padding: 48px 16px; }
        }
      `}</style>

      <section className="hn-about" id="about">
        <div className="hn-about-inner">
          {/* Left Text Column with Smooth Entrance */}
          <motion.div
            className="hn-about-left"
            initial={{ opacity: 0, x: -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {about.eyebrow && <div className="hn-section-tag">{about.eyebrow}</div>}
            <h2 className="hn-section-title">
              <Heading heading={about.heading} highlight={about.highlight} />
              {about.headingLine2 && (
                <>
                  <br />
                  {about.headingLine2}
                </>
              )}
            </h2>
            {about.description && <p className="hn-about-text">{about.description}</p>}
            <div className="hn-about-points">
              {about.points.map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                  className="hn-about-point"
                >
                  {p}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right 2x2 Cards Grid - Each with a DIFFERENT Animation */}
          <div className="hn-about-right">
            {cards.map((t) => (
              <motion.div
                key={t.title}
                className="hn-trust-card"
                initial={t.animation.initial}
                whileInView={t.animation.whileInView}
                viewport={{ once: false, amount: 0.2 }}
                transition={t.animation.transition}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow:
                    "0 16px 32px rgba(245, 166, 35, 0.25), 0 0 0 1.5px rgba(245, 166, 35, 0.6)",
                  transition: { duration: 0.25 },
                }}
              >
                <div className="hn-card-img-wrap">
                  {t.image && <img src={helpNowImageUrl(t.image, 800)} alt={t.alt || t.title} loading="lazy" />}
                </div>
                <h4>{t.title}</h4>
                <p>{t.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
