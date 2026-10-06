"use client";

import { createContext, Fragment, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { daysUntil, parse } from "./dates";
import { LANG_COOKIE, type Lang } from "./lang";
import { ca } from "./translations/ca";
import { en } from "./translations/en";
import { es } from "./translations/es";

// Translations for the ShiftComply demo app.
// The English text is the key: t("Assign room") looks the text up in the Catalan or Spanish dictionary
// and falls back to English when there is no entry. Use {name} placeholders for values.

export type Vars = Record<string, string | number | null | undefined>;
export type TFunction = (text: string, vars?: Vars) => string;
/** Like t(), but placeholders can be React elements: rich("Type {word} to confirm", { word: <b>delete</b> }). */
export type RichFunction = (text: string, parts: Record<string, ReactNode>) => ReactNode;

// English only lists keys that need context, like "actor:You".
const DICTS: Record<Lang, Record<string, string>> = { en, ca, es };

function fill(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

export function translate(lang: Lang, text: string, vars?: Vars) {
  return fill(DICTS[lang][text] ?? text, vars);
}

function richText(lang: Lang, text: string, parts: Record<string, ReactNode>): ReactNode {
  const pieces = (DICTS[lang][text] ?? text).split(/\{(\w+)\}/);
  // Odd positions are placeholder names.
  return pieces.map((p, i) => <Fragment key={i}>{i % 2 ? (p in parts ? parts[p] : `{${p}}`) : p}</Fragment>);
}

/* ---------- dates ---------- */

const MONTHS_SHORT: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ca: ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
};

const MONTHS_LONG: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

const WEEKDAYS_LONG: Record<Lang, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
};

/** Monday first. */
const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  ca: ["dl", "dt", "dc", "dj", "dv", "ds", "dg"],
  es: ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Catalan "de" before a month: "d'octubre", "de novembre". */
const caDe = (month: string) => (/^[aeiouà]/i.test(month) ? `d'${month}` : `de ${month}`);

function makeDates(lang: Lang, t: TFunction) {
  const monthShort = (i: number) => MONTHS_SHORT[lang][i];
  const monthLong = (i: number) => MONTHS_LONG[lang][i];

  /** "21 Oct 2026" / "21 oct 2026" */
  const fmt = (iso: string | null | undefined, withYear = true) => {
    if (!iso) return "—";
    const d = parse(iso);
    const base = `${d.getDate()} ${monthShort(d.getMonth())}`;
    return withYear ? `${base} ${d.getFullYear()}` : base;
  };

  /** "Tuesday 6 October 2026" / "Dimarts, 6 d'octubre de 2026" / "Martes, 6 de octubre de 2026" */
  const longDate = (d: Date) => {
    const wd = WEEKDAYS_LONG[lang][d.getDay()];
    const m = monthLong(d.getMonth());
    if (lang === "en") return `${wd} ${d.getDate()} ${m} ${d.getFullYear()}`;
    if (lang === "ca") return `${cap(wd)}, ${d.getDate()} ${caDe(m)} de ${d.getFullYear()}`;
    return `${cap(wd)}, ${d.getDate()} de ${m} de ${d.getFullYear()}`;
  };

  /** "October 2026" / "Octubre de 2026" */
  const monthYear = (month: number, year: number) =>
    lang === "en" ? `${monthLong(month)} ${year}` : `${cap(monthLong(month))} de ${year}`;

  /** "Oct 2026" */
  const monthShortYear = (month: number, year: number) => `${cap(monthShort(month))} ${year}`;

  const relative = (iso: string | null | undefined) => {
    const n = daysUntil(iso);
    if (n === null) return t("No end date");
    if (n === 0) return t("Today");
    if (n === 1) return t("Tomorrow");
    if (n === -1) return t("Yesterday");
    if (n > 0) return t("In {n} days", { n });
    return t("{n} days ago", { n: Math.abs(n) });
  };

  /** Activity times stored in English, like "Today, 09:12", "2 Oct, 15:22" or "Just now". */
  const when = (text: string) => {
    if (lang === "en") return text;
    return text
      .replace(/^Just now$/, t("Just now"))
      .replace(/^Today\b/, t("Today"))
      .replace(/^Yesterday\b/, t("Yesterday"))
      .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, (m) => monthShort(MONTHS_SHORT.en.indexOf(m)));
  };

  return {
    fmt,
    longDate,
    monthYear,
    monthShortYear,
    monthShort: (i: number) => cap(monthShort(i)),
    weekdaysShort: WEEKDAYS_SHORT[lang],
    relative,
    when,
  };
}

/* ---------- provider ---------- */

export type I18n = {
  lang: Lang;
  t: TFunction;
  rich: RichFunction;
  /** Translates the values of an activity entry: dates are formatted, "~Text" is translated and lower-cased. */
  tv: (vars?: Vars) => Vars | undefined;
  setLang: (lang: Lang) => void;
} & ReturnType<typeof makeDates>;

const I18nCtx = createContext<I18n | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter();
  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18n>(() => {
    const t: TFunction = (text, vars) => translate(lang, text, vars);
    const dates = makeDates(lang, t);
    const tv = (vars?: Vars) => {
      if (!vars) return vars;
      const out: Vars = {};
      for (const [k, v] of Object.entries(vars)) {
        if (typeof v !== "string") out[k] = v;
        else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) out[k] = dates.fmt(v, false);
        else if (v.startsWith("~")) out[k] = t(v.slice(1)).toLowerCase();
        else out[k] = t(v);
      }
      return out;
    };
    const rich: RichFunction = (text, parts) => richText(lang, text, parts);
    return { lang, t, rich, tv, setLang, ...dates };
  }, [lang, setLang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside LangProvider");
  return ctx;
}
