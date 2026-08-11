"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Truck,
  HardHat,
  ShoppingBag,
  Hotel,
  Plane,
  Boxes,
  type LucideIcon,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const industryKeys = [
  "logistics",
  "construction",
  "retail",
  "hospitality",
  "tourism",
  "other",
] as const;

const icons: Record<(typeof industryKeys)[number], LucideIcon> = {
  logistics: Truck,
  construction: HardHat,
  retail: ShoppingBag,
  hospitality: Hotel,
  tourism: Plane,
  other: Boxes,
};

const moduleKeys = ["controls", "evidence", "risk", "monitoring"] as const;

export function IndustriesSection() {
  const t = useTranslations("industries");
  const [active, setActive] = useState(0);
  const activeKey = industryKeys[active];

  const focus = t.raw(`list.${activeKey}.focus`) as string[];

  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px] mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy mb-4"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60"
          >
            {t("subtext")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="grid lg:grid-cols-[0.9fr_1.1fr] rounded-2xl border border-navy/10 overflow-hidden"
        >
          {/* Left: industry selector list */}
          <div className="flex flex-col divide-y divide-navy/10 bg-white">
            {industryKeys.map((key, i) => {
              const isActive = i === active;
              const Icon = icons[key];
              return (
                <button
                  key={key}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`group relative flex items-center gap-4 px-6 py-5 text-left transition-colors duration-300 ${
                    isActive ? "bg-pale" : "bg-white hover:bg-pale/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-full w-[2px] transition-colors duration-300 ${
                      isActive ? "bg-cyan" : "bg-transparent"
                    }`}
                  />
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                      isActive ? "border-cyan/40 bg-white" : "border-navy/10 bg-pale"
                    }`}
                  >
                    <Icon
                      className={`h-[16px] w-[16px] transition-colors duration-300 ${
                        isActive ? "text-cyan" : "text-blue"
                      }`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-[15px] font-semibold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-navy" : "text-navy/70"
                      }`}
                    >
                      {t(`list.${key}.name`)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: live infrastructure panel */}
          <div className="relative bg-pale px-8 py-10 lg:py-12 flex flex-col justify-between min-h-[380px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(7,27,58,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,27,58,0.05) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease }}
                className="relative"
              >
                <p className="text-[13px] uppercase tracking-[0.08em] text-blue/70 font-medium mb-3">
                  {t(`list.${activeKey}.name`)}
                </p>
                <p className="text-[17px] leading-[1.6] text-navy/70 max-w-[440px] mb-8">
                  {t(`list.${activeKey}.note`)}
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                  {focus.map((f) => (
                    <span
                      key={f}
                      className="text-[12.5px] text-navy/60 bg-white border border-navy/10 rounded-full px-3 py-1.5"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* infrastructure -> industry flow */}
            <div className="relative flex items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {moduleKeys.map((key) => (
                  <span
                    key={key}
                    className="text-[12px] font-medium text-navy/50 bg-white border border-navy/10 rounded-md px-2.5 py-1.5"
                  >
                    {t(`moduleLabels.${key}`)}
                  </span>
                ))}
              </div>
              <svg
                width="28"
                height="14"
                viewBox="0 0 28 14"
                fill="none"
                aria-hidden
                className="shrink-0 text-cyan/60"
              >
                <path
                  d="M1 7H25M25 7L19 1M25 7L19 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex h-9 items-center rounded-md border border-cyan/30 bg-navy px-3">
                <span className="text-[12.5px] font-medium text-white">
                  {t(`list.${activeKey}.name`)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
