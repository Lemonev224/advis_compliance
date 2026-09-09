"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

type Node = {
  key: string;
  label: string;
  x: number;
  y: number;
};

const leftNodes: Node[] = [
  { key: "excel", label: "Excel", x: 100, y: 50 },
  { key: "salesforce", label: "Salesforce", x: 100, y: 176 },
  { key: "hubspot", label: "HubSpot", x: 100, y: 302 },
  { key: "sharepoint", label: "SharePoint", x: 100, y: 428 },
];

const rightNodes: Node[] = [
  { key: "sesame", label: "Sesame HR", x: 1000, y: 50 },
  { key: "bamboo", label: "BambooHR", x: 1000, y: 176 },
  { key: "procore", label: "Procore", x: 1000, y: 302 },
  { key: "cloudbeds", label: "Cloudbeds", x: 1000, y: 428 },
];

const CARD_LEFT = 360;
const CARD_RIGHT = 740;
const CARD_MID_Y = 240;

function pathFor(node: Node, side: "left" | "right") {
  const edgeX = side === "left" ? CARD_LEFT + 20 : CARD_RIGHT - 20;
  const startX = node.x;
  const c1x = side === "left" ? startX + 130 : startX - 130;
  const c2x = side === "left" ? edgeX - 130 : edgeX + 130;
  return `M${startX},${node.y} C${c1x},${node.y} ${c2x},${CARD_MID_Y} ${edgeX},${CARD_MID_Y}`;
}

function Pill({ label, index }: { label: string; index: number }) {
  return (
    <div className="relative w-[124px] rounded-full border border-navy/10 bg-white px-4 py-2.5 text-center shadow-[0_8px_20px_-10px_rgba(7,27,58,0.25)]">
      <motion.span
        className="absolute inset-0 rounded-full border border-cyan/40"
        animate={{ opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
      />
      <span className="relative text-[13px] font-semibold text-navy whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function PillInSVG({ node, index }: { node: Node; index: number }) {
  const pillWidth = 124;
  const pillHeight = 44;

  return (
    <foreignObject
      x={node.x - pillWidth / 2}
      y={node.y - pillHeight / 2}
      width={pillWidth}
      height={pillHeight}
      className="overflow-visible"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease }}
        className="flex items-center justify-center w-full h-full"
      >
        <Pill label={node.label} index={index} />
      </motion.div>
    </foreignObject>
  );
}

export function IntegrationsSection() {
  const t = useTranslations("integrations");
  const allNodes = [...leftNodes, ...rightNodes];

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-[0.03]" />
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[480px] w-[900px] opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(closest-side, rgba(24,198,209,0.14), transparent)" }}
      />

      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[640px] mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[42px] leading-[1.14] font-semibold tracking-[-0.015em] text-navy"
          >
            {t("headline")}
          </motion.h2>
        </div>

        {/* Desktop: connector diagram */}
        <div
          className="relative mx-auto hidden lg:block w-full max-w-[1100px]"
          style={{ aspectRatio: "1100 / 480" }}
        >
          <svg
            viewBox="0 0 1100 480"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="integ-line-left" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#18C6D1" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#2451B8" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="integ-line-right" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2451B8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#18C6D1" stopOpacity="0.75" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left lines */}
            {leftNodes.map((n, i) => (
              <g key={n.key}>
                <motion.path
                  d={pathFor(n, "left")}
                  fill="none"
                  stroke="url(#integ-line-left)"
                  strokeWidth="1.5"
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease }}
                />
                <motion.path
                  d={pathFor(n, "left")}
                  fill="none"
                  stroke="#18C6D1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  initial={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                  whileInView={{
                    pathOffset: [0, 1],
                    opacity: [0, 1, 0],
                  }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.8 + i * 0.35,
                  }}
                />
              </g>
            ))}

            {/* Right lines */}
            {rightNodes.map((n, i) => (
              <g key={n.key}>
                <motion.path
                  d={pathFor(n, "right")}
                  fill="none"
                  stroke="url(#integ-line-right)"
                  strokeWidth="1.5"
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease }}
                />
                <motion.path
                  d={pathFor(n, "right")}
                  fill="none"
                  stroke="#18C6D1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  initial={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                  whileInView={{
                    pathOffset: [0, 1],
                    opacity: [0, 1, 0],
                  }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1.2 + i * 0.35,
                  }}
                />
              </g>
            ))}

            {allNodes.map((n, i) => (
              <PillInSVG key={n.key} node={n} index={i} />
            ))}
          </svg>

          {/* Center card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="absolute rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_40px_80px_-28px_rgba(7,27,58,0.22)] flex flex-col items-center justify-center text-center px-10"
            style={{
              left: `${(CARD_LEFT / 1100) * 100}%`,
              top: `${(110 / 480) * 100}%`,
              width: `${((CARD_RIGHT - CARD_LEFT) / 1100) * 100}%`,
              height: `${(260 / 480) * 100}%`,
            }}
          >
            <h3 className="text-[22px] leading-[1.25] font-semibold tracking-[-0.01em] text-navy mb-3">
              {t("cardTitle")}
            </h3>
            <p className="text-[13.5px] leading-[1.6] text-navy/55 max-w-[320px] mb-6">
              {t("cardSubtext")}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy/90"
            >
              {t("cta")}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </div>

        {/* Mobile / tablet */}
        <div className="lg:hidden">
          <div className="mx-auto max-w-[420px] rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(7,27,58,0.04),0_32px_64px_-28px_rgba(7,27,58,0.2)] px-7 py-9 text-center mb-10">
            <h3 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy mb-2.5">
              {t("cardTitle")}
            </h3>
            <p className="text-[13.5px] leading-[1.6] text-navy/55 mb-6">
              {t("cardSubtext")}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy/90"
            >
              {t("cta")}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-[440px] mx-auto">
            {allNodes.map((n, i) => (
              <motion.div
                key={n.key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease }}
                className="rounded-full border border-navy/10 bg-white px-4 py-2 shadow-[0_6px_16px_-8px_rgba(7,27,58,0.2)]"
              >
                <span className="text-[12.5px] font-semibold text-navy whitespace-nowrap">
                  {n.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}