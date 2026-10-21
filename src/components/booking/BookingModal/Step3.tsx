"use client";

import { Lock, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import type { HelpNowBooking, OtpState } from "../useHelpNowBooking";

const inputClass = "w-full border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-[#f5a623] font-medium";

// A +91 number with its WhatsApp OTP: Send OTP → enter code → Verify → ✓.
function OtpPhoneField({ label, required, hint, value, onChange, otp, onCode, onSend, onVerify }: {
  label: string;
  required?: boolean;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  otp: OtpState;
  onCode: (code: string) => void;
  onSend: () => void;
  onVerify: () => void;
}) {
  const verified = otp.status === "verified";
  const codeStage = otp.status === "sent" || otp.status === "verifying";
  const busy = otp.status === "sending" || otp.status === "verifying";
  const button = "text-[10px] font-bold text-white transition-colors px-3 py-1.5 shrink-0 whitespace-nowrap m-0.5 disabled:cursor-not-allowed";

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-900 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`flex items-center border ${verified ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"} focus-within:border-[#f5a623] transition-colors`}
      >
        <span className="px-2 py-2 border-r border-slate-300 text-[12px] font-medium text-slate-900">+91</span>
        <input
          required={required}
          type="tel"
          inputMode="numeric"
          autoComplete={required ? "tel-national" : undefined}
          pattern="\d{10}"
          title="10-digit mobile number"
          maxLength={10}
          placeholder={required ? "Enter your phone number" : "Enter alternate number"}
          className="flex-1 min-w-0 px-2 py-2 text-[12px] outline-none font-medium bg-transparent disabled:text-slate-700"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          disabled={verified || codeStage}
        />
        {verified ? (
          <div className="px-2 shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} /> Verified
          </div>
        ) : (
          // Always shown (greyed until 10 digits) so it's clear the number needs an OTP.
          !codeStage && (
            <button
              type="button"
              onClick={onSend}
              disabled={value.length !== 10 || busy}
              className={`${button} ${value.length === 10 ? "bg-[#f5a623] hover:bg-[#e0951a] cursor-pointer" : "bg-slate-300"}`}
            >
              {otp.status === "sending" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send OTP"}
            </button>
          )
        )}
      </div>

      {codeStage && (
        <div className="mt-1.5 flex items-center border border-slate-300 bg-white focus-within:border-[#f5a623]">
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            aria-label={`OTP for ${label}`}
            className="flex-1 min-w-0 px-3 py-2 text-[12px] outline-none font-bold text-center tracking-[0.4em]"
            value={otp.code}
            onChange={(e) => onCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onVerify();
              }
            }}
          />
          <button
            type="button"
            onClick={onVerify}
            disabled={otp.code.length !== 6 || busy}
            className={`${button} ${otp.code.length === 6 ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300"}`}
          >
            {otp.status === "verifying" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
          </button>
        </div>
      )}

      {otp.error ? (
        <p className="text-[10px] text-red-600 font-semibold mt-1">{otp.error}</p>
      ) : codeStage ? (
        <p className="text-[9.5px] text-slate-500 font-normal mt-1 flex items-center justify-between gap-2">
          <span>OTP sent on WhatsApp to +91 {value}.</span>
          <span className="flex gap-2 shrink-0">
            <button type="button" onClick={() => onChange(value)} className="font-bold text-[#b5730f] hover:underline">Change number</button>
            {otp.resendIn > 0 ? (
              <span>Resend in {otp.resendIn}s</span>
            ) : (
              <button type="button" onClick={onSend} className="font-bold text-[#b5730f] hover:underline">Resend OTP</button>
            )}
          </span>
        </p>
      ) : (
        <p className="text-[9.5px] text-slate-400 font-normal mt-1">{hint}</p>
      )}
    </div>
  );
}

// Personal Info: contact numbers (each verified by OTP), address with the
// city and state filled in from the pincode, and a few preferences.
export function Step3({ b }: { b: HelpNowBooking }) {
  const { details } = b;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = b.stepProblem(3);
    if (problem) {
      b.setError(problem);
      return;
    }
    b.goTo(4);
  };

  return (
    <div className="bg-white mt-1 relative overflow-hidden rounded-2xl" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
      <div className="px-4 pt-4 pb-5 md:px-6 md:pt-4 md:pb-6">
        <h3 className="text-[16px] font-bold text-slate-900">Personal Information</h3>
        <p className="text-slate-500 text-[11px] mt-0.5 mb-4 font-medium">Please provide your details so we can reach you easily</p>

        <form id="step3-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                autoComplete="name"
                maxLength={120}
                placeholder="Enter your full name"
                className={inputClass}
                value={details.fullName}
                onChange={(e) => b.updateDetail("fullName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={160}
                placeholder="Enter your email address"
                className={inputClass}
                value={details.email}
                onChange={(e) => b.updateDetail("email", e.target.value)}
              />
            </div>
          </div>

          {/* Phone Number with OTP & Alternate Number with OTP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <OtpPhoneField
              label="Phone number"
              required
              hint="Verify with the OTP we send on WhatsApp — we will call you on this number"
              value={details.phone}
              onChange={(v) => b.updateDetail("phone", v)}
              otp={b.otp.phone}
              onCode={(code) => b.setOtpCode("phone", code)}
              onSend={() => void b.sendOtp("phone")}
              onVerify={() => void b.verifyOtp("phone")}
            />
            {/* Plain number — only the main phone is verified by OTP */}
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">Alternate Number (Optional)</label>
              <div className="flex items-center border border-slate-300 bg-white focus-within:border-[#f5a623] transition-colors">
                <span className="px-2 py-2 border-r border-slate-300 text-[12px] font-medium text-slate-900">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
                  title="10-digit mobile number"
                  maxLength={10}
                  placeholder="Enter alternate number"
                  className="flex-1 min-w-0 px-2 py-2 text-[12px] outline-none font-medium bg-transparent"
                  value={details.altPhone}
                  onChange={(e) => b.updateDetail("altPhone", e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <p className="text-[9.5px] text-slate-400 font-normal mt-1">Another number we can reach you on</p>
            </div>
          </div>

          {/* Complete Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              autoComplete="street-address"
              maxLength={300}
              placeholder="House / Flat / Building, Street, Area"
              className={inputClass}
              value={details.address}
              onChange={(e) => b.updateDetail("address", e.target.value)}
            />
          </div>

          {/* Pincode → City, State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="\d{6}"
                  title="6-digit pincode"
                  maxLength={6}
                  placeholder="Enter pincode"
                  className={`${inputClass} pr-8`}
                  value={details.pincode}
                  onChange={(e) => void b.changePincode(e.target.value)}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {b.pincodeStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                  {b.pincodeStatus === "found" && <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />}
                </span>
              </div>
              <p className={`text-[9.5px] mt-1 ${b.pincodeStatus === "notFound" ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                {b.pincodeStatus === "notFound" ? "Pincode not found — please check it, or type your city and state." : "City & state fill in automatically"}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                autoComplete="address-level2"
                maxLength={80}
                placeholder="Filled from pincode"
                className={`${inputClass} ${b.pincodeStatus === "found" ? "bg-emerald-50/40" : ""}`}
                value={details.city}
                onChange={(e) => b.updateDetail("city", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                autoComplete="address-level1"
                maxLength={80}
                placeholder="Filled from pincode"
                className={`${inputClass} ${b.pincodeStatus === "found" ? "bg-emerald-50/40" : ""}`}
                value={details.state}
                onChange={(e) => b.updateDetail("state", e.target.value)}
              />
            </div>
          </div>

          {/* Language & How did you hear */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">Preferred Language</label>
              <select className={`${inputClass} cursor-pointer bg-white`} value={details.language} onChange={(e) => b.updateDetail("language", e.target.value)}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-900 mb-1">How did you hear about us?</label>
              <select className={`${inputClass} cursor-pointer bg-white`} value={details.heardFrom} onChange={(e) => b.updateDetail("heardFrom", e.target.value)}>
                <option value="">Select an option</option>
                <option value="Google Search">Google Search</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend / Referral">Friend / Referral</option>
                <option value="Newspaper / Banner">Newspaper / Banner</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Any instructions */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">Any instructions for us? (Optional)</label>
            <input
              type="text"
              maxLength={300}
              placeholder="e.g. Gate number, landmark, floor number etc."
              className={inputClass}
              value={details.instructions}
              onChange={(e) => b.updateDetail("instructions", e.target.value)}
            />
          </div>

          {/* Security Banner */}
          <div className="bg-[#fff6e8]/60 border border-[#f5a623]/30 p-2.5 flex items-center justify-center gap-2 text-center">
            <Lock className="w-3.5 h-3.5 text-[#b5730f] shrink-0" />
            <span className="text-[11px] font-semibold text-[#b5730f]">Your information is 100% secure and will never be shared.</span>
          </div>
        </form>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <button
          type="button"
          onClick={() => b.goTo(2)}
          className="border border-slate-300 bg-white text-slate-700 px-4 py-2 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          form="step3-form"
          type="submit"
          className="bg-[#f5a623] hover:bg-[#e0951a] text-white px-6 py-2.5 font-bold text-[12px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
        >
          Continue to Review
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

