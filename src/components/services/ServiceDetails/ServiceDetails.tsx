import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, ChevronDown, ClipboardList, CreditCard, Sparkles, UserCheck, X } from "lucide-react";
import { helpNowServices, type HelpNowService } from "@/data/helpNowServices";

function SectionHeading({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <span className="mb-3 inline-block rounded-full border border-[#f5a623]/30 bg-[#fff6e8] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#f5a623]">
        {eyebrow}
      </span>
      <h2 className="text-[24px] font-black uppercase leading-tight tracking-tight text-slate-900 md:text-[32px]">
        {title} <span className="text-[#f5a623]">{accent}</span>
      </h2>
    </div>
  );
}

// What the helper is trained to do, and what is out of scope.
export function ServiceIncluded({ service }: { service: HelpNowService }) {
  return (
    <section className="border-t border-slate-200 bg-slate-50/70 py-14 md:py-16">
      <div className="container-x mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What you get" title="What's" accent="Included" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {service.tasks.map((task) => (
              <div key={task.name} className="flex items-start gap-3 border border-slate-200 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="text-[13px] font-bold leading-snug text-slate-900">{task.name}</h3>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">{task.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-red-100 bg-white p-5">
            <h3 className="mb-3 text-[14px] font-bold text-slate-900">Not included in this service</h3>
            <ul className="space-y-2.5">
              {service.notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[12px] font-medium text-slate-600">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: ClipboardList, title: "Choose your plan", text: "Pick helpers, hours and the tasks you need." },
  { icon: CalendarCheck, title: "Pick a slot", text: "Choose any day in the next two weeks and a time that suits you." },
  { icon: CreditCard, title: "Pay your way", text: "Apply a coupon, then pay online with Razorpay or after the service." },
  { icon: UserCheck, title: "Helper arrives", text: "A verified Help Now helper reaches your door on time." },
];

export function ServiceSteps() {
  return (
    <section className="py-14 md:py-16">
      <div className="container-x mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Simple & quick" title="How it" accent="Works" />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative border border-slate-200 bg-white p-6">
              <span className="absolute right-5 top-4 text-[34px] font-black leading-none text-slate-100">0{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff6e8] text-[#b5730f]">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-slate-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ServiceFaq({ service }: { service: HelpNowService }) {
  return (
    <section className="border-t border-slate-200 bg-slate-50/70 py-14 md:py-16">
      <div className="container-x mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Got questions?" title="Frequently Asked" accent="Questions" />
        <div className="space-y-3">
          {service.faqs.map((faq) => (
            <details key={faq.q} className="group border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[13px] font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-4 text-[12px] font-medium leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MoreServices({ current }: { current: HelpNowService["slug"] }) {
  const others = helpNowServices.filter((service) => service.slug !== current);
  return (
    <section className="py-14 md:py-16">
      <div className="container-x mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Explore more" title="Other Help Now" accent="Services" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {others.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className="group overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden">
                <Image src={service.image} alt={service.name} fill sizes="(min-width: 1024px) 200px, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <h3 className="flex items-center gap-1.5 text-[13px] font-bold leading-tight text-slate-900 group-hover:text-[#b5730f]">
                  <service.icon className="h-3.5 w-3.5 shrink-0" /> {service.name}
                </h3>
                <p className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  ₹{service.ratePerHour}/hr <ArrowRight className="h-3.5 w-3.5 text-[#f5a623] transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-[#f5a623]" /> Every service is priced per hour per helper — book only what you need.
        </p>
      </div>
    </section>
  );
}
