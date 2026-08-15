"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

// Reuses the existing "industries.moduleLabels" translation keys
// (controls / evidence / risk / monitoring) — no new keys required there.
const capabilityKeys = ["controls", "evidence", "risk", "monitoring"] as const;

const captions: Record<(typeof capabilityKeys)[number], string> = {
  controls: "Policies, procedures and safeguards enforced consistently.",
  evidence: "Documentation and proof collected and retained systematically.",
  risk: "Exposure identified, assessed and tracked over time.",
  monitoring: "Ongoing oversight of compliance status and change.",
};

export function IndustriesSection() {
  const t = useTranslations("industries");

  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-pale">
      <div className="mx-auto max-w-[1000px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mx-auto text-center mb-16 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.15] font-semibold tracking-[-0.015em] text-navy mb-5"
          >
            One compliance foundation. Built to adapt.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60"
          >
            Our core infrastructure provides a consistent framework for
            controls, evidence, risk and monitoring, while allowing
            organisations to adapt it to their regulatory and operational
            requirements.
          </motion.p>
        </div>

        {/* Capability row — plain terms separated by hairline dividers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="border-y border-navy/15 divide-y divide-navy/15 sm:divide-y-0 sm:grid sm:grid-cols-4 sm:divide-x"
        >
          {capabilityKeys.map((key) => (
            <div key={key} className="px-6 py-9 sm:py-10 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-blue/70 mb-3">
                {t(`moduleLabels.${key}`)}
              </div>
              <p className="text-[13.5px] leading-[1.55] text-navy/50 max-w-[200px] mx-auto">
                {captions[key]}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Closing statement */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.25, ease }}
          className="mt-10 text-center text-[14.5px] leading-[1.7] text-navy/45 max-w-[560px] mx-auto"
        >
          These four capabilities form the common foundation beneath every
          deployment — the same infrastructure, configured to the regulatory
          and operational requirements of each industry it serves.
        </motion.p>
      </div>
    </section>
  );
}