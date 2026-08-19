"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as const;

/* Compact, muted contract-compliance snapshot for the hero card.
   Deliberately desaturated: color is used only as a thin accent
   (left border / small dot), never a solid fill, to keep the
   institutional / core-banking-software feel. */
const stats = [
  { label: "Open requests", value: "13" },
  { label: "Settled", value: "8" },
  { label: "Avg time", value: "2m" },
  { label: "Overdue", value: "13" },
];

const requests = [
  {
    vendor: "Beatty-Bruen",
    type: "Nondisclosure Agreement",
    status: 45,
    statusLabel: "Under Review",
    tone: "warn",
  },
  {
    vendor: "Kreiger Inc",
    type: "Partnership Agreement",
    status: 75,
    statusLabel: "Decision Made",
    tone: "ok",
  },
  {
    vendor: "Schroeder and Sons",
    type: "Nondisclosure Agreement",
    status: 75,
    statusLabel: "Decision Made",
    tone: "ok",
  },
];

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

        {/* Floating browser-tab card — compact, muted contract-compliance snapshot.
            Small footprint (clamp 340–460px) so it reads as a serious product
            preview rather than the main event of the hero. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="relative mt-10 w-full max-w-[420px] mx-auto lg:mx-0 lg:mt-0 lg:absolute lg:top-[90px] lg:right-[10px] lg:w-[clamp(340px,30vw,460px)] rounded-xl border border-navy/10 bg-white shadow-[0_24px_48px_-20px_rgba(7,27,58,0.22)] overflow-hidden"
        >
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-navy/8 bg-slate-50 px-3.5 py-2.5">
            <span className="h-2 w-2 rounded-full bg-navy/15" />
            <span className="h-2 w-2 rounded-full bg-navy/15" />
            <span className="h-2 w-2 rounded-full bg-navy/15" />
            <div className="ml-2.5 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[3px] text-[9.5px] font-medium text-navy/50">
              <span className="h-1 w-1 rounded-full bg-navy/30" />
              advisorly.tech/compliance
            </div>
          </div>

          <div className="text-navy">
            {/* top bar */}
            <div className="flex items-center justify-between border-b border-navy/8 px-3.5 py-2">
              <span className="text-[10px] font-semibold text-navy">Contract Requests</span>
              <span className="flex items-center gap-1.5">

              </span>
            </div>

            {/* compact stat strip */}
            <div className="grid grid-cols-4 divide-x divide-navy/6 border-b border-navy/8">
              {stats.map((s) => (
                <div key={s.label} className="px-2 py-2.5 text-center">
                  <div className="text-[13px] font-semibold text-navy tabular-nums leading-none">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[7.5px] font-medium tracking-[0.03em] text-navy/40 uppercase leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* compact request list */}
            <div className="divide-y divide-navy/6">
              {requests.map((r) => (
                <div
                  key={r.vendor}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 border-l-2 ${
                    r.tone === "ok" ? "border-l-[#2E6B4F]" : "border-l-[#8A6A2E]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10.5px] font-semibold text-navy">{r.vendor}</div>
                    <div className="truncate text-[9px] italic text-navy/40">{r.type}</div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 w-[64px] shrink-0">
                    <div className="h-1 w-full rounded-full bg-navy/8 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          r.tone === "ok" ? "bg-[#2E6B4F]" : "bg-[#8A6A2E]"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.status}%` }}
                        transition={{ duration: 1, delay: 0.6, ease }}
                      />
                    </div>
                    <span
                      className={`text-[8px] font-semibold tabular-nums ${
                        r.tone === "ok" ? "text-[#2E6B4F]" : "text-[#8A6A2E]"
                      }`}
                    >
                      {r.status}%
                    </span>
                  </div>
                  <span className="shrink-0 rounded-[3px] border border-navy/10 bg-slate-50 px-1.5 py-1 text-[8px] font-semibold text-navy/60 whitespace-nowrap">
                    {r.statusLabel}
                  </span>
                </div>
              ))}
            </div>

            {/* framework posture strip */}
            <div className="border-t border-navy/8 bg-slate-50/60 px-3.5 py-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-[3px] border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                  ISO 27001
                </span>
                <span className="rounded-[3px] border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                  SOC 2
                </span>
                <span className="rounded-[3px] border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                  GDPR
                </span>
                <span className="ml-auto rounded-[3px] border border-[#8A6A2E]/30 px-1.5 py-[3px] text-[8px] font-bold uppercase tracking-wide text-[#8A6A2E]">
                  2 due soon
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}