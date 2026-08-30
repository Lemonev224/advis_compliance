"use client";

import { motion } from "framer-motion";
import {
  FileCheck2,
  ShieldCheck,
  ScanSearch,
  Pencil,
  Mail,
  User,
  ShieldQuestion,
  Handshake,
  ScrollText,
  ClipboardEdit,
  LifeBuoy,
  BarChart3,
  Filter,
  RefreshCcw,
  CircleDot,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------- */
/*  Dashboard data                                                   */
/* ---------------------------------------------------------------- */

const stats = [
  { label: "Open Requests", sub: "New Request(s)", value: 13, delta: "+52%", up: true, ring: 24 },
  { label: "Settled Requests", sub: "Today Vs. Yesterday", value: 8, delta: "-11%", up: false, ring: 38 },
  { label: "Avg Time (Min)", sub: "Today Vs. Yesterday", value: 2, delta: "+50%", up: true, ring: 16 },
  { label: "Overdue", sub: "Today Vs. Overdue", value: 13, delta: "-96%", up: false, ring: 82 },
];

const typeMeta: Record<string, { icon: typeof ShieldQuestion; label: string }> = {
  nda: { icon: ShieldQuestion, label: "Nondisclosure Agreement" },
  indemnity: { icon: ScrollText, label: "Indemnity Agreement" },
  partnership: { icon: Handshake, label: "Partnership Agreement" },
};

const requests = [
  {
    vendor: "Beatty-Bruen",
    contact: "Dallis Hunnam",
    email: "dhunnam1@beattybruen.com",
    type: "nda",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Ferry-Bode",
    contact: "Cherin Attenborough",
    email: "cattenborough6@ferrybode.com",
    type: "indemnity",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Kreiger Inc",
    contact: "Jarid Hammon",
    email: "jhammon3@kreigerinc.com",
    type: "partnership",
    status: 75,
    statusLabel: "Decision Made",
    near: false,
  },
  {
    vendor: "Shanahan, Padberg and Wiza",
    contact: "Koenraad Murrell",
    email: "kmurrell7@spwlegal.com",
    type: "indemnity",
    status: 75,
    statusLabel: "Decision Made",
    near: true,
  },
  {
    vendor: "Schroeder and Sons",
    contact: "Vanny Mapam",
    email: "vmapam5@schroederandsons.com",
    type: "nda",
    status: 75,
    statusLabel: "Decision Made",
    near: true,
  },
];

const actions = [
  {
    icon: ClipboardEdit,
    title: "New Contract Change Request",
    detail: "Request a new contract change. Make sure to have all required information ready.",
  },
  {
    icon: LifeBuoy,
    title: "Request Help From Support",
    detail: "Open a service desk ticket, or browse our frequently asked questions.",
  },
  {
    icon: BarChart3,
    title: "View Contract Trends",
    detail: "Analyze a full report of recent contract volume, impact, and profitability.",
  },
];

const tasks = [
  { title: "Sign Document", received: "Jul 20, 7:24 PM", state: "Accepted" },
  { title: "Fill Out Request Form", received: "Jul 16, 1:10 PM", state: "Accepted" },
  { title: "Review Asset Request #5", received: "Jul 2, 7:20 PM", state: "Assigned" },
];

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */

function StatRing({ percent }: { percent: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0">
      <svg viewBox="0 0 56 56" className="-rotate-90 h-full w-full">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(7,27,58,0.08)" strokeWidth="5" />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#132A54"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, ease, delay: 0.1 }}
        />
      </svg>
    </div>
  );
}

function StatCard({
  label,
  sub,
  value,
  delta,
  up,
  ring,
  delay,
}: (typeof stats)[number] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease }}
      className="rounded-md border border-navy/10 bg-white p-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[7.5px] font-semibold text-navy/70 truncate">
            {label}
          </div>
          <div className="text-[6.5px] text-navy/35 mt-0.5 truncate">{sub}</div>
          <span
            className={`inline-block mt-1.5 rounded px-1.5 py-[1.5px] text-[7.5px] font-semibold text-white ${
              up ? "bg-[#1E9E6B]" : "bg-[#D14343]"
            }`}
          >
            {delta}
          </span>
        </div>
        <div className="relative shrink-0">
          <StatRing percent={ring} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-navy tracking-tight">
              {value}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* Compact request row — wraps naturally at any width instead of relying on
   a fixed-width table, so there's never a need for horizontal scroll. */
function RequestRow({ r, delay }: { r: (typeof requests)[number]; delay: number }) {
  const meta = typeMeta[r.type];
  const TypeIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay, ease }}
      className="flex items-start gap-2 border-b border-navy/6 px-3 py-2 last:border-0"
    >
      <Mail className="h-3 w-3 text-navy/30 mt-0.5 shrink-0" strokeWidth={1.75} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[9.5px] font-medium text-navy truncate">{r.vendor}</div>
            <div className="text-[8px] text-navy/40 truncate">{r.email}</div>
          </div>
          <span className="shrink-0 rounded bg-[#1E9E6B] px-1.5 py-[1.5px] text-[7.5px] font-semibold text-white">
            {r.near ? "NEAR" : "FAR"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 text-[8px] text-navy/60">
            <User className="h-2.5 w-2.5 text-navy/30 shrink-0" />
            {r.contact}
          </span>
          <span className="inline-flex items-center gap-1 text-[8px] text-navy/60">
            <TypeIcon className="h-2.5 w-2.5 text-blue shrink-0" strokeWidth={1.75} />
            {meta.label}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 max-w-[140px] rounded-full bg-navy/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#132A54]"
              initial={{ width: 0 }}
              whileInView={{ width: `${r.status}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: delay + 0.05, ease }}
            />
          </div>
          <span className="text-[7.5px] font-semibold text-navy/60">{r.status}%</span>
          <span className="text-[7.5px] italic text-navy/40">· {r.statusLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/*  Section                                                           */
/* ---------------------------------------------------------------- */

export function SolutionSection() {
  const t = useTranslations("solution");

  const points = [
    {
      key: "intake",
      icon: FileCheck2,
      title: t("points.intake.title"),
      description: t("points.intake.description"),
    },
    {
      key: "verification",
      icon: ScanSearch,
      title: t("points.verification.title"),
      description: t("points.verification.description"),
    },
    {
      key: "filing",
      icon: ShieldCheck,
      title: t("points.filing.title"),
      description: t("points.filing.description"),
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Ambient background shapes */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-[0.03]" />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full opacity-50 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, rgba(24,198,209,0.16), transparent)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-[-10%] -z-10 h-[420px] w-[420px] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, rgba(36,81,184,0.14), transparent)" }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[420px] w-[420px] opacity-[0.05]"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="99" fill="none" stroke="#071B3A" strokeWidth="1" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="#071B3A" strokeWidth="1" />
        <circle cx="100" cy="100" r="53" fill="none" stroke="#071B3A" strokeWidth="1" />
      </svg>

      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <div className="min-w-0">
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
              {t("description")}
            </motion.p>

            <div className="space-y-5 mb-10">
              {points.map((point, i) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.key}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
                    className="flex items-start gap-3.5"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy/10 bg-pale">
                      <Icon className="h-4 w-4 text-blue" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-navy mb-0.5">{point.title}</div>
                      <p className="text-[13.5px] leading-[1.6] text-navy/55">{point.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.4, ease }}
              className="flex flex-wrap items-center gap-3"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg bg-navy px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-navy/90"
              >
                {t("cta")}
              </a>
            </motion.div>
          </div>

          {/* Dashboard visual — shrunk down, and the requests table replaced
              with a wrapping card-row list (RequestRow) so nothing ever
              needs a fixed min-width or horizontal scroll. */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="relative min-w-0"
          >
            <div
              aria-hidden
              className="absolute -inset-10 -z-10 rounded-[40px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(24,198,209,0.16), rgba(36,81,184,0.10), transparent)",
              }}
            />

            <div className="w-full max-w-[460px] mx-auto lg:mx-0 rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.25)] overflow-hidden">
              {/* Chrome */}
              <div className="flex items-center justify-between border-b border-navy/8 bg-white px-3.5 py-2">
                <div className="flex items-center gap-1.5">
                </div>
                <span className="text-[7.5px] font-medium text-navy/35">
                  Illustrative data
                </span>
              </div>

              <div className="p-2.5 sm:p-3 space-y-2.5">
                {/* Stat row */}
                <div className="grid grid-cols-2 gap-1.5">
                  {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={0.15 + i * 0.05} />
                  ))}
                </div>

                {/* Requests — card list, wraps at any width, never scrolls */}
                <div className="rounded-lg border border-navy/10 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 bg-[#132A54] px-3 py-1.5">
                    <Pencil className="h-2.5 w-2.5 text-cyan shrink-0" strokeWidth={2} />
                    <span className="text-[8.5px] font-semibold text-white truncate">
                      Recent Contract Change Requests
                    </span>
                  </div>
                  <div>
                    {requests.map((r, i) => (
                      <RequestRow key={r.vendor} r={r} delay={0.3 + i * 0.05} />
                    ))}
                  </div>
                </div>

                </div>
            </div>

            <p className="mt-6 text-center text-[12px] text-navy/35">{t("disclaimer")}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}