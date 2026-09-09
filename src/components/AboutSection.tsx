"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

const markerKeys = ["andorra", "europe", "global"] as const;

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <section id="company" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-[0.035]" />

      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease }}
            className="relative order-2 lg:order-1"
          >
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[28px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(24,198,209,0.14), rgba(36,81,184,0.08), transparent)",
              }}
            />
            <div className="relative rounded-2xl border border-navy/10 overflow-hidden shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.25)]">
              <Image
                src="/andorra.png"
                alt="Andorra la Vella, Andorra"
                width={1024}
                height={512}
                className="w-full h-auto object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(7,27,58,0) 55%, rgba(7,27,58,0.28) 100%)",
                }}
              />
            </div>
          </motion.div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="text-balance text-[32px] sm:text-[42px] leading-[1.14] font-semibold tracking-[-0.015em] text-navy mb-6"
            >
              {t("headline")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-[16.5px] leading-[1.75] text-navy/60 max-w-[480px] mb-10"
            >
              {t("subtext")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="flex flex-wrap gap-3"
            >
              {markerKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-navy/10 bg-white px-4 py-2.5"
                >
                  <svg className="h-3.5 w-3.5 text-cyan shrink-0" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.5 12L13 4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13.5px] font-medium text-navy/75">
                    {t(`markers.${key}`)}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
