"use client";

import type { ComponentType, ReactNode } from "react";
import { ArrowRight, ArrowLeft, BadgePercent, CheckCircle2, Calendar, Edit3, Loader2, User, Sparkles, Lock } from "lucide-react";
import { EXTRA_TIME_OPTIONS } from "@/lib/api/helpNowBookings";
import { prettyDate, type HelpNowBooking } from "../useHelpNowBooking";

function ReviewCard({ icon: Icon, title, onEdit, children }: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border border-slate-200 p-4 bg-white rounded-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#fff6e8] flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#b5730f]" />
          </div>
          <h4 className="text-[13px] font-bold text-slate-900">{title}</h4>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="border border-[#f5a623] text-[#b5730f] bg-white hover:bg-[#fff6e8] px-3 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, tone = "text-slate-900", width = "100px" }: { label: string; value: ReactNode; tone?: string; width?: string }) {
  return (
    <div className="grid items-baseline" style={{ gridTemplateColumns: `${width} 1fr` }}>
      <span className="text-slate-500 text-[11px] font-medium">{label}</span>
      <span className={`font-bold leading-snug break-words ${tone}`}>{value}</span>
    </div>
  );
}

// Review: everything entered so far (each block editable), the coupon box
// and the price breakdown.
export function Step4({ b }: { b: HelpNowBooking }) {
  const { details, service } = b;
  const extra = EXTRA_TIME_OPTIONS.find((o) => o.value === b.extraTime);

  return (
    <div className="bg-white mt-1 relative overflow-hidden rounded-2xl" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
      <div className="px-4 pt-4 pb-5 md:px-6 md:pt-4 md:pb-6 space-y-4">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#f5a623]" />
            Review Your Booking
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5 font-medium">Please check all the details below and confirm your booking.</p>
        </div>

        {/* 1. Personal Information Card */}
        <ReviewCard icon={User} title="Personal Information" onEdit={() => b.goTo(3)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-[11.5px]">
            <div className="space-y-2.5">
              <Row label="Full Name" value={details.fullName} tone="text-[#800000]" />
              <Row label="WhatsApp No." value={`+91 ${details.phone}`} />
              <Row label="Email Address" value={details.email} tone="text-[#2563eb]" />
              <Row label="Address" value={details.address} />
            </div>
            <div className="space-y-2.5">
              <Row label="City" value={details.city} />
              <Row label="State" value={details.state} />
              <Row label="Pincode" value={details.pincode} />
              <Row label="Language" value={details.language} />
              {details.altPhone && <Row label="Alternate No." value={`+91 ${details.altPhone}`} />}
            </div>
          </div>
        </ReviewCard>

        {/* 2. Service Details Card */}
        <ReviewCard icon={Sparkles} title="Service Details" onEdit={() => b.goTo(1)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-[11.5px]">
            <div className="space-y-2.5">
              <Row width="110px" label="Category" value="HelpNow Maid Service" tone="text-[#800000]" />
              <Row width="110px" label="Service" value={service.name} />
              <Row
                width="110px"
                label="Maids & Duration"
                tone="text-[#2563eb]"
                value={`${b.helpers} Maid${b.helpers > 1 ? "s" : ""} · ${b.hours} Hour${b.hours > 1 ? "s" : ""}${extra && extra.charge ? ` (${extra.label.replace(" Extra", "")})` : ""}`}
              />
              <Row width="110px" label="Home Size" value={b.property.name} />
            </div>
            <div className="space-y-2.5">
              <Row width="110px" label="Requirements" value={b.tasks.join(", ")} />
            </div>
          </div>
        </ReviewCard>

        {/* 3. Date & Time Card */}
        <ReviewCard icon={Calendar} title="Date & Time" onEdit={() => b.goTo(2)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2.5 gap-x-4 text-[11.5px]">
            <div className="grid grid-cols-[100px_1fr] md:grid-cols-1 items-baseline">
              <span className="text-slate-500 text-[11px] font-medium">Selected Date</span>
              <span className="font-bold text-[#2563eb] mt-0.5">{prettyDate(b.date, true)}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] md:grid-cols-1 items-baseline">
              <span className="text-slate-500 text-[11px] font-medium">Selected Time Slot</span>
              <span className="font-bold text-slate-900 mt-0.5">{b.timeSlot}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] md:grid-cols-1 items-baseline">
              <span className="text-slate-500 text-[11px] font-medium">Duration</span>
              <span className="font-bold text-slate-800 mt-0.5">
                {b.hours} hour{b.hours > 1 ? "s" : ""}
                {extra && extra.charge ? ` ${extra.label.replace(" Extra", "").toLowerCase()}` : ""}
              </span>
            </div>
          </div>

          <div className="bg-[#eff6ff] border border-[#bfdbfe] p-3 rounded-lg flex items-start gap-2.5 mt-2">
            <div className="w-4 h-4 rounded-full border border-[#2563eb] text-[#2563eb] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">i</div>
            <div>
              <div className="text-[11px] font-bold text-[#1e40af]">Important Note</div>
              <p className="text-[11px] text-[#1e40af]/90 font-medium leading-relaxed mt-0.5">
                Our expert will arrive within the selected time slot. You will receive a call or WhatsApp message from our team before the visit.
              </p>
            </div>
          </div>
        </ReviewCard>

        {/* Coupon */}
        <div className="border border-dashed border-[#f5a623]/60 bg-[#fffaf1] p-4 rounded-lg">
          <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <BadgePercent className="w-4 h-4 text-[#f5a623]" /> Have a coupon code?
          </div>
          {b.activeCoupon?.coupon ? (
            <div className="flex items-center justify-between gap-3 border border-emerald-300 bg-emerald-50 px-3 py-2.5 rounded">
              <span className="text-[12px] font-bold text-emerald-700">
                {b.activeCoupon.coupon.code} applied — you save ₹{b.discount}
                <span className="block text-[10px] font-medium text-emerald-700/80">{b.activeCoupon.coupon.label}</span>
              </span>
              <button type="button" onClick={b.removeCoupon} className="text-[11px] font-bold text-slate-600 hover:text-red-600">Remove</button>
            </div>
          ) : (
            <div className="flex">
              <input
                value={b.couponInput}
                onChange={(e) => b.setCouponInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void b.applyCoupon();
                  }
                }}
                maxLength={40}
                placeholder="Enter coupon code"
                aria-invalid={Boolean(b.couponError)}
                className="w-full border border-slate-300 bg-white px-3 py-2 text-[12px] font-bold uppercase tracking-wider outline-none focus:border-[#f5a623]"
              />
              <button
                type="button"
                onClick={() => void b.applyCoupon()}
                disabled={!b.couponInput.trim() || b.checkingCoupon || Boolean(b.appliedCode && !b.activeCoupon)}
                className="shrink-0 bg-slate-900 px-5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {b.checkingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
          )}
          {b.couponError && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{b.couponError}</p>}
        </div>

        {/* 4. Price Breakdown Card */}
        <div className="border border-slate-200 p-4 bg-slate-50/50 rounded-lg space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price Breakdown</div>

          <div className="flex items-center justify-between gap-3 text-[11.5px] text-slate-700">
            <span>
              Base Hourly Fare ({b.helpers} Helper{b.helpers > 1 ? "s" : ""} × {b.hours} hr{b.hours > 1 ? "s" : ""} @ ₹{b.ratePerHour}/hr)
            </span>
            <span className="font-bold text-[#2563eb]">₹{b.baseFare}</span>
          </div>
          {b.extraTimeCharge > 0 && extra && (
            <div className="flex items-center justify-between text-[11.5px] text-slate-700">
              <span>Extra Time Protection ({extra.label.replace(" Extra", "")} Buffer)</span>
              <span className="font-bold text-emerald-600">+₹{b.extraTimeCharge}</span>
            </div>
          )}
          {b.discount > 0 && (
            <div className="flex items-center justify-between text-[11.5px] text-emerald-700">
              <span>Coupon ({b.activeCoupon?.coupon?.code})</span>
              <span className="font-bold">−₹{b.discount}</span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-[13px]">Total Amount Payable</span>
            <span className="font-semibold text-red-600 text-base">₹{b.total}</span>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#2563eb] font-semibold pt-1">
          <Lock className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>Your information is 100% secure and will never be shared.</span>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <button
          type="button"
          onClick={() => b.goTo(3)}
          className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          type="button"
          onClick={() => b.goTo(5)}
          className="bg-[#f5a623] hover:bg-[#e0951a] text-white px-6 py-2.5 rounded-lg font-bold text-[12px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          Confirm Booking
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
