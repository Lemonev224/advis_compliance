"use client";

import { useTranslations } from "next-intl";
import { Logo } from "./Logo";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  const links = [
    { label: t("links.industries"), href: "/#industries" },
    { label: t("links.howItWorks"), href: "/#how-it-works" },
    { label: t("links.terms"), href: "/terms" },
    { label: t("links.privacy"), href: "/privacy" },
  ];

  return (
    <footer className="relative border-t border-navy/8 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <Logo />
            <p className="mt-3 text-[13.5px] text-navy/45">{t("location")}</p>
          </div>

          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[14px] font-medium text-navy/60 hover:text-navy transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-navy/8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-navy/40">
            © {new Date().getFullYear()} Advisorly. {t("rights")}
          </span>
          <div className="flex items-center gap-6" />
        </div>
      </div>
    </footer>
  );
}
