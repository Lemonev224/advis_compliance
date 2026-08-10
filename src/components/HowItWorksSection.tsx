"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    number: "01",
    title: "Understand",
    description: "Translate regulatory requirements into structured controls.",
  },
  {
    number: "02",
    title: "Build",
    description: "Turn controls into policies, workflows and operational processes.",
  },
  {
    number: "03",
    title: "Monitor",
    description: "Continuously track compliance and collect evidence.",
  },
  {
    number: "04",
    title: "Scale",
    description:
      "Extend the same infrastructure across new requirements, entities and industries.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px] mb-20">
        
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy"
          >
            From regulation to operational infrastructure.
          </motion.h2>
        </div>

        <div className="relative">
          {/* connecting line — desktop */}
          <div className="hidden lg:block absolute top-[15px] left-0 right-0 h-px bg-navy/10">
            <motion.div
              className="h-full bg-gradient-to-r from-blue to-cyan origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.1, ease, delay: 0.2 }}
            />
          </div>

          <div className="grid lg:grid-cols-4 gap-10 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease }}
                className="relative flex lg:flex-col gap-5 lg:gap-0"
              >
                <div className="relative shrink-0 lg:mb-6">
                  {/* connecting line — mobile */}
                  {i !== steps.length - 1 && (
                    <span className="lg:hidden absolute left-1/2 top-8 -translate-x-1/2 w-px h-[calc(100%+2.5rem)] bg-navy/10" />
                  )}
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-navy/15 bg-white text-[12px] font-semibold text-navy">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-navy tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.65] text-navy/55 max-w-[240px]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}