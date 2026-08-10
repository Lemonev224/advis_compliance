"use client";

import { motion } from "framer-motion";
import { HeroDashboard } from "./HeroDashboard";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[68px]">
      {/* ambient backdrop */}
      <div className="absolute inset-0 -z-10 bg-pale" />
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade" />
      <motion.div
        aria-hidden
        className="absolute -z-10 top-[-160px] right-[-120px] h-[520px] w-[520px] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(circle, #18C6D1, transparent 70%)" }}
        animate={{ x: [0, 20, 0], y: [0, 16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -z-10 top-[220px] left-[-160px] h-[420px] w-[420px] rounded-full opacity-30 blur-[110px]"
        style={{ background: "radial-gradient(circle, #2451B8, transparent 70%)" }}
        animate={{ x: [0, -16, 0], y: [0, -12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-8 items-center">
          {/* Left column */}
          <div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="text-balance text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.04] font-semibold tracking-[-0.02em] text-navy"
            >
              Compliance,{" "}
              <span className="relative inline-block">
                built into
                <svg
                  className="absolute left-0 -bottom-1 w-full"
                  height="10"
                  viewBox="0 0 220 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 7C40 2 120 2 218 7"
                    stroke="url(#underline-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.9, ease }}
                  />
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="220" y2="0">
                      <stop stopColor="#2451B8" />
                      <stop offset="1" stopColor="#18C6D1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              the business.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mt-7 text-[18px] leading-[1.6] text-navy/65 max-w-[480px]"
            >
              We turn complex regulatory requirements into scalable software
              infrastructure for regulated industries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="#contact"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md bg-navy px-6 py-3.5 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue to-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Get in Touch</span>
                <svg
                  className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right column */}
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
