"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, AlertTriangle, CheckCircle2, ShieldQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedNumber } from "./AnimatedNumber";

const ease = [0.16, 1, 0.3, 1] as const;

const metrics = [
  { icon: ShieldCheck, value: 184, label: "controls", delta: "+12%", up: true, ring: 72, delay: 0.55 },
  { icon: Database, value: 1248, label: "evidence", delta: "+8%", up: true, ring: 58, delay: 0.62, format: (n: number) => Math.round(n).toLocaleString("en-US") },
  { icon: AlertTriangle, value: 8, label: "openRisks", delta: "-24%", up: false, ring: 20, delay: 0.69 },
];

function MetricRing({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 52 52" className="-rotate-90 h-full w-full">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(7,27,58,0.08)" strokeWidth="4.5" />
        <motion.circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="#132A54"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          transition={{ duration: 1.1, ease, delay: 0.5 }}
        />
      </svg>
    </div>
  );
}

export function HeroDashboard() {
  const t = useTranslations("heroDashboard");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease }}
      className="relative w-full max-w-[520px] mx-auto"
    >
      {/* Muted enterprise backdrop glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[32px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(24,198,209,0.14), transparent 70%)",
        }}
      />

      {/* Enterprise Card Container */}
      <div className="rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_1px_2px_rgba(7,27,58,0.04),0_40px_80px_-32px_rgba(7,27,58,0.22)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy/8 bg-white px-4 py-3.5">
          <div className="flex items-center gap-1.5">
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20">
            <span className="text-[10px] font-medium text-emerald-700">
              Active
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Navy header panel, like the section cards */}
          <div className="rounded-xl border border-navy/10 bg-white overflow-hidden mb-3">
            <div className="flex items-center gap-2 bg-[#132A54] px-4 py-3">
              <ShieldQuestion className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-white">
                {t("complianceStatus")}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="22"
                    fill="none"
                    stroke="url(#hero-ring)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 22}
                    initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 22 * 0.06 }}
                    transition={{ duration: 1.4, delay: 0.4, ease }}
                  />
                  <defs>
                    <linearGradient id="hero-ring" x1="0" y1="0" x2="56" y2="56">
                      <stop stopColor="#132A54" />
                      <stop offset="100%" stopColor="#18C6D1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-navy">
                  <AnimatedNumber value={94} format={(n) => `${Math.round(n)}%`} delay={0.4} />
                </div>
              </div>

              <div className="text-[13px] font-medium text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {t("onTrack")}
              </div>
            </div>
          </div>

          {/* Key metrics — ring + delta badge, like StatCard */}
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: m.delay, ease }}
                  className="rounded-xl border border-navy/10 bg-white p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-3.5 w-3.5 text-navy/50" strokeWidth={1.75} />
                    <div className="relative h-6 w-6 shrink-0">
                      <MetricRing percent={m.ring} />
                    </div>
                  </div>
                  <div className="text-[15px] font-semibold text-navy tracking-tight">
                    <AnimatedNumber value={m.value} delay={m.delay + 0.1} format={m.format} />
                  </div>
                  <div className="text-[9.5px] font-medium text-navy/40 mb-1.5">
                    {t(m.label)}
                  </div>
                  <span
                    className={`inline-block rounded-md px-1.5 py-[2px] text-[9.5px] font-semibold text-white ${
                      m.up ? "bg-[#1E9E6B]" : "bg-[#D14343]"
                    }`}
                  >
                    {m.delta}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}