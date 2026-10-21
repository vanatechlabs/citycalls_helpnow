import type { HelpNowServiceSlug } from "@/data/helpNowServices";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const BOOKINGS_URL = `${API_BASE_URL}/public/websites/help-now/bookings`;

// Backend: src/modules/websites/help-now/bookings. Prices are always worked
// out on the server; the numbers shown before a quote are only a preview.

export interface HelpNowQuote {
  serviceSlug: HelpNowServiceSlug;
  serviceName: string;
  ratePerHour: number;
  hours: number;
  helpers: number;
  extraTime: HelpNowExtraTime;
  extraTimeCharge: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: { code: string; label: string } | null;
}

export type HelpNowPaymentMode = "ONLINE" | "AFTER_SERVICE";

// Optional buffer for heavy grease / dirt — same charges as the backend
// (helpNowPricing.ts → HELP_NOW_EXTRA_TIME).
export type HelpNowExtraTime = "NONE" | "MIN_30" | "HOUR_1";
export const EXTRA_TIME_OPTIONS: { value: HelpNowExtraTime; label: string; charge: number }[] = [
  { value: "NONE", label: "None", charge: 0 },
  { value: "MIN_30", label: "+30 Mins Extra", charge: 79 },
  { value: "HOUR_1", label: "+1 Hour Extra", charge: 149 },
];

export interface HelpNowBookingPayload {
  serviceSlug: HelpNowServiceSlug;
  hours: number;
  helpers: number;
  extraTime: HelpNowExtraTime;
  couponCode?: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  instructions?: string;
  language?: string;
  heardFrom?: string;
  propertyType?: string;
  phoneVerificationToken: string;
  tasks: string[];
  // "2026-10-21"
  preferredDate: string;
  timeSlot: string;
  paymentMode: HelpNowPaymentMode;
}

export interface HelpNowCheckout {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

export interface HelpNowConfirmedBooking {
  registrationNo: string;
  serviceName: string;
}

export type HelpNowBookingResult =
  | { paymentRequired: false; quote: HelpNowQuote; booking: HelpNowConfirmedBooking }
  | { paymentRequired: true; quote: HelpNowQuote; checkout: HelpNowCheckout };

// An error from the API, keeping which form field it is about.
export class HelpNowApiError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

async function post<T>(url: string, payload: unknown, fallbackMessage: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new HelpNowApiError("Could not reach Help Now. Please check your internet connection and try again.");
  }
  const body = (await response.json().catch(() => null)) as
    | { data?: T; message?: string; errors?: { field?: string; message: string }[] }
    | null;
  if (!response.ok || !body?.data) {
    const error = body?.errors?.[0];
    // Validation errors carry a generic top-level message; the field's own is clearer.
    throw new HelpNowApiError(error?.message || body?.message || fallbackMessage, error?.field);
  }
  return body.data;
}

export function fetchHelpNowQuote(input: {
  serviceSlug: HelpNowServiceSlug;
  hours: number;
  helpers: number;
  extraTime: HelpNowExtraTime;
  couponCode?: string;
}) {
  return post<HelpNowQuote>(`${BOOKINGS_URL}/quote`, input, "Could not check the price. Please try again.");
}

export function createHelpNowBooking(payload: HelpNowBookingPayload) {
  return post<HelpNowBookingResult>(BOOKINGS_URL, payload, "Could not place your booking. Please try again.");
}

export function confirmHelpNowPayment(input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
  return post<HelpNowConfirmedBooking & { total: number }>(
    `${BOOKINGS_URL}/verify-payment`,
    input,
    "We could not confirm your payment. If money was deducted, please call us on +91 74288 08884."
  );
}

// WhatsApp OTP for the phone numbers on a booking. A verified number returns
// a token the booking is sent with.
export function requestHelpNowOtp(phone: string) {
  return post<{ expiresInSeconds: number; resendAfterSeconds: number }>(
    `${BOOKINGS_URL}/otp/request`,
    { phone },
    "Could not send the OTP. Please try again."
  );
}

export function verifyHelpNowOtp(phone: string, otp: string) {
  return post<{ token: string }>(`${BOOKINGS_URL}/otp/verify`, { phone, otp }, "Could not verify the OTP. Please try again.");
}

// City and state for an Indian pincode (India Post). null when not found.
export async function lookupPincode(pincode: string): Promise<{ city: string; state: string } | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { signal: AbortSignal.timeout(8000) });
    const body = (await response.json()) as { Status?: string; PostOffice?: { District?: string; State?: string }[] | null }[];
    const office = body?.[0]?.Status === "Success" ? body[0].PostOffice?.[0] : undefined;
    return office?.District && office.State ? { city: office.District, state: office.State } : null;
  } catch {
    return null;
  }
}

// "Book Now" quick form (Help Now backend: websites/help-now/quick-bookings) —
// lands in Admin → Enquiry Section → Help Now Booking for the team to call back.
export function submitQuickBooking(payload: { name: string; phone: string; services: string[]; message?: string; page?: string }) {
  return post<{ referenceNo: string; services: string[] }>(
    `${API_BASE_URL}/public/websites/help-now/quick-bookings`,
    payload,
    "Could not send your request. Please try again or call us."
  );
}

export interface HelpNowCoupon {
  code: string;
  label: string;
  type: "PERCENT" | "FLAT";
  value: number;
  maxDiscount: number | null;
  minSubtotal: number;
  // Only these services; null = every service.
  services: HelpNowServiceSlug[] | null;
}

// Coupons the backend accepts (shown on the home page's pricing section).
export async function fetchHelpNowCoupons(signal?: AbortSignal): Promise<HelpNowCoupon[]> {
  const response = await fetch(`${BOOKINGS_URL}/coupons`, { signal });
  const body = (await response.json().catch(() => null)) as { data?: HelpNowCoupon[] } | null;
  if (!response.ok || !body?.data) throw new HelpNowApiError("Could not load coupons");
  return body.data;
}
