"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Logo } from "./Logo";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Globe, ChevronDown } from "lucide-react";

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

  const [open, setOpen] = useState(false); // mobile menu
  const [langOpen, setLangOpen] = useState(false); // globe dropdown

  const links = [

    { label: t("industries"), href: "/#industries" },
    { label: t("howItWorks"), href: "/#how-it-works" },
    { label: t("company"), href: "#company" },
  ];

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu on resize back to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    // Coupa's nav is a solid white bar, not transparent-over-hero — it sits
    // above the image hero, so it's always opaque instead of scroll-triggered.
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-navy/8">
      <nav className="mx-auto max-w-[1320px] px-6 lg:px-8 h-[72px] flex items-center justify-between">
        <Link href="/#top" className="flex items-center -ml-2" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Center links, each with a Coupa-style dropdown chevron */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="group flex items-center gap-1 text-[15px] font-semibold text-navy/80 hover:text-navy transition-colors"
              >
                {link.label}

              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-4">
          {/* language switcher, Coupa uses a plain globe icon in this slot */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Change language"
              className="flex items-center justify-center h-9 w-9 rounded-full text-navy/60 hover:text-navy hover:bg-pale transition-colors"
            >
              <Globe className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-28 rounded-lg border border-navy/10 bg-white py-1.5 shadow-[0_12px_32px_-12px_rgba(7,27,58,0.25)]"
                >
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        router.replace(pathname, { locale: l.code });
                        setLangOpen(false);
                      }}
                      className={`block w-full px-3.5 py-2 text-left text-[13.5px] font-medium transition-colors ${
                        locale === l.code
                          ? "text-navy bg-pale"
                          : "text-navy/60 hover:text-navy hover:bg-pale/60"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Solid pill CTA — now the only button, labeled "Contact" */}
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full bg-cyan px-5 py-2.5 text-[14px] font-semibold text-navy hover:bg-cyan/85 transition-colors"
          >
            {t("contact")}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-navy relative z-10"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-white border-b border-navy/8"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-[16px] font-semibold text-navy/80 border-b border-navy/5"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-navy/50">
                {locales.map((l, i) => (
                  <span key={l.code} className="flex items-center">
                    <button
                      onClick={() => router.replace(pathname, { locale: l.code })}
                      className={`px-1.5 ${locale === l.code ? "text-navy" : ""}`}
                    >
                      {l.label}
                    </button>
                    {i < locales.length - 1 && <span className="text-navy/20">/</span>}
                  </span>
                ))}
              </div>

              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-cyan px-5 py-3 text-[15px] font-semibold text-navy"
              >
                {t("contact")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}