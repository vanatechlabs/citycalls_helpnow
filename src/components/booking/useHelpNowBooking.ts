"use client";

import { useEffect, useState } from "react";
import type { HelpNowService } from "@/data/helpNowServices";
import {
  EXTRA_TIME_OPTIONS,
  HelpNowApiError,
  confirmHelpNowPayment,
  createHelpNowBooking,
  fetchHelpNowQuote,
  lookupPincode,
  requestHelpNowOtp,
  verifyHelpNowOtp,
  type HelpNowExtraTime,
  type HelpNowQuote,
} from "@/lib/api/helpNowBookings";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/lib/razorpay";

// All state and actions of the Help Now booking flow (Service & Hours →
// Date & Time → Personal Info → Review → Payment), shared by the booking
// modal and the service pages. Prices here are a preview; the backend prices
// every booking again.

export const PROPERTY_OPTIONS = [
  { id: "1 BHK", name: "1 BHK", maids: 1 },
  { id: "2 BHK", name: "2 BHK", maids: 1 },
  { id: "3 BHK", name: "3 BHK", maids: 2 },
  { id: "4 BHK", name: "4 BHK", maids: 3 },
  { id: "Villa / Duplex", name: "Villa / Duplex", maids: 3 },
  { id: "Bungalow / Estate", name: "Bungalow / Estate", maids: 4 },
] as const;

export const MAX_HOURS = 16;
export const MAX_HELPERS = 4;
export const CUSTOM_HOURS_FROM = 5;
export const BOOKING_WINDOW_DAYS = 60;

export const INSTANT_SLOT = "Instant (Within 30-45 mins)";
// `start` is the slot's first hour (24h, India time).
export const TIME_SLOTS = [
  { label: "09:00 AM - 11:00 AM", start: 9 },
  { label: "11:00 AM - 01:00 PM", start: 11 },
  { label: "01:00 PM - 03:00 PM", start: 13 },
  { label: "03:00 PM - 05:00 PM", start: 15 },
  { label: "05:00 PM - 07:00 PM", start: 17 },
  { label: "07:00 PM - 09:00 PM", start: 19 },
];
// Helpers can be sent between these hours; a same-day slot needs notice.
const WORK_START = 7;
const WORK_END = 21;
const SAME_DAY_NOTICE_HOURS = 2;
const INSTANT_LAST_HOUR = 19;

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";
type OtpStatus = "idle" | "sending" | "sent" | "verifying" | "verified";
export interface OtpState {
  status: OtpStatus;
  code: string;
  token: string;
  error: string;
  resendIn: number;
}
const freshOtp = (): OtpState => ({ status: "idle", code: "", token: "", error: "", resendIn: 0 });

export interface Confirmation {
  registrationNo: string;
  total: number;
  paidOnline: boolean;
}

export interface BookingSummary {
  helpers: number;
  hours: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
}

// --- India-time helpers -----------------------------------------------------
export const istDate = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
function istNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { date: istDate(new Date()), minutes: get("hour") * 60 + get("minute") };
}
export function lastBookableDate() {
  return istDate(new Date(Date.now() + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000));
}
export function prettyDate(value: string, long = false) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${value}T12:00:00+05:30`));
}
export function to12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function slotAvailable(date: string, start: number) {
  const now = istNow();
  if (date !== now.date) return true;
  return start * 60 >= now.minutes + SAME_DAY_NOTICE_HOURS * 60;
}
export function instantAvailable(date: string) {
  const now = istNow();
  return date === now.date && now.minutes >= WORK_START * 60 && now.minutes < INSTANT_LAST_HOUR * 60;
}
// "" when fine, otherwise why the custom time can't be booked.
export function customTimeProblem(date: string, time: string) {
  if (!time) return "Pick a time.";
  const [h, m] = time.split(":").map(Number);
  const minutes = h * 60 + m;
  if (minutes < WORK_START * 60 || minutes > WORK_END * 60) return "Helpers come between 07:00 AM and 09:00 PM.";
  const now = istNow();
  if (date === now.date && minutes < now.minutes + 60) return "For today, pick a time at least 1 hour from now.";
  return "";
}

// Which step to send the customer back to when the server rejects a field.
const FIELD_STEP: Record<string, number> = {
  hours: 1, helpers: 1, tasks: 1, extraTime: 1, propertyType: 1,
  preferredDate: 2, timeSlot: 2,
  fullName: 3, email: 3, phone: 3, altPhone: 3, address: 3, pincode: 3, city: 3, state: 3, instructions: 3,
  phoneVerificationToken: 3, altPhoneVerificationToken: 3,
  couponCode: 4,
};

export function useHelpNowBooking(service: HelpNowService, onSummaryChange?: (summary: BookingSummary) => void, initialCoupon?: string) {
  const [step, setStep] = useState(1);

  // Step 1 — service & hours
  const [propertyId, setPropertyId] = useState<string>(PROPERTY_OPTIONS[0].id);
  const [helpers, setHelpers] = useState(1);
  const [hours, setHours] = useState(service.defaultHours);
  const [isOtherHours, setIsOtherHours] = useState(false);
  const [extraTime, setExtraTime] = useState<HelpNowExtraTime>("NONE");
  const [tasks, setTasks] = useState<string[]>(() => service.tasks.map((task) => task.name));

  // Step 2 — date & time ("" until picked; filled on the client only)
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState("");

  // Step 3 — personal info
  const [details, setDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    altPhone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    language: "English",
    heardFrom: "",
    instructions: "",
  });
  const [otp, setOtp] = useState<{ phone: OtpState; altPhone: OtpState }>({ phone: freshOtp(), altPhone: freshOtp() });
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "found" | "notFound">("idle");

  // Step 4 — coupon
  const [couponInput, setCouponInput] = useState(initialCoupon?.toUpperCase() ?? "");
  // A coupon picked before the form opened is applied once the Review step shows.
  const [autoApplyCoupon, setAutoApplyCoupon] = useState(Boolean(initialCoupon));
  const [couponQuote, setCouponQuote] = useState<HelpNowQuote | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Step 5 — payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const property = PROPERTY_OPTIONS.find((p) => p.id === propertyId) ?? PROPERTY_OPTIONS[0];
  const extraTimeCharge = EXTRA_TIME_OPTIONS.find((o) => o.value === extraTime)?.charge ?? 0;
  const baseFare = service.ratePerHour * hours * helpers;
  const subtotal = baseFare + extraTimeCharge;
  // A coupon quote only counts for the plan it was worked out for.
  const activeCoupon =
    couponQuote && couponQuote.hours === hours && couponQuote.helpers === helpers && couponQuote.extraTime === extraTime ? couponQuote : null;
  const appliedCode = couponQuote?.coupon?.code ?? null;
  const discount = activeCoupon?.discount ?? 0;
  const total = subtotal - discount;
  const timeSlot = isCustomTime ? (customTime ? `Custom: ${to12h(customTime)}` : "") : slot;

  useEffect(() => {
    onSummaryChange?.({ helpers, hours, subtotal, discount, total, couponCode: activeCoupon?.coupon?.code ?? null });
  }, [helpers, hours, subtotal, discount, total, activeCoupon, onSummaryChange]);

  // Plan changed after a coupon was applied: price the coupon again.
  useEffect(() => {
    if (!appliedCode || activeCoupon) return;
    let cancelled = false;
    fetchHelpNowQuote({ serviceSlug: service.slug, hours, helpers, extraTime, couponCode: appliedCode })
      .then((quote) => !cancelled && setCouponQuote(quote))
      .catch((err: unknown) => {
        if (cancelled) return;
        setCouponQuote(null);
        setCouponError(err instanceof Error ? err.message : "Coupon removed");
      });
    return () => {
      cancelled = true;
    };
  }, [appliedCode, activeCoupon, hours, helpers, extraTime, service.slug]);

  // OTP resend countdowns.
  const counting = otp.phone.resendIn > 0 || otp.altPhone.resendIn > 0;
  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => {
      setOtp((prev) => ({
        phone: { ...prev.phone, resendIn: Math.max(0, prev.phone.resendIn - 1) },
        altPhone: { ...prev.altPhone, resendIn: Math.max(0, prev.altPhone.resendIn - 1) },
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  // Warm up Checkout while the customer chooses how to pay.
  useEffect(() => {
    if (step === 5 && paymentMethod !== "cod") loadRazorpayCheckout().catch(() => undefined);
  }, [step, paymentMethod]);

  function goTo(next: number) {
    setError("");
    setStep(next);
    // A coupon picked before the form opened is applied on reaching Review.
    if (next === 4 && autoApplyCoupon) {
      setAutoApplyCoupon(false);
      void applyCoupon();
    }
  }

  // --- Step 1
  function chooseProperty(id: string) {
    const option = PROPERTY_OPTIONS.find((p) => p.id === id);
    if (!option) return;
    setPropertyId(option.id);
    setHelpers(option.maids);
  }
  function changeHelpers(value: number) {
    setHelpers(Math.min(MAX_HELPERS, Math.max(1, value)));
  }
  function chooseHours(value: number, other = false) {
    setIsOtherHours(other);
    setHours(Math.min(MAX_HOURS, Math.max(1, value)));
  }
  function toggleTask(name: string) {
    setTasks((current) => (current.includes(name) ? current.filter((t) => t !== name) : [...current, name]));
  }
  function setAllTasks(all: boolean) {
    setTasks(all ? service.tasks.map((task) => task.name) : []);
  }

  // --- Step 2
  function chooseDate(value: string) {
    setDate(value);
    // Drop a slot that's no longer possible on the new day.
    if (slot === INSTANT_SLOT && !instantAvailable(value)) setSlot("");
    const standard = TIME_SLOTS.find((s) => s.label === slot);
    if (standard && !slotAvailable(value, standard.start)) setSlot("");
  }

  // --- Step 3
  function updateDetail(key: keyof typeof details, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
    // A changed number has to be verified again.
    if (key === "phone" || key === "altPhone") setOtp((prev) => ({ ...prev, [key]: freshOtp() }));
  }

  async function changePincode(value: string) {
    const pincode = value.replace(/\D/g, "").slice(0, 6);
    setDetails((current) => ({ ...current, pincode }));
    if (pincode.length !== 6) {
      setPincodeStatus("idle");
      return;
    }
    setPincodeStatus("loading");
    const place = await lookupPincode(pincode);
    if (place) {
      setDetails((current) => (current.pincode === pincode ? { ...current, city: place.city, state: place.state } : current));
      setPincodeStatus("found");
    } else {
      setPincodeStatus("notFound");
    }
  }

  const patchOtp = (field: "phone" | "altPhone", patch: Partial<OtpState>) =>
    setOtp((prev) => ({ ...prev, [field]: { ...prev[field], ...patch } }));

  async function sendOtp(field: "phone" | "altPhone") {
    const number = details[field];
    if (!/^\d{10}$/.test(number)) {
      patchOtp(field, { error: "Enter a 10-digit mobile number first." });
      return;
    }
    if (field === "altPhone" && number === details.phone) {
      patchOtp(field, { error: "Use a different number from your main phone." });
      return;
    }
    patchOtp(field, { status: "sending", error: "", code: "" });
    try {
      const result = await requestHelpNowOtp(number);
      patchOtp(field, { status: "sent", resendIn: result.resendAfterSeconds });
    } catch (err) {
      patchOtp(field, { status: "idle", error: err instanceof Error ? err.message : "Could not send the OTP." });
    }
  }

  async function verifyOtp(field: "phone" | "altPhone") {
    const code = otp[field].code;
    if (!/^\d{6}$/.test(code)) {
      patchOtp(field, { error: "Enter the 6-digit OTP." });
      return;
    }
    patchOtp(field, { status: "verifying", error: "" });
    try {
      const { token } = await verifyHelpNowOtp(details[field], code);
      patchOtp(field, { status: "verified", token, error: "" });
    } catch (err) {
      patchOtp(field, { status: "sent", error: err instanceof Error ? err.message : "Could not verify the OTP." });
    }
  }

  // --- Step checks: "" when the step is complete, otherwise what's missing.
  function stepProblem(which: number) {
    if (which === 1) return tasks.length ? "" : "Select at least one task for your helper.";
    if (which === 2) {
      if (!date) return "Please pick a date.";
      if (isCustomTime) return customTimeProblem(date, customTime);
      return slot ? "" : "Please pick a time slot.";
    }
    if (which === 3) {
      if (otp.phone.status !== "verified") return "Please verify your phone number with the OTP.";
      if (details.altPhone && !/^\d{10}$/.test(details.altPhone)) return "Alternate number must be 10 digits, or leave it empty.";
      if (!details.city || !details.state) return "Enter a valid pincode so we can fill in your city and state.";
      return "";
    }
    return "";
  }

  // --- Step 4
  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      setCouponQuote(await fetchHelpNowQuote({ serviceSlug: service.slug, hours, helpers, extraTime, couponCode: code }));
    } catch (err) {
      setCouponQuote(null);
      setCouponError(err instanceof Error ? err.message : "This coupon code is not valid");
    } finally {
      setCheckingCoupon(false);
    }
  }
  function removeCoupon() {
    setCouponQuote(null);
    setCouponInput("");
    setCouponError("");
  }

  function showServerError(err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    const field = err instanceof HelpNowApiError ? err.field : undefined;
    if (field === "couponCode") {
      setCouponQuote(null);
      setCouponError(message);
    }
    if (field === "phone" || field === "phoneVerificationToken") setOtp((prev) => ({ ...prev, phone: freshOtp() }));
    if (field === "altPhone" || field === "altPhoneVerificationToken") setOtp((prev) => ({ ...prev, altPhone: freshOtp() }));
    setError(message);
    if (field && FIELD_STEP[field]) setStep(FIELD_STEP[field]);
  }

  // --- Step 5
  async function placeBooking() {
    setSubmitting(true);
    setError("");
    const paymentMode = paymentMethod === "cod" ? "AFTER_SERVICE" : "ONLINE";
    try {
      const result = await createHelpNowBooking({
        serviceSlug: service.slug,
        hours,
        helpers,
        extraTime,
        couponCode: activeCoupon?.coupon?.code,
        fullName: details.fullName,
        email: details.email,
        phone: details.phone,
        altPhone: details.altPhone || undefined,
        address: details.address,
        pincode: details.pincode,
        city: details.city,
        state: details.state,
        instructions: details.instructions || undefined,
        language: details.language || undefined,
        heardFrom: details.heardFrom || undefined,
        propertyType: property.id,
        phoneVerificationToken: otp.phone.token,
        tasks,
        preferredDate: date,
        timeSlot,
        paymentMode,
      });

      if (!result.paymentRequired) {
        setConfirmation({ registrationNo: result.booking.registrationNo, total: result.quote.total, paidOnline: false });
        setSubmitting(false);
        return;
      }

      await loadRazorpayCheckout();
      const { checkout } = result;
      openRazorpayCheckout(
        {
          key: checkout.keyId,
          order_id: checkout.orderId,
          amount: checkout.amount,
          currency: checkout.currency,
          name: "Help Now by CityCalls",
          description: checkout.description,
          prefill: { ...checkout.prefill, method: paymentMethod === "cod" ? undefined : paymentMethod },
          theme: { color: "#f5a623" },
          handler: async (response) => {
            try {
              const booking = await confirmHelpNowPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setConfirmation({ registrationNo: booking.registrationNo, total: booking.total, paidOnline: true });
            } catch (err) {
              showServerError(err);
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setError("Payment was cancelled. You can try again, or choose Pay After Service.");
            },
          },
        },
        (message) => setError(message)
      );
    } catch (err) {
      showServerError(err);
      setSubmitting(false);
    }
  }

  return {
    service,
    step,
    goTo,
    error,
    setError,
    stepProblem,
    // step 1
    property,
    chooseProperty,
    helpers,
    changeHelpers,
    hours,
    isOtherHours,
    chooseHours,
    extraTime,
    setExtraTime,
    extraTimeCharge,
    tasks,
    toggleTask,
    setAllTasks,
    // step 2
    date,
    chooseDate,
    slot,
    setSlot,
    isCustomTime,
    setIsCustomTime,
    customTime,
    setCustomTime,
    timeSlot,
    // step 3
    details,
    updateDetail,
    changePincode,
    pincodeStatus,
    otp,
    setOtpCode: (field: "phone" | "altPhone", code: string) => patchOtp(field, { code: code.replace(/\D/g, "").slice(0, 6), error: "" }),
    sendOtp,
    verifyOtp,
    // step 4
    baseFare,
    subtotal,
    discount,
    total,
    activeCoupon,
    appliedCode,
    couponInput,
    setCouponInput: (value: string) => {
      setCouponInput(value.toUpperCase());
      setCouponError("");
    },
    couponError,
    checkingCoupon,
    applyCoupon,
    removeCoupon,
    // step 5
    paymentMethod,
    setPaymentMethod,
    submitting,
    placeBooking,
    confirmation,
  };
}

export type HelpNowBooking = ReturnType<typeof useHelpNowBooking>;
