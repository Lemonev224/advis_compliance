"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PenLine, Shuffle, RefreshCw, Unlink } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const pointKeys = ["manual", "fragmented", "changing", "disconnected"] as const;
const icons = { manual: PenLine, fragmented: Shuffle, changing: RefreshCw, disconnected: Unlink };

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section className="relative py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-8 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy"
          >
            {t("headline")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60 max-w-[520px] lg:pt-2"
          >
            {t("subtext")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pointKeys.map((key, i) => {
            const Icon = icons[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease }}
                whileHover={{ y: -4 }}
                className="group relative rounded-xl border border-navy/10 bg-white p-6 transition-colors duration-300 hover:border-cyan/40"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(160deg, rgba(24,198,209,0.06), transparent 60%)",
                  }}
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-navy/10 bg-pale mb-5 transition-colors duration-300 group-hover:border-cyan/30">
                  <Icon className="h-[18px] w-[18px] text-blue" strokeWidth={1.75} />
                </div>
                <h3 className="relative text-[16px] font-semibold text-navy tracking-tight mb-2">
                  {t(`points.${key}.title`)}
                </h3>
                <p className="relative text-[14px] leading-[1.6] text-navy/55">
                  {t(`points.${key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
