"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileSignature,
  User,
  Mail,
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
} from "lucide-react";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------- */
/*  Data                                                             */
/* ---------------------------------------------------------------- */

const stats = [
  {
    label: "OPEN REQUESTS",
    sub: "NEW REQUEST(S)",
    value: 13,
    delta: "+52%",
    up: true,
    ring: 24,
  },
  {
    label: "SETTLED REQUESTS",
    sub: "TODAY VS. YESTERDAY",
    value: 8,
    delta: "-11%",
    up: false,
    ring: 38,
  },
  {
    label: "AVG TIME (MIN)",
    sub: "TODAY VS. YESTERDAY",
    value: 2,
    delta: "+50%",
    up: true,
    ring: 16,
  },
  {
    label: "OVERDUE",
    sub: "TODAY VS. OVERDUE",
    value: 13,
    delta: "-96%",
    up: false,
    ring: 82,
  },
];

const typeMeta: Record<string, { icon: typeof ShieldQuestion; label: string }> = {
  nda: { icon: ShieldQuestion, label: "Nondisclosure Agreement" },
  indemnity: { icon: ScrollText, label: "Indemnity Agreement" },
  partnership: { icon: Handshake, label: "Partnership Agreement" },
};

const requests = [
  {
    vendor: "Beatty-Bruen Holdings",
    contact: "Dallas Hunnam",
    email: "d.hunnam@beattybruen.com",
    address: "7591 Graceland Trail",
    city: "Wichita, KS 67236",
    type: "nda",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Ferry-Bode Supply Co.",
    contact: "Cherin Attenborough",
    email: "c.attenborough@ferrybode.com",
    address: "96 Hanover Point",
    city: "Pensacola, FL 32511",
    type: "indemnity",
    status: 45,
    statusLabel: "Under Review",
    near: false,
  },
  {
    vendor: "Kreiger Inc.",
    contact: "Jarid Hammon",
    email: "j.hammon@kreigerinc.com",
    address: "3 Mendota Terrace",
    city: "Juneau, AK 99812",
    type: "partnership",
    status: 75,
    statusLabel: "Decision Made",
    near: false,
  },
  {
    vendor: "Shanahan, Padberg & Wiza",
    contact: "Koenraad Murrell",
    email: "k.murrell@spwlegal.com",
    address: "2 Fairfield Way",
    city: "Reading, PA 19610",
    type: "indemnity",
    status: 75,
    statusLabel: "Decision Made",
    near: true,
  },
  {
    vendor: "Schroeder & Sons",
    contact: "Vanny Mapam",
    email: "v.mapam@schroedersons.com",
    address: "1 Debra Street",
    city: "Irvine, CA 92717",
    type: "nda",
    status: 75,
    statusLabel: "Decision Made",
    near: true,
  },
  {
    vendor: "Mann-Towne Logistics",
    contact: "Gran Adamthwaite",
    email: "g.adamthwaite@manntowne.com",
    address: "8 Onsgard Circle",
    city: "Jefferson City, MO 65110",
    type: "nda",
    status: 75,
    statusLabel: "Decision Made",
    near: false,
  },
];

const actions = [
  {
    icon: ClipboardEdit,
    title: "New Contract Change Request",
    detail:
      "Click here to request a new contract change. Make sure to have all required information ready.",
  },
  {
    icon: LifeBuoy,
    title: "Request Help From Support",
    detail:
      "Open a new service desk ticket for help, or find useful information in our frequently asked questions.",
  },
  {
    icon: BarChart3,
    title: "View Contract Trends",
    detail:
      "Analyze a full report of recent contract trends like request volume, impact, and profitability metrics.",
  },
];

const tasks = [
  { title: "Sign Document", received: "Received Jul 20 at 7:24 PM", state: "Accepted" },
  { title: "Fill Out Request Form", received: "Received Jul 16 at 1:10 PM", state: "Accepted" },
  { title: "Review Asset Request #5", received: "Received Jul 2 at 7:20 PM", state: "Assigned" },
  { title: "Approve Vendor Onboarding", received: "Received Jun 29 at 9:45 AM", state: "Assigned" },
];

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */

function StatRing({ percent }: { percent: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-[64px] w-[64px] sm:h-[72px] sm:w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="-rotate-90 h-full w-full">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(7,27,58,0.08)" strokeWidth="6" />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#132A54"
          strokeWidth="6"
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease }}
      className="rounded-xl border border-navy/10 bg-white p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-navy/70 uppercase">
            {label}
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-navy/35 mt-1 truncate">{sub}</div>
          <span
            className={`inline-block mt-3 rounded-md px-2 py-[3px] text-[10.5px] font-semibold text-white ${
              up ? "bg-[#1E9E6B]" : "bg-[#D14343]"
            }`}
          >
            {delta}
          </span>
        </div>
        <div className="relative shrink-0 flex flex-col items-center">
          <StatRing percent={ring} />
          <div className="absolute top-0 left-0 h-[64px] w-[64px] sm:h-[72px] sm:w-[72px] flex items-center justify-center">
            <span className="text-[17px] sm:text-[20px] font-semibold text-navy tracking-tight">
              {value}
            </span>
          </div>
          <span className="mt-1.5 text-[9px] font-medium tracking-[0.08em] text-navy/30 uppercase">
            Recent
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ScaledMockup({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / 1180);
        setScale(newScale);
        setHeight(contentRef.current.offsetHeight * newScale);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ height: height > 0 ? height : "auto" }}
    >
      <div
        ref={contentRef}
        className="relative w-[1180px] max-w-none origin-top"
        style={{
          transform: `scale(${scale})`,
          marginBottom: height > 0 ? `-${contentRef.current?.offsetHeight! * (1 - scale)}px` : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Section                                                           */
/* ---------------------------------------------------------------- */

export function DashboardSection() {
  const t = useTranslations("dashboard");

  return (
    <section id="platform" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-pale px-3.5 py-1.5 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="text-[12px] font-semibold tracking-[0.08em] text-navy/60 uppercase">
              {t("eyebrow")}
            </span>
          </motion.div>
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

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease }}
          className="relative w-full"
        >
          <ScaledMockup>
            <div
              aria-hidden
              className="absolute -inset-16 -z-10 opacity-50 blur-[100px]"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(24,198,209,0.14), transparent 70%)",
              }}
            />

            <div className="rounded-2xl border border-navy/10 bg-[#F5F7FA] shadow-[0_1px_2px_rgba(7,27,58,0.04),0_40px_80px_-32px_rgba(7,27,58,0.22)] overflow-hidden">
              {/* Chrome bar */}
              <div className="flex items-center justify-between border-b border-navy/8 bg-white px-4 sm:px-7 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/10" />
                </div>
                <span className="text-[9.5px] sm:text-[10.5px] font-medium tracking-wide text-navy/35 uppercase whitespace-nowrap">
                  {t("illustrativeLabel")}
                </span>
              </div>

              <div className="p-4 sm:p-6">
                {/* Stat row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
                  {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={0.05 + i * 0.05} />
                  ))}
                </div>

                {/* Main grid: table + sidebar */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-3 sm:gap-4 items-start">
                  {/* Requests table */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: 0.25, ease }}
                    className="rounded-xl border border-navy/10 bg-white overflow-hidden"
                  >
                    <div className="flex items-center gap-2 bg-[#132A54] px-4 sm:px-5 py-3">
                      <FileSignature className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
                      <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.04em] text-white uppercase">
                        Recent Contract Change Requests
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] border-collapse">
                        <thead>
                          <tr className="border-b border-navy/8">
                            {[
                              "Vendor Name",
                              "Contact Name",
                              "Email",
                              "Address",
                              "Type",
                              "Status",
                              "Deadline Near",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left text-[10px] font-semibold tracking-[0.05em] text-navy/40 uppercase px-4 py-2.5 whitespace-nowrap"
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
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.04, ease }}
                                className="border-b border-navy/6 last:border-0"
                              >
                                <td className="px-4 py-3 text-[12px] font-medium text-navy whitespace-nowrap">
                                  {r.vendor}
                                </td>
                                <td className="px-4 py-3 text-[12px] text-navy/70 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-navy/30" />
                                    {r.contact}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[11.5px] text-navy/55 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-navy/30" />
                                    {r.email}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[11.5px] text-navy/55 whitespace-nowrap">
                                  <span className="inline-flex items-start gap-1.5">
                                    <MapPin className="h-3 w-3 text-navy/30 mt-0.5" />
                                    <span>
                                      {r.address}
                                      <br />
                                      {r.city}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[11.5px] text-navy/60 italic whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5">
                                    <TypeIcon className="h-3.5 w-3.5 text-blue not-italic shrink-0" strokeWidth={1.75} />
                                    {meta.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3 min-w-[140px]">
                                  <div className="h-1.5 rounded-full bg-navy/8 overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-[#132A54]"
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${r.status}%` }}
                                      viewport={{ once: true, margin: "-60px" }}
                                      transition={{ duration: 1, delay: 0.4 + i * 0.04, ease }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[10.5px] font-semibold text-navy/70">
                                      {r.status}%
                                    </span>
                                    <span className="text-[10.5px] italic text-navy/40">
                                      {r.statusLabel}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-block rounded-md bg-[#1E9E6B] px-2.5 py-1 text-[10.5px] font-semibold text-white">
                                    {r.near ? "YES" : "NO"}
                                  </span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* Sidebar */}
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* My Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: 0.3, ease }}
                      className="rounded-xl border border-navy/10 bg-white overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-[#132A54] px-4 sm:px-5 py-3">
                        <ShieldQuestion className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
                        <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.04em] text-white uppercase">
                          My Actions
                        </span>
                      </div>
                      <ul className="p-4 sm:p-5 space-y-4">
                        {actions.map((a, i) => {
                          const Icon = a.icon;
                          return (
                            <li key={a.title} className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-navy/10 bg-pale">
                                <Icon className="h-3.5 w-3.5 text-blue" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[12px] font-semibold text-navy">{a.title}</div>
                                <div className="text-[11px] leading-[1.5] text-navy/45 mt-0.5">
                                  {a.detail}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>

                    {/* My Tasks */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: 0.35, ease }}
                      className="rounded-xl border border-navy/10 bg-white overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 bg-[#132A54] px-4 sm:px-5 py-3">
                        <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.04em] text-white uppercase">
                          My Tasks
                        </span>
                        <div className="flex items-center gap-2.5 text-white/60">
                          <Filter className="h-3 w-3" strokeWidth={2} />
                          <RefreshCcw className="h-3 w-3" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="flex items-center justify-end px-4 sm:px-5 pt-3">
                        <span className="text-[10.5px] text-navy/35">1 to 4 of 19</span>
                      </div>
                      <ul className="p-4 sm:p-5 pt-2 space-y-4">
                        {tasks.map((task) => (
                          <li key={task.title} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[12px] font-semibold text-navy">{task.title}</div>
                              <div className="text-[10.5px] text-navy/40 mt-0.5">{task.received}</div>
                            </div>
                            <span className="mt-0.5 inline-flex items-center gap-1 shrink-0 text-[10.5px] text-navy/50">
                              {task.state === "Accepted" ? (
                                <CheckCircle2 className="h-3 w-3 text-[#1E9E6B]" strokeWidth={2} />
                              ) : (
                                <CircleDot className="h-3 w-3 text-navy/30" strokeWidth={2} />
                              )}
                              {task.state}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </ScaledMockup>

          <p className="mt-8 text-center text-[12px] text-navy/35">{t("footnote")}</p>
        </motion.div>
      </div>
    </section>
  );
}