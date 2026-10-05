"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BedDouble,
  CalendarClock,
  FileCheck2,
  FileSpreadsheet,
  FileWarning,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Table2,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease },
});

const problems = [
  { key: "rooms", icon: KeyRound },
  { key: "documents", icon: FileWarning },
  { key: "spreadsheets", icon: Table2 },
] as const;

const features = [
  { key: "contracts", icon: ScrollText },
  { key: "housing", icon: BedDouble },
  { key: "documents", icon: FileCheck2 },
  { key: "reminders", icon: CalendarClock },
  { key: "team", icon: Users },
  { key: "import", icon: FileSpreadsheet },
] as const;

const steps = ["one", "two", "three"] as const;

const privacy = [
  { key: "access", icon: Lock },
  { key: "files", icon: ShieldCheck },
  { key: "control", icon: Trash2 },
] as const;

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/shiftcomply/demo"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 active:scale-[0.98]"
    >
      {children}
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}

export function ShiftComplyLanding() {
  const t = useTranslations("shiftcomply");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-[136px] pb-16 lg:pt-[168px] lg:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 bg-grid bg-grid-fade" />
        <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-[760px] text-center">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="text-balance text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.08] font-semibold tracking-[-0.02em] text-navy"
            >
              {t("headline")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mx-auto mt-6 max-w-[600px] text-[17px] leading-[1.6] text-navy/60"
            >
              {t("subtext")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <PrimaryButton>{t("ctaDemo")}</PrimaryButton>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full border border-navy/15 bg-white px-7 py-3.5 text-[15px] font-semibold text-navy transition-colors hover:bg-pale"
              >
                {t("ctaContact")}
              </Link>
            </motion.div>
            <p className="mt-5 text-[13px] text-navy/45">{t("builtFor")}</p>
          </div>

          {/* Product screenshot in a browser frame */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="relative mx-auto mt-14 max-w-[1080px] overflow-hidden rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_32px_64px_-24px_rgba(7,27,58,0.28)]"
          >
            <div className="flex items-center gap-2 border-b border-navy/8 bg-white px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
            </div>
            <Image
              src="/shiftcomply/dashboard.png"
              alt={t("screenshotAlt")}
              width={2720}
              height={1720}
              priority
              sizes="(max-width: 1100px) 100vw, 1080px"
              className="block h-auto w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-pale/60 py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <motion.h2
            {...fadeUp()}
            className="max-w-[560px] text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy"
          >
            {t("problemTitle")}
          </motion.h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {problems.map((p, i) => (
              <motion.div
                key={p.key}
                {...fadeUp(0.05 * i)}
                className="rounded-2xl border border-navy/8 bg-white p-7"
              >
                <p.icon className="h-6 w-6 text-blue" strokeWidth={1.75} />
                <h3 className="mt-5 text-[17px] font-semibold text-navy">{t(`problems.${p.key}.title`)}</h3>
                <p className="mt-2 text-[15px] leading-[1.65] text-navy/60">{t(`problems.${p.key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="max-w-[560px]">
            <motion.h2
              {...fadeUp()}
              className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy"
            >
              {t("featuresTitle")}
            </motion.h2>
            <motion.p {...fadeUp(0.05)} className="mt-4 text-[16px] leading-[1.7] text-navy/60">
              {t("featuresSubtext")}
            </motion.p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.key} {...fadeUp(0.04 * i)}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pale text-blue">
                  <f.icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold text-navy">{t(`features.${f.key}.title`)}</h3>
                <p className="mt-2 text-[15px] leading-[1.65] text-navy/60">{t(`features.${f.key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <motion.h2
            {...fadeUp()}
            className="text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy"
          >
            {t("stepsTitle")}
          </motion.h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.li
                key={s}
                {...fadeUp(0.05 * i)}
                className="relative rounded-2xl border border-navy/8 bg-white p-7"
              >
                <span className="font-tabular text-[13px] font-semibold text-blue">0{i + 1}</span>
                <h3 className="mt-3 text-[17px] font-semibold text-navy">{t(`steps.${s}.title`)}</h3>
                <p className="mt-2 text-[15px] leading-[1.65] text-navy/60">{t(`steps.${s}.text`)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-navy py-24 lg:py-28 text-white">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <motion.h2
            {...fadeUp()}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em]"
          >
            {t("privacyTitle")}
          </motion.h2>
          <ul className="space-y-6">
            {privacy.map((p, i) => (
              <motion.li key={p.key} {...fadeUp(0.05 * i)} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan">
                  <p.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="pt-2 text-[16px] leading-[1.6] text-white/75">{t(`privacy.${p.key}`)}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final call to action */}
      <section className="bg-white py-24 lg:py-28">
        <motion.div {...fadeUp()} className="mx-auto max-w-[720px] px-6 text-center">
          <h2 className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy">
            {t("ctaTitle")}
          </h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-navy/60">{t("ctaText")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton>{t("ctaDemo")}</PrimaryButton>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full border border-navy/15 bg-white px-7 py-3.5 text-[15px] font-semibold text-navy transition-colors hover:bg-pale"
            >
              {t("ctaContact")}
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
