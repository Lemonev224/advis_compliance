"use client";

import { motion } from "framer-motion";
import {
  FileCheck2,
  ShieldCheck,
  ScanSearch,
  Pencil,
  Mail,
  User,
  MapPin,
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
  { label: "OPEN REQUESTS", sub: "NEW REQUEST(S)", value: 13, delta: "+52%", up: true, ring: 24 },
  { label: "SETTLED REQUESTS", sub: "TODAY VS. YESTERDAY", value: 8, delta: "-11%", up: false, ring: 38 },
  { label: "AVG TIME (MIN)", sub: "TODAY VS. YESTERDAY", value: 2, delta: "+50%", up: true, ring: 16 },
  { label: "OVERDUE", sub: "TODAY VS. OVERDUE", value: 13, delta: "-96%", up: false, ring: 82 },
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
    address: "7591 Graceland Trail",
    city: "Wichita, KS 67236",
    type: "nda",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Ferry-Bode",
    contact: "Cherin Attenborough",
    email: "cattenborough6@ferrybode.com",
    address: "96 Hanover Point",
    city: "Pensacola, FL 32511",
    type: "indemnity",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Kreiger Inc",
    contact: "Jarid Hammon",
    email: "jhammon3@kreigerinc.com",
    address: "3 Mendota Terrace",
    city: "Juneau, AK 99812",
    type: "partnership",
    status: 75,
    statusLabel: "Decision Made",
    near: false,
  },
  {
    vendor: "Shanahan, Padberg and Wiza",
    contact: "Koenraad Murrell",
    email: "kmurrell7@spwlegal.com",
    address: "2 Fairfield Way",
    city: "Reading, PA 19610",
    type: "indemnity",
    status: 75,
    statusLabel: "Decision Made",
    near: true,
  },
  {
    vendor: "Schroeder and Sons",
    contact: "Vanny Mapam",
    email: "vmapam5@schroederandsons.com",
    address: "1 Debra Street",
    city: "Irvine, CA 92717",
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
    <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0">
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
      className="rounded-lg border border-navy/10 bg-white p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[8.5px] font-semibold tracking-[0.05em] text-navy/70 uppercase truncate">
            {label}
          </div>
          <div className="text-[7.5px] text-navy/35 mt-0.5 truncate">{sub}</div>
          <span
            className={`inline-block mt-2 rounded px-1.5 py-[2px] text-[8.5px] font-semibold text-white ${
              up ? "bg-[#1E9E6B]" : "bg-[#D14343]"
            }`}
          >
            {delta}
          </span>
        </div>
        <div className="relative shrink-0">
          <StatRing percent={ring} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[12px] sm:text-[13px] font-semibold text-navy tracking-tight">{value}</span>
          </div>
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

          {/* Dashboard visual — built with plain responsive Tailwind, no scale hacks */}
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

            <div className="w-full rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.25)] overflow-hidden">
              {/* Chrome */}
              <div className="flex items-center justify-between border-b border-navy/8 bg-white px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-navy/10" />
                  <span className="h-2 w-2 rounded-full bg-navy/10" />
                  <span className="h-2 w-2 rounded-full bg-navy/10" />
                </div>
                <span className="text-[8.5px] font-medium tracking-wide text-navy/35 uppercase">
                  Illustrative data
                </span>
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                {/* Stat row */}
                <div className="grid grid-cols-2 gap-2">
                  {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={0.15 + i * 0.05} />
                  ))}
                </div>

                {/* Requests table */}
                <div className="rounded-lg border border-navy/10 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 bg-[#132A54] px-3 py-2">
                    <Pencil className="h-3 w-3 text-cyan shrink-0" strokeWidth={2} />
                    <span className="text-[9.5px] font-semibold tracking-[0.03em] text-white uppercase truncate">
                      Recent Contract Change Requests
                    </span>
                  </div>

                  {/* Scrolls horizontally on narrow screens instead of squeezing columns unreadable */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse">
                      <thead>
                        <tr className="border-b border-navy/8">
                          <th className="w-6" />
                          {["Vendor", "Contact", "Type", "Status", "Near"].map((h) => (
                            <th
                              key={h}
                              className="text-left text-[8px] font-semibold tracking-[0.04em] text-navy/40 uppercase px-2 py-1.5 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((r, i) => {
                          const meta = typeMeta[r.type];
                          const TypeIcon = meta.icon;
                          return (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true, margin: "-60px" }}
                              transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease }}
                              className="border-b border-navy/6 last:border-0"
                            >
                              <td className="pl-2 py-2">
                                <Mail className="h-3 w-3 text-navy/30" strokeWidth={1.75} />
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[9.5px] font-medium text-navy whitespace-nowrap">
                                  {r.vendor}
                                </div>
                                <div className="text-[8px] text-navy/40 whitespace-nowrap flex items-center gap-1 mt-0.5">
                                  <Mail className="h-2.5 w-2.5 shrink-0" />
                                  {r.email}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-[9px] text-navy/70 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1">
                                  <User className="h-2.5 w-2.5 text-navy/30 shrink-0" />
                                  {r.contact}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-[8.5px] text-navy/60 italic whitespace-nowrap">
                                <span className="inline-flex items-center gap-1">
                                  <TypeIcon className="h-3 w-3 text-blue not-italic shrink-0" strokeWidth={1.75} />
                                  {meta.label}
                                </span>
                              </td>
                              <td className="px-2 py-2 min-w-[110px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 h-1.5 rounded-full bg-navy/8 overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-[#132A54]"
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${r.status}%` }}
                                      viewport={{ once: true, margin: "-60px" }}
                                      transition={{ duration: 1, delay: 0.35 + i * 0.05, ease }}
                                    />
                                  </div>
                                  <span className="text-[8px] font-semibold text-navy/60 whitespace-nowrap">
                                    {r.status}%
                                  </span>
                                </div>
                                <span className="text-[7.5px] italic text-navy/40 whitespace-nowrap">
                                  {r.statusLabel}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span className="inline-block rounded bg-[#1E9E6B] px-1.5 py-[2px] text-[8px] font-semibold text-white">
                                  {r.near ? "YES" : "NO"}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* My Actions + My Tasks — stack on mobile, side by side from sm up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-navy/10 bg-white overflow-hidden">
                    <div className="flex items-center gap-2 bg-[#132A54] px-3 py-2">
                      <ListChecks className="h-3 w-3 text-cyan shrink-0" strokeWidth={2} />
                      <span className="text-[9.5px] font-semibold tracking-[0.03em] text-white uppercase">
                        My Actions
                      </span>
                    </div>
                    <ul className="p-3 space-y-2.5">
                      {actions.map((a) => {
                        const Icon = a.icon;
                        return (
                          <li key={a.title} className="flex items-start gap-2">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-navy/10 bg-pale">
                              <Icon className="h-3 w-3 text-blue" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[9.5px] font-semibold text-navy leading-tight">{a.title}</div>
                              <div className="text-[8px] leading-[1.4] text-navy/45 mt-0.5">{a.detail}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-navy/10 bg-white overflow-hidden">
                    <div className="flex items-center justify-between gap-2 bg-[#132A54] px-3 py-2">
                      <span className="text-[9.5px] font-semibold tracking-[0.03em] text-white uppercase">
                        My Tasks
                      </span>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Filter className="h-2.5 w-2.5" strokeWidth={2} />
                        <RefreshCcw className="h-2.5 w-2.5" strokeWidth={2} />
                      </div>
                    </div>
                    <ul className="p-3 space-y-2.5">
                      {tasks.map((task) => (
                        <li key={task.title} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[9.5px] font-semibold text-navy leading-tight truncate">
                              {task.title}
                            </div>
                            <div className="text-[8px] text-navy/40 mt-0.5">{task.received}</div>
                          </div>
                          <span className="mt-0.5 inline-flex items-center gap-1 shrink-0 text-[8px] text-navy/50">
                            {task.state === "Accepted" ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-[#1E9E6B]" strokeWidth={2} />
                            ) : (
                              <CircleDot className="h-2.5 w-2.5 text-navy/30" strokeWidth={2} />
                            )}
                            {task.state}
                          </span>
                        </li>
                      ))}
                    </ul>
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