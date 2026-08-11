"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Logo } from "./Logo";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

const locales = [
  { code: "en", label: "EN" },
  { code: "ca", label: "CA" },
  { code: "es", label: "ES" },
];

export function Navigation() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { label: t("platform"), href: "/#architecture" },
    { label: t("industries"), href: "/#industries" },
    { label: t("howItWorks"), href: "/#how-it-works" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu on route change or resize back to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
          scrolled || open
            ? "bg-white/80 backdrop-blur-md border-b border-navy/8 shadow-[0_1px_0_0_rgba(7,27,58,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <Link href="/#top" className="flex items-center -ml-2" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <ul className="hidden md:flex items-center gap-9">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group relative text-[14.5px] font-medium text-navy/70 hover:text-navy transition-colors"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-1.5 h-px w-0 bg-cyan transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-5">
            {/* language switcher */}
            <div className="flex items-center gap-1 text-[13px] font-medium text-navy/50">
              {locales.map((l, i) => (
                <span key={l.code} className="flex items-center">
                  <button
                    onClick={() => router.replace(pathname, { locale: l.code })}
                    className={`px-1.5 transition-colors ${
                      locale === l.code ? "text-navy" : "hover:text-navy/80"
                    }`}
                  >
                    {l.label}
                  </button>
                  {i < locales.length - 1 && <span className="text-navy/20">/</span>}
                </span>
              ))}
            </div>

            <Link
              href="/#contact"
              className="relative inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-[14.5px] font-medium text-white overflow-hidden group transition-transform active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue to-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">{t("contact")}</span>
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-navy relative z-10"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {open ? (
                <path
                  d="M5 5L17 17M17 5L5 17"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h16M3 11h16M3 16h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white border-b border-navy/8"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-[16px] font-medium text-navy/80 border-b border-navy/5"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-navy px-4 py-3 text-[15px] font-medium text-white"
              >
                {t("contact")}
              </Link>

              <div className="mt-6 flex items-center gap-3 text-[13px] font-medium text-navy/50">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      router.replace(pathname, { locale: l.code });
                      setOpen(false);
                    }}
                    className={`px-2 py-1 rounded border ${
                      locale === l.code ? "border-cyan/40 text-navy bg-pale" : "border-navy/10"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
