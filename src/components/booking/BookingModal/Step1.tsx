"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, Clock, Info, ListChecks, Minus, Plus, Users } from "lucide-react";
import { EXTRA_TIME_OPTIONS } from "@/lib/api/helpNowBookings";
import { MAX_HELPERS, MAX_HOURS, PROPERTY_OPTIONS, type HelpNowBooking } from "../useHelpNowBooking";

// Same card shadow as the City Calls booking form.
export const STEP_CARD_SHADOW = "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px";

// Laid out like Step 2 (Choose Date & Time): one card, icon heading, field
// labels, amber-outlined picks, and the same footer bar.
const LABEL = "block text-[11px] font-semibold text-slate-900";
const optionClass = (selected: boolean) =>
  `rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
    selected ? "border-[#f5a623] bg-[#fff6e8] text-slate-900 ring-1 ring-[#f5a623]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
  }`;

function Field({ label, aside, children }: { label: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className={LABEL}>{label}</label>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Stepper({ value, min, max, onChange, label, unit }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string; unit: string }) {
  const btn = "flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-1.5">
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="text-[13px] font-semibold text-slate-900" aria-live="polite">
        {value} {unit}
        {value > 1 ? "s" : ""}
      </span>
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Service & Hours: home size, maids, hours, optional extra time and the
// tasks for this service.
export function Step1({ b }: { b: HelpNowBooking }) {
  const { service } = b;
  const allTasks = b.tasks.length === service.tasks.length;
  const setHours = (h: number) => b.chooseHours(h, h > 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = b.stepProblem(1);
    if (problem) {
      b.setError(problem);
      return;
    }
    b.goTo(2);
  };

  return (
    <div className="bg-white mt-1 relative overflow-hidden rounded-2xl" style={{ boxShadow: STEP_CARD_SHADOW }}>
      <div className="px-4 pt-4 pb-5 md:px-6 md:pt-4 md:pb-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-[16px] font-semibold text-slate-900">
              <Users className="h-4 w-4 text-[#f5a623]" />
              Select Maids & Duration
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">Choose your home, helpers, hours and what needs doing.</p>
          </div>
          <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            ₹{b.ratePerHour} / hr per helper
          </span>
        </div>

        <form id="step1-form" onSubmit={handleSubmit} className="space-y-5">
          <Field label={<>Home Size <span className="text-red-500">*</span></>}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PROPERTY_OPTIONS.map((opt) => (
                <button key={opt.id} type="button" aria-pressed={b.property.id === opt.id} onClick={() => b.chooseProperty(opt.id)} className={optionClass(b.property.id === opt.id)}>
                  <span className="block text-[11.5px] font-semibold leading-tight">{opt.name}</span>
                  <span className="mt-0.5 block text-[9.5px] font-medium text-slate-400">
                    {opt.maids} maid{opt.maids > 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={<>Number of Maids <span className="text-red-500">*</span></>} aside={<span className="text-[10px] font-medium text-slate-400">{b.property.name} usually needs {b.property.maids}</span>}>
              <Stepper value={b.helpers} min={1} max={MAX_HELPERS} onChange={b.changeHelpers} label="maids" unit="Maid" />
            </Field>
            <Field
              label={<>Working Hours <span className="text-red-500">*</span></>}
              aside={
                <span className="flex gap-1">
                  {[1, 2, 3, 4].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${b.hours === h ? "bg-[#f5a623] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {h}h
                    </button>
                  ))}
                </span>
              }
            >
              <Stepper value={b.hours} min={1} max={MAX_HOURS} onChange={setHours} label="hours" unit="Hour" />
            </Field>
          </div>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#f5a623]" /> Extra Time Protection (Optional)
              </span>
            }
            aside={<span className="text-[10px] font-medium text-red-500">In case of deep grease/dirt</span>}
          >
            <div className="grid grid-cols-3 gap-2">
              {EXTRA_TIME_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" aria-pressed={b.extraTime === opt.value} onClick={() => b.setExtraTime(opt.value)} className={optionClass(b.extraTime === opt.value)}>
                  <span className="block text-[11.5px] font-semibold">{opt.label}</span>
                  <span className="block text-[10px] font-semibold text-emerald-600">{opt.charge ? `+₹${opt.charge}` : "₹0"}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-3.5 w-3.5 text-[#f5a623]" /> Tasks <span className="text-red-500">*</span>
              </span>
            }
            aside={
              <button type="button" onClick={() => b.setAllTasks(!allTasks)} className="text-[10px] font-semibold text-[#b5730f] hover:underline">
                {allTasks ? "Clear all" : "Select all"}
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {service.tasks.map((task) => {
                const checked = b.tasks.includes(task.name);
                return (
                  <button
                    key={task.name}
                    type="button"
                    onClick={() => b.toggleTask(task.name)}
                    aria-pressed={checked}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                      checked ? "border-[#f5a623] bg-[#fff6e8] ring-1 ring-[#f5a623]" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${checked ? "border-[#f5a623] bg-[#f5a623] text-white" : "border-slate-300 bg-white"}`}>
                      {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11.5px] font-semibold text-slate-900">{task.short}</span>
                      <span className="block truncate text-[10px] font-medium text-slate-500">{task.detail}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex items-start gap-1.5 border border-slate-200 bg-slate-50 p-3 rounded-lg">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5a623]" />
            <p className="text-[10px] font-medium leading-relaxed text-slate-600">All selected tasks are included in the hourly price — no extra charge per task.</p>
          </div>
        </form>
      </div>

      {/* Footer — same as Step 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Estimated Total</div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-lg font-semibold text-emerald-600">₹{b.subtotal}</span>
            <span className="text-[11px] font-medium text-slate-500">
              ({b.helpers} maid{b.helpers > 1 ? "s" : ""} · {b.hours} hr{b.hours > 1 ? "s" : ""}
              {b.extraTimeCharge ? " + extra" : ""})
            </span>
          </div>
        </div>
        <button
          form="step1-form"
          type="submit"
          className="flex items-center gap-2 bg-[#f5a623] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#e0951a] cursor-pointer"
        >
          Continue to Date & Time
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
