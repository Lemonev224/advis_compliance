"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Database,
  AlertTriangle,
  Activity,
} from "lucide-react";

const regulations = ["ISO 27001", "SOC 2", "GDPR", "EU AI Act"];

const modules = [
  { label: "Controls", icon: ShieldCheck },
  { label: "Policies", icon: FileText },
  { label: "Evidence", icon: Database },
  { label: "Risk", icon: AlertTriangle },
  { label: "Monitoring", icon: Activity },
];

function FlowingLine({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative h-8 w-px mx-auto overflow-hidden bg-navy/10">
      <motion.div
        className="absolute left-0 top-0 w-px h-3 bg-gradient-to-b from-transparent via-cyan to-transparent"
        animate={{ y: ["-20%", "220%"] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
      />
    </div>
  );
}

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[480px] mx-auto"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[40px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(24,198,209,0.16), rgba(36,81,184,0.10), transparent)",
        }}
      />

      <div className="rounded-2xl border border-navy/10 bg-white/90 backdrop-blur-sm shadow-[0_1px_2px_rgba(7,27,58,0.04),0_24px_48px_-24px_rgba(7,27,58,0.18)] p-6">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 mb-5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
          <span className="ml-3 text-[11px] font-medium tracking-wide text-navy/35 uppercase">
            Compliance Engine
          </span>
        </div>

        {/* Regulations row */}
        <div className="grid grid-cols-4 gap-2">
          {regulations.map((r, i) => (
            <motion.div
              key={r}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
              className="rounded-md border border-navy/10 bg-pale px-2 py-2 text-center"
            >
              <span className="text-[10.5px] font-medium text-navy/60 leading-tight">
                {r}
              </span>
            </motion.div>
          ))}
        </div>

        <FlowingLine delay={0} />

        {/* Compliance engine node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="relative rounded-xl border border-navy/10 mx-auto"
          style={{
            background:
              "linear-gradient(135deg, #071B3A 0%, #16326b 55%, #2451B8 100%)",
          }}
        >
          <div className="flex items-center justify-center gap-2 py-4">
            <motion.span
              className="h-2 w-2 rounded-full bg-cyan"
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[13px] font-medium text-white tracking-tight">
              Compliance Engine
            </span>
          </div>
        </motion.div>

        <FlowingLine delay={0.3} />

        {/* Modules row */}
        <div className="grid grid-cols-5 gap-1.5">
          {modules.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 + i * 0.07, duration: 0.45 }}
              className="flex flex-col items-center gap-1.5 rounded-md border border-navy/10 bg-pale py-2.5 px-1"
            >
              <m.icon className="h-3.5 w-3.5 text-blue" strokeWidth={1.75} />
              <span className="text-[9px] font-medium text-navy/55 text-center leading-none">
                {m.label}
              </span>
            </motion.div>
          ))}
        </div>

        <FlowingLine delay={0.6} />

        {/* Business operations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="rounded-md border border-cyan/30 bg-gradient-to-r from-cyan/10 to-blue/10 px-4 py-3 text-center"
        >
          <span className="text-[12px] font-semibold text-navy tracking-tight">
            Business Operations
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}