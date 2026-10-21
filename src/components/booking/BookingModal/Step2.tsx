"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Calendar as CalendarIcon, Clock, Info, ChevronLeft, ChevronRight, Check, Zap } from "lucide-react";
import {
  INSTANT_SLOT, TIME_SLOTS, customTimeProblem, instantAvailable, istDate, lastBookableDate, prettyDate, slotAvailable,
  type HelpNowBooking,
} from "../useHelpNowBooking";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");

// Date & Time: a month calendar, standard slots (plus "Instant" today) or a
// custom arrival time.
export function Step2({ b }: { b: HelpNowBooking }) {
  const today = istDate(new Date());
  const lastDay = lastBookableDate();
  const [view, setView] = useState(() => {
    const [y, m] = (b.date || today).split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(view.year, view.month, 1)));
  const monthKey = `${view.year}-${pad(view.month + 1)}`;
  const canGoBack = monthKey > today.slice(0, 7);
  const canGoForward = monthKey < lastDay.slice(0, 7);
  const shiftMonth = (by: number) =>
    setView(({ year, month }) => {
      const next = month + by;
      return { year: year + Math.floor(next / 12), month: ((next % 12) + 12) % 12 };
    });

  const showInstant = !!b.date && instantAvailable(b.date);
  const slots = [...(showInstant ? [{ label: INSTANT_SLOT, start: -1 }] : []), ...TIME_SLOTS];
  const customProblem = b.isCustomTime && b.customTime && b.date ? customTimeProblem(b.date, b.customTime) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = b.stepProblem(2);
    if (problem) {
      b.setError(problem);
      return;
    }
    b.goTo(3);
  };

  return (
    <div className="bg-white mt-1 relative overflow-hidden rounded-2xl" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
      <div className="px-4 pt-4 pb-5 md:px-6 md:pt-4 md:pb-6">
        {/* Header */}
        <div className="mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#f5a623]" />
            Choose Date & Time
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5 font-medium">Select a convenient date and time slot for our expert to visit.</p>
        </div>

        <form id="step2-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Calendar + Selected Date Banner */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-900">
                Select Date <span className="text-red-500">*</span>
              </label>

              <div className="border border-slate-200 p-4 bg-white">
                {/* Month Selector */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    disabled={!canGoBack}
                    aria-label="Previous month"
                    className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-[13px] font-bold text-slate-900">{monthLabel}</span>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    disabled={!canGoForward}
                    aria-label="Next month"
                    className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {weekDays.map((d) => (
                    <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: firstWeekday }, (_, i) => <span key={`blank-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const value = `${monthKey}-${pad(day)}`;
                    const isSelected = b.date === value;
                    const fullyBooked = value === today && !instantAvailable(value) && !TIME_SLOTS.some((s) => slotAvailable(value, s.start));
                    const disabled = value < today || value > lastDay || fullyBooked;
                    return (
                      <button
                        type="button"
                        key={value}
                        disabled={disabled}
                        onClick={() => b.chooseDate(value)}
                        aria-pressed={isSelected}
                        aria-label={prettyDate(value, true)}
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#f5a623] text-white font-bold shadow-sm"
                            : disabled
                              ? "text-slate-300 cursor-not-allowed"
                              : value === today
                                ? "text-[#b5730f] font-bold ring-1 ring-[#f5a623]/50 hover:bg-slate-100"
                                : "text-slate-700 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Banner Box */}
              <div className="bg-[#fff6e8] border border-[#f5a623]/40 p-3 flex items-start gap-2.5">
                <CalendarIcon className="w-4 h-4 text-[#b5730f] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold text-[#b5730f] uppercase tracking-wider">Selected Date</div>
                  <div className="text-[12px] font-bold text-slate-900 mt-0.5">{b.date ? prettyDate(b.date, true) : "Pick a date on the calendar"}</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Time Slots & Custom Time Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                  Select Time Slot <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => b.setIsCustomTime(!b.isCustomTime)}
                  className="text-[10px] text-[#b5730f] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  {b.isCustomTime ? "Show standard slots" : "Click for custom time"}
                </button>
              </div>

              {!b.isCustomTime ? (
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const isInstant = slot.label === INSTANT_SLOT;
                    const available = !b.date || isInstant || slotAvailable(b.date, slot.start);
                    const active = b.slot === slot.label;
                    return (
                      <button
                        type="button"
                        key={slot.label}
                        disabled={!available}
                        onClick={() => b.setSlot(slot.label)}
                        aria-pressed={active}
                        className={`w-full p-2.5 border flex items-center justify-between text-left transition-all cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-40 ${
                          active
                            ? "border-[#f5a623] bg-[#fff6e8] text-slate-900 font-bold ring-1 ring-[#f5a623]"
                            : isInstant
                              ? "border-amber-300 bg-amber-50/50 text-slate-800 font-medium hover:border-amber-400 hover:bg-amber-50"
                              : "border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              active ? "border-[#f5a623] bg-[#f5a623] text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {active && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                          </div>
                          <span className="text-[11.5px] flex items-center gap-1.5">
                            {isInstant && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                            {slot.label}
                          </span>
                        </div>
                        {isInstant && (
                          <span className="text-[9.5px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded shrink-0">
                            ⚡ Fastest
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-slate-200 p-4 bg-white space-y-3">
                  <label htmlFor="custom-time" className="block text-[11px] font-bold text-slate-900">Enter Custom Time</label>
                  <input
                    id="custom-time"
                    type="time"
                    min="07:00"
                    max="21:00"
                    value={b.customTime}
                    onChange={(e) => b.setCustomTime(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-[13px] font-bold outline-none focus:border-[#f5a623] bg-white cursor-pointer"
                  />
                  <p className={`text-[10px] font-normal ${customProblem ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                    {customProblem || "Select a specific time (07:00 AM – 09:00 PM) for our expert to arrive."}
                  </p>
                </div>
              )}

              {/* Duration Box */}
              <div className="bg-[#fff6e8]/50 border border-[#f5a623]/30 p-3 flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f5a623]" />
                  Duration
                </div>
                <div className="text-[11px] font-semibold text-emerald-600">
                  {b.hours} hour{b.hours > 1 ? "s" : ""}
                  {b.extraTimeCharge ? " + extra time" : ""} · {b.helpers} maid{b.helpers > 1 ? "s" : ""}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-slate-50 border border-slate-200 p-3 space-y-1">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#f5a623]" />
                  Important Notes
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                  Our expert will arrive within the selected time slot. You will receive a call or WhatsApp message from our team before the visit.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <button
          type="button"
          onClick={() => b.goTo(1)}
          className="border border-slate-300 bg-white text-slate-700 px-4 py-2 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          form="step2-form"
          type="submit"
          className="bg-[#f5a623] hover:bg-[#e0951a] text-white px-6 py-2.5 font-bold text-[12px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
        >
          Continue to Personal Info
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
