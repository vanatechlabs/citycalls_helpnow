"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BadgePercent, CalendarClock, Check, Loader2, Minus, Plus, Tag, Wallet } from "lucide-react";
import { helpNowServices, type HelpNowServiceSlug } from "@/data/helpNowServices";
import { BookingModal } from "@/components/booking/BookingModal";
import { fetchHelpNowCoupons, fetchHelpNowQuote, type HelpNowCoupon } from "@/lib/api/helpNowBookings";

// "Fair Pricing": a cost configurator with a receipt beside it, instead of
// another list of services (the service cards are just above). Same hourly
// rates the booking form charges.

const HOURS = [1, 2, 3, 4, 6, 8];
const MAX_HELPERS = 4;
const CARD_SHADOW = "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px";

const INCLUDED = [
  { icon: BadgeCheck, title: "Verified maids", text: "Background-checked & trained" },
  { icon: Wallet, title: "Pay your way", text: "Online or after the service" },
  { icon: BadgePercent, title: "Coupons", text: "Apply at checkout" },
  { icon: CalendarClock, title: "Easy reschedule", text: "On call or WhatsApp" },
];

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const LABEL = "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500";

export function Pricing() {
  const [slug, setSlug] = useState<HelpNowServiceSlug>(helpNowServices[1]?.slug ?? helpNowServices[0].slug);
  const [helpers, setHelpers] = useState(1);
  const [hours, setHours] = useState(2);
  const [modalOpen, setModalOpen] = useState(false);
  const service = helpNowServices.find((s) => s.slug === slug) ?? helpNowServices[0];
  const subtotal = service.ratePerHour * hours * helpers;

  // Coupons from the backend; the discount is always priced by the backend too.
  const [coupons, setCoupons] = useState<HelpNowCoupon[]>([]);
  const [applied, setApplied] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [checking, setChecking] = useState<string | null>(null);
  const [couponNote, setCouponNote] = useState("");
  const total = subtotal - (applied ? discount : 0);

  useEffect(() => {
    const controller = new AbortController();
    fetchHelpNowCoupons(controller.signal).then(setCoupons).catch(() => undefined);
    return () => controller.abort();
  }, []);

  // This service's own offers first, then the ones for every service.
  const offers = coupons
    .filter((c) => !c.services || c.services.includes(slug))
    .sort((a, b) => Number(Boolean(b.services)) - Number(Boolean(a.services)));

  async function priceCoupon(code: string) {
    setChecking(code);
    setCouponNote("");
    try {
      const quote = await fetchHelpNowQuote({ serviceSlug: slug, hours, helpers, extraTime: "NONE", couponCode: code });
      setApplied(code);
      setDiscount(quote.discount);
    } catch (err) {
      setApplied(null);
      setDiscount(0);
      setCouponNote(err instanceof Error ? err.message : "This coupon can't be used here");
    } finally {
      setChecking(null);
    }
  }

  // Plan changed: price the applied coupon again (or drop it if it no longer fits).
  useEffect(() => {
    if (!applied) return;
    let cancelled = false;
    fetchHelpNowQuote({ serviceSlug: slug, hours, helpers, extraTime: "NONE", couponCode: applied })
      .then((quote) => !cancelled && setDiscount(quote.discount))
      .catch((err: unknown) => {
        if (cancelled) return;
        setApplied(null);
        setDiscount(0);
        setCouponNote(err instanceof Error ? err.message : "Coupon removed");
      });
    return () => {
      cancelled = true;
    };
  }, [applied, slug, hours, helpers]);

  return (
    <section id="pricing" className="bg-[#f9f9f9] px-4 py-10 md:px-6 md:py-12" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <div className="mx-auto max-w-[1100px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center"
        >
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5a623]">Fair Pricing</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-semibold tracking-tight text-[#1a1a1a]">
            Know your price <span className="text-[#f5a623]">before you book</span>
          </h2>
          <p className="mt-1.5 text-[13px] text-slate-500">Pick a service, maids and hours — no hidden costs.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid overflow-hidden rounded-2xl bg-white lg:grid-cols-[1.45fr_1fr]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          {/* Configurator */}
          <div className="flex flex-col gap-5 p-5 md:p-7">
            <div>
              <span className={LABEL}>Service</span>
              <div className="flex flex-wrap gap-2">
                {helpNowServices.map((s) => {
                  const active = s.slug === slug;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => setSlug(s.slug)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        active ? "border-[#f5a623] bg-[#fff6e8] text-[#8a5608] ring-1 ring-[#f5a623]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <s.icon className={`h-3.5 w-3.5 ${active ? "text-[#e08e0b]" : "text-slate-400"}`} />
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
              <div>
                <span className={LABEL}>Maids</span>
                <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                  <button type="button" aria-label="Fewer maids" disabled={helpers <= 1} onClick={() => setHelpers((n) => n - 1)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-[14px] font-semibold text-slate-900" aria-live="polite">{helpers}</span>
                  <button type="button" aria-label="More maids" disabled={helpers >= MAX_HELPERS} onClick={() => setHelpers((n) => n + 1)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span className={LABEL}>Hours</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      aria-pressed={hours === h}
                      className={`h-10 rounded-lg border text-[12px] font-semibold transition-colors ${
                        hours === h ? "border-[#f5a623] bg-[#fff6e8] text-[#8a5608] ring-1 ring-[#f5a623]" : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Offers for this service — tap Apply to see the discount */}
            {offers.length > 0 && (
              <div>
                <span className={`${LABEL} flex items-center gap-1.5`}>
                  <Tag className="h-3.5 w-3.5 text-[#e08e0b]" /> Offers for {service.name}
                </span>
                <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {offers.map((coupon) => {
                    const isApplied = applied === coupon.code;
                    return (
                      <div
                        key={coupon.code}
                        className={`relative flex w-[210px] shrink-0 items-center gap-2.5 rounded-xl border border-dashed p-2.5 transition-colors ${
                          isApplied ? "border-emerald-400 bg-emerald-50" : "border-[#f5a623]/60 bg-[#fffaf0]"
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isApplied ? "bg-emerald-500 text-white" : "bg-[#f5a623] text-[#1a1a1a]"}`}>
                          <BadgePercent className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold tracking-wide text-slate-900">{coupon.code}</span>
                          <span className="block truncate text-[10px] text-slate-500" title={coupon.label}>{coupon.label}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => (isApplied ? (setApplied(null), setDiscount(0)) : void priceCoupon(coupon.code))}
                          disabled={checking !== null}
                          className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-semibold transition-colors disabled:opacity-60 ${
                            isApplied ? "text-emerald-700 hover:text-red-600" : "bg-[#1a1a1a] text-white hover:bg-black"
                          }`}
                        >
                          {checking === coupon.code ? <Loader2 className="h-3 w-3 animate-spin" /> : isApplied ? <span className="flex items-center gap-0.5"><Check className="h-3 w-3" strokeWidth={3} />Applied</span> : "Apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {couponNote && <p className="mt-1.5 text-[11px] font-medium text-red-600">{couponNote}</p>}
              </div>
            )}

            {/* What every booking includes — fills the column to the receipt's height */}
            <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-5 sm:grid-cols-4">
              {INCLUDED.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl bg-[#fffaf0] p-3 ring-1 ring-[#f5a623]/15">
                  <Icon className="h-4.5 w-4.5 text-[#e08e0b]" />
                  <p className="mt-2 text-[12px] font-semibold text-slate-900">{title}</p>
                  <p className="text-[10.5px] leading-snug text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt */}
          <div className="flex flex-col bg-[#161616] p-5 text-white md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Your estimate</p>

            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between">
                <dt className="text-white/60">Rate</dt>
                <dd className="font-semibold">{rupees(service.ratePerHour)} / hr</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Hours</dt>
                <dd className="font-semibold">× {hours}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Maids</dt>
                <dd className="font-semibold">× {helpers}</dd>
              </div>
              {applied && discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <dt>Coupon {applied}</dt>
                  <dd className="font-semibold">− {rupees(discount)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-dashed border-white/15 pt-4">
              <span className="text-[13px] font-semibold text-white/80">
                Total
                {applied && discount > 0 && <span className="ml-2 text-[12px] font-medium text-white/40 line-through">{rupees(subtotal)}</span>}
              </span>
              <motion.span key={total} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="text-[30px] font-semibold leading-none text-[#f5b400]">
                {rupees(total)}
              </motion.span>
            </div>
            <p className="mb-6 mt-1 text-right text-[10.5px] text-white/40">Final price is shown before you pay</p>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[#f5a623] py-3 text-[13px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#ffb93d]"
            >
              Book this plan <ArrowRight className="h-4 w-4" />
            </button>

            <p className="pt-2.5 text-center text-[10.5px] text-white/40">Pay online with Razorpay or after the service</p>
          </div>
        </motion.div>

        <p className="mt-3 text-center text-[11px] text-slate-400">Rates are per maid, per hour. Need more than 8 hours? Set it in the booking form — up to 16 hours.</p>
      </div>

      {/* key: reopening with another coupon starts the form fresh */}
      <BookingModal key={applied ?? "none"} isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceSlug={slug} initialCoupon={applied ?? undefined} />
    </section>
  );
}
