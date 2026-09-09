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
          className="relative mt-10 w-full max-w-[420px] mx-auto lg:mx-0 lg:mt-0 lg:absolute lg:top-[90px] lg:right-[10px] lg:w-[clamp(340px,30vw,460px)] rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_24px_48px_-20px_rgba(7,27,58,0.22)] overflow-hidden"
        >
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-navy/8 bg-white px-3.5 py-2.5">
            <div className="ml-2.5 flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-[3px] text-[9.5px] font-medium text-navy/50">
              advisorly.tech/compliance
            </div>
          </div>

          <div className="p-3.5">
            {/* Navy header panel — matches DashboardSection's card headers */}
            <div className="rounded-xl border border-navy/10 bg-white overflow-hidden mb-3">
              <div className="flex items-center gap-2 bg-[#132A54] px-3.5 py-2.5">
                <span className="text-[10px] font-semibold text-white">
                  Contract Requests
                </span>
              </div>

              {/* Stat cards — ring + delta badge, like StatCard in DashboardSection */}
              <div className="grid grid-cols-4 gap-2 p-3">
                {stats.map((s, i) => (
                  <div key={s.label} className="rounded-lg border border-navy/8 bg-slate-50/40 p-2 text-center">
                    <div className="text-[13px] font-semibold text-navy tabular-nums leading-none">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[7px] font-medium text-navy/40 leading-tight">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* compact request list — icon, progress bar, status badge like the product table */}
            <div className="rounded-xl border border-navy/10 bg-white overflow-hidden">
              <div className="flex items-center gap-2 bg-[#132A54] px-3.5 py-2.5">
                <span className="text-[10px] font-semibold text-white">
                  Recent Activity
                </span>
              </div>

              <div className="divide-y divide-navy/6">
                {requests.map((r, i) => (
                  <motion.div
                    key={r.vendor}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.55 + i * 0.06, ease }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[10.5px] font-semibold text-navy">{r.vendor}</div>
                      <div className="truncate text-[9px] italic text-navy/40">{r.type}</div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 w-[64px] shrink-0">
                      <div className="h-1.5 w-full rounded-full bg-navy/8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-[#132A54]"
                          initial={{ width: 0 }}
                          animate={{ width: `${r.status}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.06, ease }}
                        />
                      </div>
                      <span className="text-[8px] font-semibold tabular-nums text-navy/60">
                        {r.status}%
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-1 text-[8px] font-semibold text-white whitespace-nowrap ${
                        r.tone === "ok" ? "bg-[#1E9E6B]" : "bg-[#D14343]"
                      }`}
                    >
                      {r.statusLabel}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* framework posture strip */}
              <div className="border-t border-navy/8 bg-slate-50/60 px-3.5 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                    ISO 27001
                  </span>
                  <span className="rounded-md border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                    SOC 2
                  </span>
                  <span className="rounded-md border border-navy/10 px-1.5 py-[3px] text-[8px] font-medium text-navy/50">
                    GDPR
                  </span>
                  <span className="ml-auto rounded-md bg-[#D14343] px-1.5 py-[3px] text-[8px] font-bold text-white">
                    2 due soon
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