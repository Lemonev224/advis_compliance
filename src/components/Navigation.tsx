"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

const links = [
  { label: "Platform", href: "#architecture" },
  { label: "Industries", href: "#industries" },
  { label: "How It Works", href: "#how-it-works" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-navy/8 shadow-[0_1px_0_0_rgba(7,27,58,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <a href="#top" className="flex items-center -ml-2">
            <Logo />
          </a>

          <ul className="hidden md:flex items-center gap-9">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group relative text-[14.5px] font-medium text-navy/70 hover:text-navy transition-colors"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-1.5 h-px w-0 bg-cyan transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#contact"
              className="relative inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-[14.5px] font-medium text-white overflow-hidden group transition-transform active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue to-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Contact</span>
            </a>
          </div>

          <button
            className="md:hidden text-navy"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
