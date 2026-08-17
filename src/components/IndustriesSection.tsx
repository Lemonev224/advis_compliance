"use client";

import { useState, useEffect } from "react";
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
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const focus = tIndustries.raw(`list.${active}.focus`) as string[];

  // Preload all images when the component mounts
  useEffect(() => {
    industryKeys.forEach((key) => {
      const img = new window.Image();
      img.src = `/industries/${key}.jpg`;
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [key]: true }));
      };
      img.onerror = () => {
        // If the image fails to load, mark it as loaded anyway to avoid infinite loading
        // but also set the error state so the fallback is shown
        setImageError((prev) => ({ ...prev, [key]: true }));
        setLoadedImages((prev) => ({ ...prev, [key]: true }));
      };
    });
  }, []);

  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* ... ambient backgrounds unchanged ... */}

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px] mb-12 lg:mb-16">
          {/* ... headline and subtext unchanged ... */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start"
        >
          {/* Left: Tabs (unchanged) */}
          <div className="flex flex-col gap-2">
            {industryKeys.map((key) => {
              const isActive = key === active;
              const Icon = icons[key];

              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`group relative w-full text-left rounded-xl p-5 transition-all duration-300 border ${
                    isActive
                      ? "bg-white border-navy/10 shadow-[0_8px_20px_-8px_rgba(7,27,58,0.12)]"
                      : "bg-transparent border-transparent hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div>
                      <h4
                        className={`text-[15px] font-semibold transition-colors mt-2 ${
                          isActive ? "text-navy" : "text-navy/60 group-hover:text-navy"
                        }`}
                      >
                        {tIndustries(`list.${key}.name`)}
                      </h4>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="text-[13.5px] leading-[1.55] text-navy/55 overflow-hidden"
                          >
                            {tIndustries(`list.${key}.note`)}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Visual Showcase */}
          <div className="relative rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.15)] overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Image area */}
                <div className="relative flex-1 bg-gradient-to-br from-navy/[0.03] to-cyan/[0.03] overflow-hidden">
                  {/* Show loading skeleton until image is loaded and not error */}
                  {!loadedImages[active] && !imageError[active] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                    </div>
                  )}

                  <img
                    src={`/industries/${active}.jpg`}
                    alt={tIndustries(`list.${active}.name`)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                      loadedImages[active] && !imageError[active] ? "opacity-100" : "opacity-0"
                    }`}
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0";
                      setImageError((prev) => ({ ...prev, [active]: true }));
                      setLoadedImages((prev) => ({ ...prev, [active]: true })); // hide spinner
                    }}
                    // If the image is already preloaded, it will show immediately
                  />

                  {/* Fallback when image fails */}
                  {imageError[active] && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                      <div className="h-12 w-12 rounded-full bg-white border border-navy/10 flex items-center justify-center mb-3">
                        <icons.retail className="h-5 w-5 text-navy/30" />
                      </div>
                      <p className="text-[14px] font-semibold text-navy/60 mb-1">
                        Add your image here
                      </p>
                      <p className="text-[12.5px] text-navy/40 font-mono bg-white border border-navy/10 px-2 py-1 rounded">
                        public/industries/{active}.jpg
                      </p>
                    </div>
                  )}

                  {/* Soft gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>

                {/* Focus points content (unchanged) */}
                <div className="relative bg-white px-8 pb-8 pt-2">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[18px] font-semibold tracking-tight text-navy">
                      Key capabilities
                    </h3>
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan hover:text-cyan/80 transition-colors"
                    >
                      {tIndustries("ctaTalkToUs")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                    {focus.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                        <span className="text-[13.5px] leading-[1.6] text-navy/70">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}