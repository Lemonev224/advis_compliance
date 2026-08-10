"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

export function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[520px] mx-auto"
    >
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[40px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(24,198,209,0.16), rgba(36,81,184,0.10), transparent)",
        }}
      />

      <div className="rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_24px_48px_-24px_rgba(7,27,58,0.18)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy/8 px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
          </div>

        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 rounded-xl border border-navy/10 bg-pale/60 p-4 mb-3">
            <div className="relative h-16 w-16 shrink-0">
              <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(7,27,58,0.08)" strokeWidth="6" />
                <motion.circle
                  cx="32" cy="32" r="26" fill="none" stroke="url(#hero-ring)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 * 0.06 }}
                  transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <defs>
                  <linearGradient id="hero-ring" x1="0" y1="0" x2="64" y2="64">
                    <stop stopColor="#2451B8" />
                    <stop offset="1" stopColor="#18C6D1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-navy">
                <AnimatedNumber value={94} format={(n) => `${Math.round(n)}%`} delay={0.6} />
              </div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-navy/50 mb-0.5">Compliance status</div>
              <div className="text-[13px] text-navy/70 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan" /> On track
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-navy/10 p-3.5">
              <ShieldCheck className="h-4 w-4 text-blue mb-2" strokeWidth={1.75} />
              <div className="text-[17px] font-semibold text-navy tracking-tight">
                <AnimatedNumber value={184} delay={0.7} />
              </div>
              <div className="text-[10.5px] text-navy/45">Controls</div>
            </div>
            <div className="rounded-lg border border-navy/10 p-3.5">
              <Database className="h-4 w-4 text-blue mb-2" strokeWidth={1.75} />
              <div className="text-[17px] font-semibold text-navy tracking-tight">
                <AnimatedNumber value={1248} delay={0.75} format={(n) => Math.round(n).toLocaleString("en-US")} />
              </div>
              <div className="text-[10.5px] text-navy/45">Evidence</div>
            </div>
            <div className="rounded-lg border border-navy/10 p-3.5">
              <AlertTriangle className="h-4 w-4 text-[#B8722F] mb-2" strokeWidth={1.75} />
              <div className="text-[17px] font-semibold text-navy tracking-tight">
                <AnimatedNumber value={8} delay={0.8} />
              </div>
              <div className="text-[10.5px] text-navy/45">Open risks</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}