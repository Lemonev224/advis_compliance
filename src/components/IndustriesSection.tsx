"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Truck,
  HardHat,
  Store,
  UtensilsCrossed,
  Plane,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const industryKeys = [
  "logistics",
  "construction",
  "retail",
  "hospitality",
  "tourism",
] as const;
type IndustryKey = (typeof industryKeys)[number];

const icons: Record<IndustryKey, LucideIcon> = {
  logistics: Truck,
  construction: HardHat,
  retail: Store,
  hospitality: UtensilsCrossed,
  tourism: Plane,
};

export function IndustriesSection() {
  const t = useTranslations("architecture");
  const tIndustries = useTranslations("industries");
  const [active, setActive] = useState<IndustryKey>("logistics");

  const focus = tIndustries.raw(`list.${active}.focus`) as string[];

  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-navy overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid bg-grid-fade opacity-[0.2]" />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="max-w-[640px] mb-12 lg:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.15] font-semibold tracking-[-0.015em] text-white mb-5"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-white/55 max-w-[520px]"
          >
            {t("subtext")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="grid lg:grid-cols-[0.85fr_1.15fr] rounded-lg border border-white/12 overflow-hidden"
        >
          {/* Left: accordion, single accent reserved for the active row */}
          <div className="divide-y divide-white/10 bg-[#0a2247]">
            {industryKeys.map((key) => {
              const isActive = key === active;
              const Icon = icons[key];

              return (
                <div
                  key={key}
                  className={`relative pl-6 pr-6 lg:pl-8 lg:pr-8 transition-colors duration-300 ${
                    isActive ? "bg-white/[0.03]" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-full w-[2px] transition-colors duration-300 ${
                      isActive ? "bg-cyan" : "bg-transparent"
                    }`}
                  />
                  <button
                    onClick={() => setActive(key)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="flex items-center gap-3">

                      <span
                        className={`text-[15px] font-semibold tracking-tight transition-colors duration-300 ${
                          isActive ? "text-white" : "text-white/60"
                        }`}
                      >
                        {tIndustries(`list.${key}.name`)}
                      </span>
                    </span>
                    <span className="text-[15px] leading-none text-white/30">
                      {isActive ? "\u2212" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6">
                          <p className="text-[13.5px] leading-[1.65] text-white/50 mb-5 max-w-[380px]">
                            {tIndustries(`list.${key}.note`)}
                          </p>
                          <a
                            href="#contact"
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan hover:text-cyan/80 transition-colors"
                          >
                            {tIndustries("ctaTalkToUs")}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right: regulatory scope reference — plain content, not a fake product screenshot */}
          <div className="relative border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0c1e3f] p-8 sm:p-10 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex-1 flex flex-col"
              >
                <h3 className="text-[22px] font-semibold tracking-tight text-white mb-2">
                  {tIndustries(`list.${active}.name`)}
                </h3>
                <p className="text-[14px] leading-[1.65] text-white/50 mb-8 max-w-[420px]">
                  {tIndustries(`list.${active}.note`)}
                </p>

                <div className="mt-auto border-t border-white/10">
                  {focus.map((item, i) => (
                    <div
                      key={item}
                      className="flex items-baseline gap-4 py-4 border-b border-white/10"
                    >
                      <span className="text-[13px] text-white/25 tabular-nums">
                        0{i + 1}
                      </span>
                      <span className="text-[14.5px] text-white/85">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.25, ease }}
          className="mt-8 text-[13px] leading-[1.6] text-white/40 max-w-[560px]"
        >
          {t("disclaimer")}
        </motion.p>
      </div>
    </section>
  );
}