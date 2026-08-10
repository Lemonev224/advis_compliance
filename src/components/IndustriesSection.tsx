"use client";

import { motion } from "framer-motion";
import {
  Truck,
  HardHat,
  ShoppingBag,
  Hotel,
  Plane,
  Boxes,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const industries = [
  {
    icon: Truck,
    name: "Logistics",
    note: "Built to support supply chains, transport operations and fleet management.",
  },
  {
    icon: HardHat,
    name: "Construction",
    note: "Designed for project delivery, contractors, site operations and compliance.",
  },
  {
    icon: ShoppingBag,
    name: "Retail",
    note: "Built to support stores, ecommerce, inventory and customer operations.",
  },
  {
    icon: Hotel,
    name: "Hospitality",
    note: "Designed for hotels, restaurants, venues and guest-focused operations.",
  },
  {
    icon: Plane,
    name: "Tourism",
    note: "Built to support travel businesses, tour operators and visitor experiences.",
  },
  {
    icon: Boxes,
    name: "Other Industries",
    note: "Flexible infrastructure designed to adapt to new sectors and business models.",
  },
];

export function IndustriesSection() {
  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px] mb-14">
         
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-[32px] sm:text-[40px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy mb-4"
          >
            Compliance infrastructure for regulated industries.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[17px] leading-[1.7] text-navy/60"
          >
            The same core infrastructure is designed to support a range of
            regulatory environments as the platform expands.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease }}
              whileHover={{ y: -4 }}
              className="group relative rounded-xl border border-navy/10 bg-white p-6 transition-colors duration-300 hover:border-cyan/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(24,198,209,0.06), transparent 60%)",
                }}
              />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-navy/10 bg-pale mb-5 transition-colors duration-300 group-hover:border-cyan/30">
                <ind.icon className="h-[18px] w-[18px] text-blue" strokeWidth={1.75} />
              </div>
              <h3 className="relative text-[16px] font-semibold text-navy tracking-tight mb-2">
                {ind.name}
              </h3>
              <p className="relative text-[14px] leading-[1.6] text-navy/55">
                {ind.note}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}