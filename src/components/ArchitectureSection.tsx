"use client";

import { motion } from "framer-motion";
import { FileCheck2, ShieldCheck, ScanSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedNumber } from "./AnimatedNumber";

const ease = [0.16, 1, 0.3, 1] as const;

/* Wavy trend line, drawn on scroll-into-view */
function TrendChart() {
  return (
    <div className="relative h-[92px] w-full">
      <svg viewBox="0 0 220 60" className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="solution-line-grad" x1="0" y1="0" x2="220" y2="0">
            <stop offset="0%" stopColor="#2451B8" />
            <stop offset="100%" stopColor="#18C6D1" />
          </linearGradient>
          <linearGradient id="solution-area-grad" x1="0" y1="0" x2="0" y2="60">
            <stop offset="0%" stopColor="rgba(24,198,209,0.22)" />
            <stop offset="100%" stopColor="rgba(24,198,209,0)" />
          </linearGradient>
        </defs>

        <motion.path
          d="M2,44 C22,44 26,14 46,14 C66,14 70,38 90,38 C110,38 114,10 134,10 C154,10 158,30 178,26 C198,22 202,6 218,6 L218,60 L2,60 Z"
          fill="url(#solution-area-grad)"
          stroke="none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        />

        <motion.path
          d="M2,44 C22,44 26,14 46,14 C66,14 70,38 90,38 C110,38 114,10 134,10 C154,10 158,30 178,26 C198,22 202,6 218,6"
          fill="none"
          stroke="url(#solution-line-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.3, ease, delay: 0.15 }}
        />

        <motion.circle
          cx="218"
          cy="6"
          r="4"
          fill="#0A1E42"
          stroke="#18C6D1"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 1.3, ease }}
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, delay: 1.4, ease }}
        className="absolute -top-1 right-0 rounded-md border border-navy/10 bg-white px-2.5 py-1.5 shadow-[0_8px_20px_-8px_rgba(7,27,58,0.35)]"
      >
        <div className="text-[9.5px] font-medium text-navy/45 leading-none mb-1">Q3</div>
        <div className="text-[12px] font-semibold text-navy leading-none">
          <AnimatedNumber value={97} format={(n) => `${Math.round(n)}%`} delay={1.4} />
        </div>
      </motion.div>
    </div>
  );
}

/* Small animated bar chart */
function PaperworkBars() {
  const t = useTranslations("solution.bars");
  const bars = [
    { key: "policies", label: t("policies"), height: 55 },
    { key: "contracts", label: t("contracts"), height: 88 },
    { key: "audits", label: t("audits"), height: 40 },
    { key: "certificates", label: t("certs"), height: 68 },
  ];

  return (
    <div className="flex items-end justify-between gap-2.5 h-[74px]">
      {bars.map((b, i) => (
        <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative w-full flex-1 flex items-end overflow-hidden rounded-[5px] bg-navy/6">
            <motion.div
              className="w-full rounded-[5px] bg-gradient-to-t from-blue to-cyan"
              initial={{ height: 0 }}
              whileInView={{ height: `${b.height}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.09, ease }}
            />
          </div>
          <span className="text-[9px] font-medium text-navy/40 text-center leading-tight">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Filing-status donut, segments drawn as stacked dasharray strokes */
function FilingDonut() {
  const t = useTranslations("solution.segments");
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const segments = [
    { key: "approved", label: t("approved"), value: 62, color: "#18C6D1" },
    { key: "review", label: t("review"), value: 26, color: "#2451B8" },
    { key: "pending", label: t("pending"), value: 12, color: "rgba(7,27,58,0.18)" },
  ];

  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[76px] w-[76px] shrink-0">
        <svg viewBox="0 0 64 64" className="-rotate-90 h-full w-full">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(7,27,58,0.06)" strokeWidth="8" />
          {segments.map((seg, i) => {
            const dash = (seg.value / 100) * circumference;
            const offset = offsetAcc;
            offsetAcc += dash;
            return (
              <motion.circle
                key={seg.key}
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[14px] font-semibold text-navy tracking-tight">
            <AnimatedNumber value={412} delay={0.35} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[10.5px] text-navy/55 truncate">
              {seg.label} <span className="text-navy/35">· {seg.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SolutionSection() {
  const t = useTranslations("solution");

  const points = [
    {
      key: "intake",
      icon: FileCheck2,
      title: t("points.intake.title"),
      description: t("points.intake.description"),
    },
    {
      key: "verification",
      icon: ScanSearch,
      title: t("points.verification.title"),
      description: t("points.verification.description"),
    },
    {
      key: "filing",
      icon: ShieldCheck,
      title: t("points.filing.title"),
      description: t("points.filing.description"),
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Ambient background shapes */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-[0.03]" />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full opacity-50 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, rgba(24,198,209,0.16), transparent)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-[-10%] -z-10 h-[420px] w-[420px] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, rgba(36,81,184,0.14), transparent)" }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[420px] w-[420px] opacity-[0.05]"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="99" fill="none" stroke="#071B3A" strokeWidth="1" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="#071B3A" strokeWidth="1" />
        <circle cx="100" cy="100" r="53" fill="none" stroke="#071B3A" strokeWidth="1" />
      </svg>

      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="text-balance text-[32px] sm:text-[42px] leading-[1.14] font-semibold tracking-[-0.015em] text-navy mb-6"
            >
              {t("headline")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-[16.5px] leading-[1.75] text-navy/60 max-w-[480px] mb-10"
            >
              {t("description")}
            </motion.p>

            <div className="space-y-5 mb-10">
              {points.map((point, i) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.key}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
                    className="flex items-start gap-3.5"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy/10 bg-pale">
                      <Icon className="h-4 w-4 text-blue" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-navy mb-0.5">
                        {point.title}
                      </div>
                      <p className="text-[13.5px] leading-[1.6] text-navy/55">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.4, ease }}
              className="flex flex-wrap items-center gap-3"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg bg-navy px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-navy/90"
              >
                {t("cta")}
              </a>
            </motion.div>
          </div>

          {/* Dashboard visual */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-10 -z-10 rounded-[40px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(24,198,209,0.16), rgba(36,81,184,0.10), transparent)",
              }}
            />

            <div className="rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.25)] overflow-hidden">
              {/* Chrome */}
              <div className="flex items-center justify-between border-b border-navy/8 px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Trend chart card */}
                <div className="rounded-xl border border-navy/10 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-navy/50">
                      {t("complianceScore")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-cyan"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="text-[10.5px] text-navy/40">{t("live")}</span>
                    </span>
                  </div>
                  <TrendChart />
                </div>

                {/* Bars + Donut */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-navy/10 p-4 sm:p-5">
                    <span className="text-[12px] font-medium text-navy/50 block mb-4">
                      {t("paperworkByType")}
                    </span>
                    <PaperworkBars />
                  </div>
                  <div className="rounded-xl border border-navy/10 p-4 sm:p-5 flex flex-col justify-between">
                    <span className="text-[12px] font-medium text-navy/50 block mb-4">
                      {t("filingStatus")}
                    </span>
                    <FilingDonut />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[12px] text-navy/35">
              {t("disclaimer")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

