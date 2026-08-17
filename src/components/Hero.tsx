"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="top"
      className="relative z-0 overflow-hidden bg-white pt-[96px] min-h-[640px] lg:min-h-[760px] flex items-center"
    >
      {/* full-bleed wave — sized off its own aspect ratio (869x1200) instead of
          object-cover, so it never gets crushed down to a thin cropped sliver.
          w-[clamp(...)] scales it fluidly with the viewport at every breakpoint.
          `sizes` tells Next.js the real rendered width so it serves a
          correctly-sized source instead of upscaling a smaller one (= blur).
          `quality={100}` avoids compression softness on the gradient. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/blue-wave3.png"
          alt=""
          width={1791}
          height={2400}
          priority
          quality={100}
          sizes="(max-width: 750px) 600px, (max-width: 1500px) 80vw, 1200px"
          className="absolute right-[-40%] md:right-[0%] top-[65%] md:top-1/2 -translate-y-1/2 w-[clamp(800px,140vw,1200px)] md:w-[clamp(600px,80vw,1200px)] h-auto max-w-none select-none opacity-25 md:opacity-100"
        />
      </div>

      {/* light fade on the left only, just enough for the copy to stay legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.85) 22%, rgba(255,255,255,0.35) 42%, rgba(255,255,255,0) 60%)",
        }}
      />

      {/* fade out the bottom so it seamlessly transitions into the next white section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 -z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="max-w-[620px]">


          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="text-balance text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.08] font-semibold tracking-[-0.02em] text-navy"
          >
            {t("headlinePart1")} {t("headlineHighlight")} {t("headlinePart2")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-6 text-[17px] leading-[1.6] text-navy/60 max-w-[480px]"
          >
            {t("subtext")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 active:scale-[0.98]"
            >
              {t("ctaPrimary")}
            </a>
 
          </motion.div>
        </div>

        {/* floating glass card, echoes the "Generating reply..." card in the reference */}
       {/* floating browser-tab card showing the live dashboard.
    Width is fluid via clamp() so it scales smoothly with the viewport
    instead of jumping between fixed breakpoints. The image sits in an
    aspect-[1895/777] box that exactly matches its native ratio, so it
    can never be stretched or squashed at any card width. */}
{/* floating browser-tab card with a coded dashboard mockup (no image asset).
    Mobile: sits in normal flow, full width, below the CTAs.
    lg+: switches to an absolutely-positioned floating card at a fluid width. */}
{/* floating browser-tab card — coded compliance dashboard mockup (no image asset).
    Mobile: sits in normal flow, full width, below the CTAs.
    lg+: switches to an absolutely-positioned floating card at a fluid width. */}
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4, ease }}
  className="relative mt-10 w-full lg:mt-0 lg:absolute lg:top-[70px] lg:right-[10px] lg:w-[clamp(460px,42vw,700px)] rounded-2xl border border-navy/10 bg-white shadow-[0_30px_60px_-20px_rgba(7,27,58,0.25)] overflow-hidden"
>
  {/* browser chrome */}
  <div className="flex items-center gap-2 border-b border-navy/8 bg-pale/70 px-4 py-2.5">
    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
    <div className="ml-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-navy/50">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
      advisorly.tech/compliance
    </div>
  </div>

  {/* app shell */}
  <div className="flex text-navy">
    {/* icon rail — hidden on the smallest screens to save width */}
    <div className="hidden sm:flex w-11 flex-col items-center gap-4 border-r border-navy/8 bg-pale/40 py-4 shrink-0">
      <span className="h-6 w-6 rounded-md bg-navy" />
      <span className="h-2 w-2 rounded-full bg-cyan" />
      <span className="h-2 w-2 rounded-full bg-navy/15" />
      <span className="h-2 w-2 rounded-full bg-navy/15" />
      <span className="h-2 w-2 rounded-full bg-navy/15" />
    </div>

    <div className="flex-1 min-w-0">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-navy/8 px-4 py-2.5">
        <div>
          <span className="text-[11px] font-semibold text-navy">Action Engine</span>
          <span className="ml-2 text-[10px] text-navy/40">Top priorities</span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-navy/35">
          Ranked by risk × urgency
        </span>
      </div>

      {/* action queue */}
      <div className="divide-y divide-navy/6">
        {[
          {
            severity: "CRITICAL",
            action: "SAR Submission to UIFAND",
            context: "Client #4992 · Suspected structuring",
            sla: "Breached by 24h",
            slaTone: "critical",
            cta: "Submit SAR",
          },
          {
            severity: "CRITICAL",
            action: "AML Alerts Triage",
            context: "Batch #882 · 5 high-risk transactions",
            sla: "Breached by 4h",
            slaTone: "critical",
            cta: "Review flags",
          },
          {
            severity: "HIGH",
            action: "KYC Renewal Escalation",
            context: "Corp Entity B · UBO missing",
            sla: "Due in 48h",
            slaTone: "warn",
            cta: "Request docs",
          },
          {
            severity: "HIGH",
            action: "MiFID II Suitability",
            context: "Client profile update · HNW",
            sla: "Due in 3 days",
            slaTone: "warn",
            cta: "Update profile",
          },
        ].map((row) => (
          <div key={row.action} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide ${
                row.severity === "CRITICAL"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {row.severity}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[10.5px] font-semibold text-navy">
                {row.action}
              </div>
              <div className="truncate text-[9px] text-navy/40">{row.context}</div>
            </div>
            <div className="hidden sm:block shrink-0 text-right">
              <div
                className={`text-[9px] font-semibold ${
                  row.slaTone === "critical" ? "text-red-600" : "text-amber-600"
                }`}
              >
                {row.sla}
              </div>
            </div>
            <span className="hidden md:inline-block shrink-0 rounded-md border border-navy/10 bg-pale/60 px-2 py-1 text-[9px] font-semibold text-navy/70">
              {row.cta}
            </span>
          </div>
        ))}
      </div>

      {/* regulatory framework posture strip */}
      <div className="border-t border-navy/8 bg-pale/30 px-4 py-2.5">
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-navy/40">
          Regulatory Framework Posture
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-medium text-red-600">
            UIFAND Reporting — 2 escalated
          </span>
          <span className="rounded-full bg-pale px-2 py-1 text-[9px] font-medium text-navy/50">
            KYC / AML
          </span>
          <span className="rounded-full bg-pale px-2 py-1 text-[9px] font-medium text-navy/50">
            MiFID II
          </span>
          <span className="ml-auto rounded-md bg-red-600 px-2 py-1 text-[9px] font-bold text-white">
            CRITICAL
          </span>
        </div>
      </div>
    </div>
  </div>
</motion.div>
      </div>
    </section>
  );
}