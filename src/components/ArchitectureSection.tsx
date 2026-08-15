"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

// Same four industries the old diagram surfaced — descriptions are pulled
// from the existing "industries" translation namespace (list.{key}.note),
// so no new translation keys are required.
const industryKeys = ["hospitality", "logistics", "retail", "construction"] as const;

export function ArchitectureSection() {
  const t = useTranslations("architecture");
  const tIndustries = useTranslations("industries");

  return (
    <section id="industries" className="relative py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mb-10 lg:mb-12">

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[26px] sm:text-[32px] leading-[1.15] font-semibold tracking-[-0.015em] text-navy mb-3"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[15px] leading-[1.6] text-navy/55 max-w-[480px]"
          >
            {t("subtext")}
          </motion.p>
        </div>

        {/* Industry register — full-width rows, hairline dividers, no cards */}
        <div className="border-t border-navy/15">
          {industryKeys.map((key, i) => (
            <IndustryRow
              key={key}
              index={i + 1}
              name={t(`industries.${key}`)}
              description={tIndustries(`list.${key}.note`)}
              delay={i * 0.06}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-6 text-[12.5px] leading-[1.55] text-navy/40 max-w-[520px]"
        >
          {t("disclaimer")}
        </motion.p>
      </div>
    </section>
  );
}

function IndustryRow({
  index,
  name,
  description,
  delay,
}: {
  index: number;
  name: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease }}
      className="group border-b border-navy/15 transition-colors duration-300 hover:bg-pale/70"
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-5 lg:gap-x-8 px-2 sm:px-4 py-5 lg:py-6">


        <div className="max-w-[640px]">
          <h3 className="text-[19px] sm:text-[21px] leading-[1.2] font-semibold tracking-[-0.01em] text-navy mb-1.5">
            {name}
          </h3>
          <p className="text-[13.5px] leading-[1.55] text-navy/55 max-w-[440px]">
            {description}
          </p>
        </div>

        <span
          aria-hidden
          className="mt-1.5 shrink-0 text-navy/30 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-blue"
        >

        </span>
      </div>
    </motion.div>
  );
}