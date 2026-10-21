// Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).
const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  // `method` opens Checkout on that tab (UPI, card or net banking).
  prefill?: { name?: string; email?: string; contact?: string; method?: "upi" | "card" | "netbanking" };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

// Loads checkout.js once, on demand (only when someone pays online).
export function loadRazorpayCheckout() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new Error("Could not load the payment window. Please check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loader;
}

export function openRazorpayCheckout(options: RazorpayOptions, onFailed: (message: string) => void) {
  if (!window.Razorpay) throw new Error("Payment window is not ready yet. Please try again.");
  const checkout = new window.Razorpay(options);
  checkout.on("payment.failed", (response) => onFailed(response.error.description || "Payment failed. Please try again."));
  checkout.open();
}
