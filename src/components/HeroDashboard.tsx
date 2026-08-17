"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedNumber } from "./AnimatedNumber";

export function HeroDashboard() {
  const t = useTranslations("heroDashboard");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[520px] mx-auto"
    >
      {/* Muted enterprise backdrop glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[32px] opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(7, 27, 58, 0.25), rgba(30, 58, 138, 0.12), transparent)",
        }}
      />

      {/* Enterprise Card Container */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(7,27,58,0.06),0_20px_40px_-20px_rgba(7,27,58,0.15)] overflow-hidden">
        {/* Sleek Dark Navy Window Header */}
        <div className="flex items-center justify-between border-b border-navy/10 bg-[#071B3A] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </div>
            <span className="ml-2 text-[11px] font-medium tracking-wider text-slate-300 uppercase">
              Compliance Monitor
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10.5px] font-medium text-emerald-300 tracking-wide uppercase">
              Active
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-5 bg-slate-50/40">
          {/* Main Status Row */}
          <div className="flex items-center gap-4 rounded-lg border border-slate-200/90 bg-white p-4 mb-3 shadow-xs">
            <div className="relative h-15 w-15 shrink-0">
              <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
                <circle cx="30" cy="30" r="24" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                <motion.circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  stroke="url(#hero-ring)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * 0.06 }}
                  transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <defs>
                  <linearGradient id="hero-ring" x1="0" y1="0" x2="60" y2="60">
                    <stop stopColor="#071B3A" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-navy">
                <AnimatedNumber value={94} format={(n) => `${Math.round(n)}%`} delay={0.6} />
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                {t("complianceStatus")}
              </div>
              <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {t("onTrack")}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-slate-600 mb-2" strokeWidth={1.75} />
              <div className="text-[16px] font-semibold text-slate-900 tracking-tight">
                <AnimatedNumber value={184} delay={0.7} />
              </div>
              <div className="text-[10.5px] font-medium text-slate-500">{t("controls")}</div>
            </div>

            <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <Database className="h-4 w-4 text-slate-600 mb-2" strokeWidth={1.75} />
              <div className="text-[16px] font-semibold text-slate-900 tracking-tight">
                <AnimatedNumber value={1248} delay={0.75} format={(n) => Math.round(n).toLocaleString("en-US")} />
              </div>
              <div className="text-[10.5px] font-medium text-slate-500">{t("evidence")}</div>
            </div>

            <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <AlertTriangle className="h-4 w-4 text-amber-600 mb-2" strokeWidth={1.75} />
              <div className="text-[16px] font-semibold text-slate-900 tracking-tight">
                <AnimatedNumber value={8} delay={0.8} />
              </div>
              <div className="text-[10.5px] font-medium text-slate-500">{t("openRisks")}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}