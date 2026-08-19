"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const stepKeys = ["understand", "build", "monitor", "scale"] as const;

// Compass position for each stage label around the loop, clockwise from the top.
const positions: Record<(typeof stepKeys)[number], string> = {
  understand: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  build: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  monitor: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  scale: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
};

// ChevronRight defaults to pointing East (0deg).
// To point clockwise along the circle's tangents at these 45-degree corner points:
const arrows = [
  { top: "17.5%", left: "82.5%", rotate: "rotate-[45deg]" },   // NE -> pointing SE (down-right)
  { top: "82.5%", left: "82.5%", rotate: "rotate-[135deg]" },  // SE -> pointing SW (down-left)
  { top: "82.5%", left: "17.5%", rotate: "rotate-[225deg]" },  // SW -> pointing NW (up-left)
  { top: "17.5%", left: "17.5%", rotate: "rotate-[315deg]" },  // NW -> pointing NE (up-right)
];

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left: Copy */}
          <div className="max-w-[440px]">
            
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy mb-5"
            >
              {t("headline")}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-[15.5px] leading-[1.7] text-navy/60 mb-8"
            >
             {t("subtext")}
            </motion.p>
            
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="inline-flex items-center gap-2 rounded-md bg-navy px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-navy/90"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </motion.a>
          </div>

          {/* Right: Circular Process Diagram */}
          {/* The "build" and "scale" labels sit at left-0/right-0 and are pulled
              outward by -translate-x-1/2, so roughly half the pill's width sticks
              out past the circle's edge by design (it straddles the dashed track).
              On desktop there's plenty of spare margin in the grid column for that
              overflow to sit in. On mobile the diagram widens to fill almost the
              full viewport, leaving ~0 margin — so that overflow gets pushed past
              the section boundary and silently clipped by the section's
              `overflow-hidden`. Fix: reserve fixed side margin around the diagram
              (w-[calc(100%-64px)]) so there's always room for the overflow, and
              shrink the pill padding/text a touch on small screens so there's
              less overflow to begin with. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="relative mx-auto my-12 w-[calc(100%-64px)] sm:w-full max-w-[340px] aspect-square"
          >
            {/* Dashed Track */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
              <circle 
                cx="50" 
                cy="50" 
                r="46" 
                fill="none" 
                stroke="rgba(7,27,58,0.12)" 
                strokeWidth="1" 
                strokeDasharray="2 4" 
              />
            </svg>

            {/* Directional Arrows */}
            {arrows.map((a, i) => (
              <div
                key={`arrow-${i}`}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white rounded-full ${a.rotate}`}
                style={{ top: a.top, left: a.left }}
              >
                <ChevronRight className="h-4 w-4 text-navy/40" />
              </div>
            ))}

            {/* Center Mark / Logo Hub (Restored Scale & Overflow logic) */}
            <div className="absolute top-1/2 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-navy/10 bg-pale overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.08)] z-10">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto object-contain scale-[2.5]" 
              />
            </div>

            {/* Stage Labels (Restored original typography, removed dots) */}
            {stepKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease }}
                className={`absolute z-20 flex items-center justify-center whitespace-nowrap rounded-full border border-slate-100 bg-white px-3.5 py-1.5 sm:px-5 sm:py-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] ${positions[key]}`}
              >
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold tracking-tight text-navy">
                  {t(`steps.${key}.title`)}
                </span>
              </motion.div>
            ))}
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}