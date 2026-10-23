"use client";

import { useState } from "react";
import { BadgeCheck, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { findHelpNowService, type HelpNowServiceSlug } from "@/data/helpNowServices";
import { HelpNowBookingFlow } from "@/components/booking/HelpNowBookingFlow";
import type { BookingSummary } from "@/components/booking/useHelpNowBooking";
import { useHelpNowRates } from "@/components/rates/HelpNowRates";

// Same card shadow as the booking form.
const CARD_SHADOW = "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px";

const WHY_HELP_NOW = [
  "Background-verified, trained helpers",
  "Clear hourly pricing — no hidden charges",
  "Pay online or after the service",
  "Easy rescheduling on call or WhatsApp",
];

// Booking flow (65%) with a live price summary beside it (35%). Takes the
// slug, not the service — the service holds an icon component, which can't
// be passed from a server component.
export function ServiceBookingSection({ slug }: { slug: HelpNowServiceSlug }) {
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const rateOf = useHelpNowRates();
  const service = findHelpNowService(slug);
  if (!service) return null;

  return (
    <section id="booking" className="container-x mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full rounded-xl bg-white p-5 md:p-8 lg:w-[65%]" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
          <HelpNowBookingFlow service={service} onSummaryChange={setSummary} />
        </div>

        <aside className="w-full space-y-5 lg:sticky lg:top-24 lg:w-[35%]">
          <div className="overflow-hidden rounded-xl bg-white" style={{ boxShadow: CARD_SHADOW }}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#fffaf0] px-5 py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5a623]/15 text-[#d08a10]">
                <service.icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900">Booking Summary</h3>
                <p className="text-[11px] font-medium text-[#b5730f]">{service.name}</p>
              </div>
            </div>
            <dl className="space-y-2.5 px-5 py-4 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-slate-500">Rate</dt>
                <dd className="font-semibold text-slate-800">
                  <span className="text-[#b5730f]">₹{rateOf(service.slug)}</span> / hour / helper
                </dd>
              </div>
              {summary && (
                <>
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-slate-500">Plan</dt>
                    <dd className="font-semibold text-blue-700">
                      {summary.helpers} maid{summary.helpers > 1 ? "s" : ""} × {summary.hours} hr{summary.hours > 1 ? "s" : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-slate-500">Subtotal</dt>
                    <dd className="font-semibold text-slate-800">₹{summary.subtotal.toLocaleString("en-IN")}</dd>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between gap-3 text-emerald-600">
                      <dt className="font-medium">Coupon {summary.couponCode}</dt>
                      <dd className="font-semibold">− ₹{summary.discount.toLocaleString("en-IN")}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            {summary && (
              <div className="mx-5 mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-3.5 py-2.5 ring-1 ring-emerald-100">
                <span className="text-[13px] font-semibold text-slate-800">Total</span>
                <span className="text-[17px] font-semibold text-emerald-700">₹{summary.total.toLocaleString("en-IN")}</span>
              </div>
            )}
            <p className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-3 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Payments are secured by <span className="font-semibold text-[#2b6be0]">Razorpay</span>
            </p>
          </div>

          <div className="rounded-xl bg-white p-5" style={{ boxShadow: CARD_SHADOW }}>
            <h3 className="mb-3 text-[14px] font-semibold text-slate-900">Why Help Now?</h3>
            <ul className="space-y-2.5">
              {WHY_HELP_NOW.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[12px] font-medium text-slate-700">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#f5a623]/40 bg-[#fffaf1] p-5">
            <h3 className="text-[14px] font-semibold text-slate-900">Need help booking?</h3>
            <p className="mt-1 text-[12px] font-medium text-slate-600">Talk to us, Mon–Sat, 9:00 AM – 8:00 PM.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="tel:+917428808884" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800">
                <Phone className="h-3.5 w-3.5" /> Call Us
              </a>
              <a href="https://wa.me/917428808884" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#3e8914] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#347311]">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
