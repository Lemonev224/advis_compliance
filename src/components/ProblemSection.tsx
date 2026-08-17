"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

type Position = { top: string; left: string; rotate: number; z: number };

type Doc = {
  id: string;
  kind: "pdf" | "sheet" | "note" | "email" | "checklist";
  title: string;
  meta?: string;
  tone: "white" | "yellow" | "red";
  stamp?: string;
  desktop: { messy: Position; unified: Position };
  mobile: { messy: Position; unified: Position };
};

const docs: Doc[] = [
  {
    id: "sar",
    kind: "pdf",
    title: "SAR-4992.pdf",
    meta: "Suspected structuring · Client #4992",
    tone: "white",
    stamp: "OVERDUE",
    desktop: {
      messy: { top: "6%", left: "4%", rotate: -9, z: 3 },
      unified: { top: "0%", left: "0%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "2%", left: "2%", rotate: -5, z: 3 },
      unified: { top: "0%", left: "0%", rotate: 0, z: 1 },
    },
  },
  {
    id: "kyc",
    kind: "sheet",
    title: "KYC_Renewal_CorpB.xlsx",
    meta: "UBO documentation missing",
    tone: "white",
    desktop: {
      messy: { top: "2%", left: "30%", rotate: 6, z: 2 },
      unified: { top: "0%", left: "25.5%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "12%", left: "45%", rotate: 6, z: 2 },
      unified: { top: "0%", left: "52%", rotate: 0, z: 1 },
    },
  },
  {
    id: "note1",
    kind: "note",
    title: "URGENT — file by EOD",
    tone: "yellow",
    desktop: {
      messy: { top: "18%", left: "58%", rotate: -5, z: 5 },
      unified: { top: "0%", left: "51%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "26%", left: "8%", rotate: -4, z: 5 },
      unified: { top: "26%", left: "0%", rotate: 0, z: 1 },
    },
  },
  {
    id: "email",
    kind: "email",
    title: "Re: MiFID II Suitability",
    meta: "L. Garcia → Compliance",
    tone: "white",
    desktop: {
      messy: { top: "34%", left: "8%", rotate: 11, z: 1 },
      unified: { top: "0%", left: "76.5%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "35%", left: "50%", rotate: 8, z: 1 },
      unified: { top: "26%", left: "52%", rotate: 0, z: 1 },
    },
  },
  {
    id: "audit",
    kind: "pdf",
    title: "AFA_Audit_Report_Q3.pdf",
    meta: "Internal findings review",
    tone: "white",
    desktop: {
      messy: { top: "44%", left: "40%", rotate: -7, z: 4 },
      unified: { top: "52%", left: "0%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "52%", left: "4%", rotate: -6, z: 4 },
      unified: { top: "52%", left: "0%", rotate: 0, z: 1 },
    },
  },
  {
    id: "note2",
    kind: "note",
    title: "Ask M. Coma for UBO docs",
    tone: "yellow",
    desktop: {
      messy: { top: "52%", left: "66%", rotate: 8, z: 2 },
      unified: { top: "52%", left: "25.5%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "60%", left: "48%", rotate: 6, z: 2 },
      unified: { top: "52%", left: "52%", rotate: 0, z: 1 },
    },
  },
  {
    id: "checklist",
    kind: "checklist",
    title: "AML Alert Batch #882",
    meta: "5 flags to triage",
    tone: "white",
    desktop: {
      messy: { top: "62%", left: "10%", rotate: -4, z: 6 },
      unified: { top: "52%", left: "51%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "76%", left: "6%", rotate: -3, z: 6 },
      unified: { top: "78%", left: "0%", rotate: 0, z: 1 },
    },
  },
  {
    id: "note3",
    kind: "note",
    title: "Renewal window closes Friday",
    tone: "red",
    desktop: {
      messy: { top: "70%", left: "48%", rotate: 5, z: 3 },
      unified: { top: "52%", left: "76.5%", rotate: 0, z: 1 },
    },
    mobile: {
      messy: { top: "82%", left: "46%", rotate: 4, z: 3 },
      unified: { top: "78%", left: "52%", rotate: 0, z: 1 },
    },
  },
];

function DocCard({ doc, unified, isMobile }: { doc: Doc; unified: boolean; isMobile: boolean }) {
  const mode = isMobile ? doc.mobile : doc.desktop;
  const pos = unified ? mode.unified : mode.messy;

  const toneClasses =
    doc.tone === "yellow"
      ? "bg-[#FFF6D8] border-[#EBD98A]"
      : doc.tone === "red"
      ? "bg-red-50 border-red-200"
      : "bg-white border-navy/10";

  return (
    <motion.div
      className={`absolute w-[46%] sm:w-[23%] rounded-lg border ${toneClasses} p-3 shadow-[0_8px_24px_-8px_rgba(7,27,58,0.25)] cursor-default select-none`}
      animate={{
        top: pos.top,
        left: pos.left,
        rotate: pos.rotate,
        zIndex: pos.z,
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >


      <div className="flex items-center gap-1.5">

        <span className="text-[9px] font-semibold uppercase tracking-wide text-navy/40">
          {doc.kind === "pdf"
            ? "Document"
            : doc.kind === "sheet"
            ? "Spreadsheet"
            : doc.kind === "email"
            ? "Email"
            : doc.kind === "checklist"
            ? "Checklist"
            : "Note"}
        </span>
      </div>
      <div className="mt-1 text-[11px] font-semibold leading-snug text-navy">
        {doc.title}
      </div>
      {doc.meta && (
        <div className="mt-0.5 text-[9.5px] leading-snug text-navy/45">
          {doc.meta}
        </div>
      )}
    </motion.div>
  );
}

export function ProblemSection() {
  const [unified, setUnified] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial match
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section className="relative bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="max-w-[620px]">

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.02em] text-navy"
          >
            Compliance still runs on scattered paperwork.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mt-5 text-[17px] leading-[1.6] text-navy/60 max-w-[480px]"
          >
            Contracts, audit findings, and one off emails, all living in
            different systems, owned by different people, tracked by no one
            in particular.
          </motion.p>
        </div>

        {/* interactive canvas */}
        <div className="relative mt-14">
          <div className="relative h-[520px] sm:h-[420px]">
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} unified={unified} isMobile={isMobile} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setUnified((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-navy/90 active:scale-[0.98]"
            >
              {unified ? "Scatter it again" : "Bring it into one place"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}