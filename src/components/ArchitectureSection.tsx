"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, AlertTriangle } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const coreModules = [
  { label: "Controls", icon: ShieldCheck },
  { label: "Evidence", icon: Database },
  { label: "Risk", icon: AlertTriangle },
];

const industries = ["Hospitality", "Logistics", "Retail", "Construction"];

function Connector({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative flex justify-center h-10">
      <div className="relative w-px bg-navy/12 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 w-px h-4 bg-gradient-to-b from-transparent via-cyan to-transparent"
          animate={{ y: ["-30%", "260%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay }}
        />
      </div>
      <svg
        className="absolute -bottom-[1px] left-1/2 -translate-x-1/2"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
      >
        <path d="M1 1L5 5L9 1" stroke="rgba(7,27,58,0.28)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 lg:py-32 bg-pale overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid bg-grid-fade opacity-70" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mx-auto text-center mb-16">

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy mb-4"
          >
            Built once. Adapted across industries.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60"
          >
            The same compliance infrastructure adapts to different regulatory
            environments, extending into industry-specific modules and, over
            time, industry-specific products.
          </motion.p>
        </div>

        {/* Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-[760px] mx-auto"
        >
          {/* Layer 1 — Compliance Infrastructure */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="rounded-xl border border-navy/10 py-4 text-center"
            style={{
              background:
                "linear-gradient(135deg, #071B3A 0%, #16326b 55%, #2451B8 100%)",
            }}
          >
            <span className="text-[13px] font-semibold tracking-[0.06em] text-white uppercase">
              Compliance Infrastructure
            </span>
          </motion.div>

          <Connector delay={0} />

          {/* Layer 2 — Controls / Evidence / Risk */}
          <div className="grid grid-cols-3 gap-3">
            {coreModules.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease }}
                className="flex flex-col items-center gap-2 rounded-xl border border-navy/10 bg-white py-5"
              >
                <m.icon className="h-4 w-4 text-blue" strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-navy">
                  {m.label}
                </span>
              </motion.div>
            ))}
          </div>

          <Connector delay={0.3} />

          {/* Layer 3 — Industry Modules */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
            className="rounded-xl border border-dashed border-navy/20 bg-white/60 py-4 text-center"
          >
            <span className="text-[12px] font-semibold tracking-[0.08em] text-navy/50 uppercase">
              Industry Modules
            </span>
          </motion.div>

          <Connector delay={0.6} />

          {/* Layer 4 — Industries */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {industries.map((ind, i) => (
              <motion.div
                key={ind}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.42 + i * 0.06, ease }}
                className="rounded-full border border-navy/10 bg-white px-4 py-2"
              >
                <span className="text-[12.5px] font-medium text-navy/70">
                  {ind}
                </span>
              </motion.div>
            ))}
          </div>

          <Connector delay={0.9} />

          {/* Layer 5 — SaaS Products */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.55, ease }}
            className="rounded-xl border border-cyan/30 bg-gradient-to-r from-cyan/10 to-blue/10 py-4 text-center"
          >
            <span className="text-[13px] font-semibold tracking-[0.06em] text-navy uppercase">
              SaaS Products
            </span>
          </motion.div>
        </motion.div>

        <p className="mt-8 text-center text-[13px] text-navy/40 max-w-[480px] mx-auto">
          Industry modules are designed to support these sectors as the
          platform expands — not a reflection of current customers.
        </p>
      </div>
    </section>
  );
}