"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  ClipboardCheck,
} from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

const ease = [0.16, 1, 0.3, 1] as const;

const frameworks = [
  { name: "ISO 27001", coverage: 96 },
  { name: "SOC 2", coverage: 91 },
  { name: "GDPR", coverage: 100 },
  { name: "EU AI Act", coverage: 78 },
];

const activity = [
  { icon: FileCheck2, label: "Evidence verified", detail: "Access review Q3 · automated", time: "2m ago" },
  { icon: ShieldCheck, label: "Control updated", detail: "Encryption at rest · CC6.1", time: "18m ago" },
  { icon: ShieldAlert, label: "Risk identified", detail: "Vendor access scope · Medium", time: "41m ago" },
  { icon: ClipboardCheck, label: "Policy reviewed", detail: "Data retention policy · v3.2", time: "1h ago" },
];

function ComplianceRing({ percent }: { percent: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[84px] w-[84px] sm:h-[104px] sm:w-[104px] shrink-0">
      <svg viewBox="0 0 96 96" className="-rotate-90 h-full w-full">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(7,27,58,0.08)" strokeWidth="7" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease, delay: 0.15 }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="96" y2="96">
            <stop stopColor="#2451B8" />
            <stop offset="1" stopColor="#18C6D1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] sm:text-[22px] font-semibold text-navy tracking-tight">
          <AnimatedNumber value={percent} format={(n) => `${Math.round(n)}%`} />
        </span>
      </div>
    </div>
  );
}

function ScaledMockup({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 1024 is the fixed width we want to scale down from
        const newScale = Math.min(1, containerWidth / 1024);
        setScale(newScale);
        setHeight(contentRef.current.offsetHeight * newScale);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center" 
      style={{ height: height > 0 ? height : "auto" }}
    >
      <div
        ref={contentRef}
        className="relative w-[1024px] max-w-none origin-top"
        style={{ 
          transform: `scale(${scale})`,
          // Ensure it doesn't take up full unscaled space in document flow
          marginBottom: height > 0 ? `-${contentRef.current?.offsetHeight! * (1 - scale)}px` : 0 
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function DashboardSection() {
  return (
    <section id="platform" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-pale px-3.5 py-1.5 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="text-[12px] font-semibold tracking-[0.08em] text-navy/60 uppercase">
              Product
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy mb-4"
          >
            Your compliance command center.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60"
          >
            Controls, evidence, risk and monitoring, unified in a single operational view.
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease }}
          className="relative w-full"
        >
          <ScaledMockup>
          <div
            aria-hidden
            className="absolute -inset-16 -z-10 opacity-50 blur-[100px]"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(24,198,209,0.14), transparent 70%)",
            }}
          />

          <div className="rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_40px_80px_-32px_rgba(7,27,58,0.22)] overflow-hidden">
            {/* Chrome / tabs */}
            <div className="flex items-center justify-between border-b border-navy/8 px-4 sm:px-7 py-3.5 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                </div>
                <div className="hidden sm:flex items-center gap-5 pl-4 border-l border-navy/8">
                  {["Overview", "Controls", "Evidence", "Risk"].map((tab, i) => (
                    <span
                      key={tab}
                      className={`text-[13px] font-medium pb-0.5 ${
                        i === 0 ? "text-navy border-b-2 border-cyan" : "text-navy/40"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-medium tracking-wide text-navy/35 uppercase whitespace-nowrap">
                Illustrative mockup data
              </span>
            </div>

            <div className="p-4 sm:p-7">
              {/* Stat row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
                {/* Compliance status */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.05, ease }}
                  className="col-span-2 lg:col-span-1 flex items-center gap-3 sm:gap-4 rounded-xl border border-navy/10 bg-pale/60 p-4 sm:p-5"
                >
                  <ComplianceRing percent={94} />
                  <div>
                    <div className="text-[11px] sm:text-[12px] font-medium text-navy/50 mb-0.5">
                      Compliance status
                    </div>
                    <div className="text-[12.5px] sm:text-[13px] text-navy/70 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan shrink-0" />
                      On track
                    </div>
                  </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease }}
                  className="rounded-xl border border-navy/10 p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[11px] sm:text-[12px] font-medium text-navy/50">Controls</span>
                    <ShieldCheck className="h-4 w-4 text-blue shrink-0" strokeWidth={1.75} />
                  </div>
                  <div className="text-[20px] sm:text-[26px] font-semibold text-navy tracking-tight mb-2 sm:mb-2.5">
                    <AnimatedNumber value={184} delay={0.15} />
                    <span className="text-navy/35"> / 192</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue to-cyan"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(184 / 192) * 100}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.2, delay: 0.2, ease }}
                    />
                  </div>
                </motion.div>

                {/* Evidence */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.15, ease }}
                  className="rounded-xl border border-navy/10 p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[11px] sm:text-[12px] font-medium text-navy/50">Evidence</span>
                    <Database className="h-4 w-4 text-blue shrink-0" strokeWidth={1.75} />
                  </div>
                  <div className="text-[20px] sm:text-[26px] font-semibold text-navy tracking-tight">
                    <AnimatedNumber value={1248} delay={0.2} format={(n) => Math.round(n).toLocaleString("en-US")} />
                  </div>
                  <span className="text-[11px] sm:text-[12.5px] text-navy/45 mt-2 sm:mt-2.5">
                    items collected
                  </span>
                </motion.div>

                {/* Open risks */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.2, ease }}
                  className="rounded-xl border border-navy/10 p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[11px] sm:text-[12px] font-medium text-navy/50">Open risks</span>
                    <AlertTriangle className="h-4 w-4 text-[#B8722F] shrink-0" strokeWidth={1.75} />
                  </div>
                  <div className="text-[20px] sm:text-[26px] font-semibold text-navy tracking-tight">
                    <AnimatedNumber value={8} delay={0.25} />
                  </div>
                  <span className="text-[11px] sm:text-[12.5px] text-navy/45 mt-2 sm:mt-2.5">
                    2 flagged this week
                  </span>
                </motion.div>
              </div>

              {/* Frameworks + Activity */}
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.25, ease }}
                  className="rounded-xl border border-navy/10 p-4 sm:p-6"
                >
                  <div className="text-[12.5px] sm:text-[13px] font-semibold text-navy mb-4 sm:mb-5">
                    Frameworks
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {frameworks.map((fw, i) => (
                      <div
                        key={fw.name}
                        className="flex items-center gap-2.5 sm:gap-3 rounded-lg border border-navy/8 bg-pale/50 px-3 sm:px-4 py-2.5 sm:py-3"
                      >
                        <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                          <svg viewBox="0 0 32 32" className="-rotate-90 h-full w-full">
                            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(7,27,58,0.1)" strokeWidth="3" />
                            <motion.circle
                              cx="16"
                              cy="16"
                              r="13"
                              fill="none"
                              stroke="#18C6D1"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 13}
                              initial={{ strokeDashoffset: 2 * Math.PI * 13 }}
                              whileInView={{ strokeDashoffset: 2 * Math.PI * 13 * (1 - fw.coverage / 100) }}
                              viewport={{ once: true, margin: "-60px" }}
                              transition={{ duration: 1, delay: 0.3 + i * 0.08, ease }}
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] sm:text-[13px] font-medium text-navy truncate">
                            {fw.name}
                          </div>
                          <div className="text-[10.5px] sm:text-[11.5px] text-navy/45">
                            {fw.coverage}% coverage
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.3, ease }}
                  className="rounded-xl border border-navy/10 p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <span className="text-[12.5px] sm:text-[13px] font-semibold text-navy">Recent activity</span>
                    <span className="flex items-center gap-1.5">
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-cyan"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="text-[11px] text-navy/40">Live</span>
                    </span>
                  </div>
                  <ul className="space-y-3.5 sm:space-y-4">
                    {activity.map((item, i) => (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.45, delay: 0.35 + i * 0.07, ease }}
                        className="flex items-start gap-2.5 sm:gap-3"
                      >
                        <div className="mt-0.5 flex h-6.5 w-6.5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md border border-navy/10 bg-pale">
                          <item.icon className="h-3.5 w-3.5 text-blue" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] sm:text-[13px] font-medium text-navy">
                              {item.label}
                            </span>
                            <span className="text-[10.5px] sm:text-[11px] text-navy/35 whitespace-nowrap">
                              {item.time}
                            </span>
                          </div>
                          <div className="text-[11px] sm:text-[12px] text-navy/45 mt-0.5">
                            {item.detail}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </ScaledMockup>

          <p className="mt-8 text-center text-[12px] text-navy/35">
            Product mockup shown with illustrative data for demonstration purposes only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}