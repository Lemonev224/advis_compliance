"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, BedDouble, FileCheck2, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** The access-code form for the ShiftComply demo. A correct code opens /shiftcomply-demo. */
export function DemoAccess() {
  const t = useTranslations("shiftcomply.demo");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/shiftcomply-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    if (res?.ok) {
      // Full page load: the demo app has its own layout.
      window.location.assign("/shiftcomply-demo");
      return;
    }
    setError(res?.status === 401 ? t("wrong") : t("failed"));
    setBusy(false);
  };

  return (
    <section className="relative overflow-hidden bg-white pt-[136px] pb-24 lg:pt-[160px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" />
      <div className="relative mx-auto max-w-[480px] px-6">
        <Link href="/shiftcomply" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-navy/55 hover:text-navy">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(7,27,58,0.22)]">
          <h1 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.015em] text-navy">{t("title")}</h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-navy/60">{t("text")}</p>

          <form onSubmit={submit} className="mt-7">
            <label htmlFor="demo-code" className="block text-[13.5px] font-medium text-navy/80">
              {t("label")}
            </label>
            <input
              id="demo-code"
              autoFocus
              required
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("placeholder")}
              className="mt-2 h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-[15px] tracking-[0.08em] text-navy uppercase outline-none placeholder:tracking-normal placeholder:normal-case placeholder:text-navy/35 focus:border-blue focus:ring-4 focus:ring-blue/10"
            />
            {error && (
              <p role="alert" className="mt-2.5 text-[13.5px] text-[#b42318]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t("checking") : t("submit")}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-[13.5px] text-navy/55">
            {t("noCode")}{" "}
            <Link href="/#contact" className="font-medium text-blue hover:underline">
              {t("askUs")}
            </Link>
          </p>
        </div>

        <ul className="mt-7 space-y-3 px-1 text-[14px] text-navy/60">
          {[
            { icon: Users, key: "staff" },
            { icon: BedDouble, key: "housing" },
            { icon: FileCheck2, key: "documents" },
          ].map((it) => (
            <li key={it.key} className="flex items-center gap-3">
              <it.icon className="h-4 w-4 text-blue" strokeWidth={1.75} />
              {t(`points.${it.key}`)}
            </li>
          ))}
        </ul>
        <p className="mt-6 px-1 text-[12.5px] leading-[1.6] text-navy/40">{t("note")}</p>
      </div>
    </section>
  );
}
