"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ArrowRight, CalendarDays, Check, CheckCircle, ChevronDown, Loader2, Phone, PhoneCall, Search, ShieldCheck, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { helpNowServices } from "@/data/helpNowServices";
import { submitQuickBooking } from "@/lib/api/helpNowBookings";

// Help Now "Book Now" quick form — the City Calls Quick Book dialog in Help
// Now's amber theme. Name, phone, services and an optional message land in
// Admin → Enquiry Section → Help Now Booking for the team to call back.

interface ServiceOption {
  name: string;
  path?: string;
}

const SERVICES: ServiceOption[] = helpNowServices.map((s) => ({ name: s.name, path: `/services/${s.slug}` }));
// Must match the backend's HELP_NOW_QUICK_BOOKING_NOT_SURE.
const NOT_SURE: ServiceOption = { name: "Not sure — please call me" };
const POPULAR = ["House Cleaning", "Dish Washing", "Kitchen Assistance", "Bathroom Cleaning", "Laundry & Ironing"];

const AMBER = "#f5a623";
const AMBER_DARK = "#b5730f";
const LABEL = "mb-1.5 block text-[11px] font-bold text-ink";
const INPUT =
  "w-full rounded border border-black/20 px-3 py-1.5 text-[12px] font-medium outline-none transition-colors placeholder:font-normal placeholder:text-ink/40 focus:border-[#f5a623]";
const SUPPORT_PHONE = "+91 74288 08884";
const SUPPORT_TEL = "+917428808884";
const HELPER_LOTTIE = "https://lottie.host/b43fbb7e-5f4c-420a-b516-1e9cd26810ec/gf22SDhjCv.lottie";

const POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PhoneCall, title: "Quick Confirmation", text: "We will call you shortly" },
  { icon: CalendarDays, title: "Flexible Scheduling", text: "Choose date & time as per your convenience" },
  { icon: ShieldCheck, title: "Verified Professionals", text: "Trained & background checked" },
];

// "Are we in the browser" — true after hydration, without a mounted-state effect.
const noopSubscribe = () => () => {};

export function useInBrowser() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// The dialog, rendered into <body>. `open` comes from the caller (the
// navbar's Book Now button).
export function HelpNowQuickBook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const inBrowser = useInBrowser();

  // Lock page scroll and close on Escape while the form is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!inBrowser) return null;
  return createPortal(<AnimatePresence>{open && <QuickBookDialog page={`Help Now ${pathname}`} onClose={onClose} />}</AnimatePresence>, document.body);
}

function SidePanel() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#fff4dc] via-[#fffaf0] to-white px-7 pt-7">
      <span aria-hidden className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-white/60" />
      <span aria-hidden className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-[#f5a623]/[0.06]" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5a623]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8a5608] shadow-[0_4px_14px_-6px_rgba(245,166,35,0.6)] ring-1 ring-[#f5a623]/25">
          <Zap className="h-3 w-3 fill-[#f5a623] text-[#f5a623]" />
          Instant Booking
        </span>

        <h3 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-tight text-ink">
          Book a<br />
          Maid in<br />
          <span className="text-[#e08e0b]">30 Seconds</span>
        </h3>
        <svg aria-hidden viewBox="0 0 140 12" className="mt-1.5 h-2.5 w-28" fill="none">
          <path d="M3 9 C 40 2, 90 1, 137 5" stroke={AMBER} strokeWidth="4" strokeLinecap="round" />
        </svg>

        <p className="mt-3 text-[12px] leading-relaxed text-ink/65">Share a few details and our team will call you back to confirm your visit.</p>

        <ul className="mt-5 space-y-3.5">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5 text-[#e08e0b]" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block text-[12px] font-bold text-ink">{title}</span>
                <span className="block text-[10.5px] leading-snug text-ink/60">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative -mx-3 mt-auto shrink-0 pb-4 pt-4">
        <Image
          src="/assets/icons/quick.webp"
          alt="Calendar with a tick and a phone saying we'll call you soon"
          width={1460}
          height={880}
          sizes="320px"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

function QuickBookDialog({ page, onClose }: { page: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<ServiceOption[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ referenceNo: string; phone: string; name: string } | null>(null);

  const isSelected = (s: ServiceOption) => selected.some((x) => x.name === s.name);
  const toggleService = (s: ServiceOption) =>
    setSelected((prev) => (prev.some((x) => x.name === s.name) ? prev.filter((x) => x.name !== s.name) : [...prev, s]));

  function reset() {
    setName("");
    setPhone("");
    setSelected([]);
    setMessage("");
    setError("");
    setDone(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Please enter a valid 10-digit mobile number.");
    if (selected.length === 0) return setError("Please choose at least one service.");

    setSending(true);
    try {
      const result = await submitQuickBooking({
        name: name.trim(),
        phone,
        services: selected.map((s) => s.name),
        message: message.trim() || undefined,
        page,
      });
      setDone({ referenceNo: result.referenceNo, phone, name: name.trim().split(/\s+/)[0] });
      // Success card, then a fresh form after 4s.
      setTimeout(reset, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again, or call us.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true" aria-labelledby="hn-quick-book-title">
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(6px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex max-h-[90vh] w-[95vw] max-w-[860px] flex-col overflow-hidden rounded-md bg-white md:flex-row"
        style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md bg-red-500 p-1 text-white shadow-sm transition-colors hover:bg-red-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="hidden w-[36%] min-w-[280px] border-r border-black/5 md:block">
          <SidePanel />
        </div>

        <div data-lenis-prevent className="relative flex-1 overflow-y-auto p-6 pt-5 md:p-8 md:pt-6">
          <div className="pointer-events-none absolute right-16 top-1 z-10">
            <DotLottieReact src={HELPER_LOTTIE} loop autoplay className="h-[64px] w-[64px]" />
          </div>

          <div className="mb-5 pr-24">
            <h2 id="hn-quick-book-title" className="flex flex-wrap items-center gap-x-1 font-sans text-[22px] font-black uppercase leading-tight tracking-tight text-ink">
              <span>Quick</span>
              <span className="relative inline-block text-[#f5a623]">
                Booking
                <svg className="absolute -bottom-1 left-0 h-2.5 w-full" viewBox="0 0 150 10" fill="none" aria-hidden>
                  <motion.path
                    d="M0 8 L 150 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-1.5 text-xs font-medium text-ink/60">
              Verified maids <span className="mx-1 inline-block h-1 w-1 rounded-full bg-black/20 align-middle" /> We call you back to confirm
            </p>
          </div>

          <div className={`relative overflow-hidden rounded-xl ${done ? "border-2 border-green-500 bg-green-50 shadow-lg" : "border border-black/10 bg-white"}`}>
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center md:p-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                  <CheckCircle className="mb-6 h-24 w-24 text-green-500" />
                </motion.div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Booking Received Successfully!</h3>
                <p className="mb-3 max-w-md text-base text-gray-600 md:text-lg">
                  Thank you, {done.name}! Our team will call you on <strong className="text-gray-900">+91 {done.phone}</strong> to confirm your visit.
                </p>
                <p className="mb-8 text-sm text-gray-500">
                  Reference No: <span className="font-mono font-bold text-gray-900">{done.referenceNo}</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Form will reset automatically...
                </div>
              </motion.div>
            ) : (
              <>
                <form id="hn-quick-book-form" onSubmit={(e) => void submit(e)} className="px-4 pb-4 pt-3 md:px-5 md:pb-5" noValidate>
                  <h3 className="text-[14px] font-bold text-ink">Your Details</h3>
                  <p className="mb-4 mt-0.5 text-[11px] font-medium text-ink/60">Tell us what you need — we&apos;ll call you back to book the visit.</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={LABEL} htmlFor="hn-qb-name">Full Name <span className="text-red-500">*</span></label>
                        <input id="hn-qb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Enter your full name" className={INPUT} autoComplete="name" />
                      </div>
                      <div>
                        <label className={`${LABEL} flex items-baseline gap-x-1.5 whitespace-nowrap`} htmlFor="hn-qb-phone">
                          <span>Phone number <span className="text-red-500">*</span></span>
                          <span className="truncate text-[10px] font-medium text-red-500">— we&apos;ll call you here</span>
                        </label>
                        <div className="flex items-center overflow-hidden rounded border border-black/20 bg-white transition-colors focus-within:border-[#f5a623]">
                          <span className="border-r border-black/20 px-2 py-1.5 text-[12px] font-medium text-ink">+91</span>
                          <input
                            id="hn-qb-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="Enter your phone number"
                            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[12px] font-medium outline-none placeholder:font-normal placeholder:text-ink/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className={LABEL}>
                        Select Services <span className="text-red-500">*</span> <span className="font-medium text-ink/50">(you can pick more than one)</span>
                      </span>
                      <ServicePicker selected={selected} isSelected={isSelected} onToggle={toggleService} />
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-ink/50">Popular:</span>
                        {POPULAR.map((label) => {
                          const option = SERVICES.find((s) => s.name === label);
                          if (!option) return null;
                          const active = isSelected(option);
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => toggleService(option)}
                              className={`rounded border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                                active ? "border-[#f5a623] bg-[#f5a623] text-white" : "border-[#f5a623]/35 bg-[#f5a623]/10 text-[#8a5608] hover:bg-[#f5a623]/20"
                              }`}
                            >
                              {active && <Check className="mr-0.5 inline h-3 w-3" strokeWidth={3} />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className={LABEL} htmlFor="hn-qb-message">Message (Optional)</label>
                      <textarea
                        id="hn-qb-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="e.g. Need a maid for 3 hours tomorrow morning"
                        className={`${INPUT} resize-none`}
                      />
                    </div>
                  </div>

                  {error && <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">{error}</p>}
                </form>

                <div className="flex flex-col justify-between gap-3 border-t border-black/5 bg-black/[0.01] p-4 md:flex-row md:items-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-600 md:justify-start">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] font-medium">Your information is 100% secure and will never be shared.</span>
                  </div>
                  <button
                    form="hn-quick-book-form"
                    type="submit"
                    disabled={sending}
                    className="flex shrink-0 items-center justify-center gap-2 rounded bg-[#f5a623] px-6 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#e0951a] disabled:opacity-70"
                  >
                    {sending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <>Submit <ArrowRight className="h-3 w-3" /></>}
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] font-medium text-ink/60">
            Prefer to talk now?{" "}
            <a href={`tel:${SUPPORT_TEL}`} className="inline-flex items-center gap-1 font-bold hover:underline" style={{ color: AMBER_DARK }}>
              <Phone className="h-3 w-3" /> {SUPPORT_PHONE}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Searchable multi-select of Help Now services. Picked services show as
// removable chips in the field; the list stays open so several can be ticked.
function ServicePicker({ selected, isSelected, onToggle }: {
  selected: ServiceOption[];
  isSelected: (s: ServiceOption) => boolean;
  onToggle: (s: ServiceOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...SERVICES, NOT_SURE].filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div ref={boxRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen((v) => !v))}
        className={`${INPUT} flex min-h-[34px] cursor-pointer items-center justify-between gap-2 text-left ${open ? "border-[#f5a623]" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.length === 0 ? (
          <span className="font-normal text-ink/40">Select one or more services</span>
        ) : (
          <span className="flex min-w-0 flex-wrap gap-1">
            {selected.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1 rounded border border-[#f5a623]/40 bg-[#f5a623]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#8a5608]">
                {s.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(s);
                  }}
                  className="rounded text-[#8a5608]/70 hover:text-red-600"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-ink/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded border border-black/15 bg-white shadow-lg">
          <div className="relative border-b border-black/5 p-2">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded border border-black/15 py-1.5 pl-7 pr-3 text-[12px] font-medium outline-none placeholder:font-normal placeholder:text-ink/40 focus:border-[#f5a623]"
            />
          </div>
          <ul role="listbox" aria-multiselectable="true" data-lenis-prevent className="max-h-52 overflow-y-auto py-1">
            {list.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-ink/50">No service found — choose &quot;Not sure&quot; and tell us in the message.</li>
            ) : (
              <>
                <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#e08e0b]">Help Now Services</li>
                {list.map((s) => {
                  const checked = isSelected(s);
                  return (
                    <li key={s.name}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => onToggle(s)}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[#f5a623]/10 ${checked ? "font-bold text-[#8a5608]" : "font-medium text-ink"}`}
                      >
                        <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${checked ? "border-[#f5a623] bg-[#f5a623]" : "border-black/30"}`}>
                          {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                        </span>
                        {s.name}
                      </button>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-black/5 px-3 py-2">
            <span className="text-[11px] font-medium text-ink/60">{selected.length} selected</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded bg-[#f5a623] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#e0951a]">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
