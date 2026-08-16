"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedNumber } from "./AnimatedNumber";

const ease = [0.16, 1, 0.3, 1] as const;

const statKeys = ["modules", "frameworks", "industries"] as const;
const statValues: Record<(typeof statKeys)[number], { value: number; suffix: string }> = {
  modules: { value: 4, suffix: "" },
  frameworks: { value: 4, suffix: "+" },
  industries: { value: 5, suffix: "" },
};

export function ProofSection() {
  const t = useTranslations("proof");

  return (
    <section className="relative py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8">
        <div className="max-w-[600px] mb-14 lg:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.15] font-semibold tracking-[-0.015em] text-navy mb-5"
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

        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          {statKeys.map((key, i) => {
            const s = statValues[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
                className="border-t border-navy/15 pt-6"
              >
                <div className="font-tabular text-[44px] sm:text-[52px] leading-none font-semibold tracking-[-0.02em] text-navy mb-3">
                  <AnimatedNumber
                    value={s.value}
                    format={(n) => `${Math.round(n)}${s.suffix}`}
                    delay={0.15 + i * 0.1}
                  />
                </div>
                <p className="text-[14.5px] leading-[1.6] text-navy/55 max-w-[220px]">
                  {t(`stats.${key}.caption`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}