// Translations for the Advisorly compliance demo (/compliance-demo). Safe to import from server and client code.
// The English text is the key: t("Add worker") looks the text up in the Spanish dictionary and falls back to
// English when there is no entry. Use {name} placeholders for values: t("Exported {n} rows", { n: 3 }).
// Server components use getT() from ./i18n-server, client components use useT() from components/I18nProvider.

import { es } from "./translations/es";

export type Lang = "en" | "es";

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
];

/** Cookie that remembers the demo's language. The website's NEXT_LOCALE cookie and the browser language are fallbacks. */
export const LANG_COOKIE = "adv_lang";

export type Vars = Record<string, string | number | null | undefined>;
export type TFunction = (text: string, vars?: Vars) => string;

const DICTS: Record<Lang, Record<string, string>> = { en: {}, es };

export function toLang(value: string | null | undefined): Lang | null {
  const v = (value ?? "").trim().toLowerCase().slice(0, 2);
  return v === "en" || v === "es" ? v : null;
}

/** Picks a language from the Accept-Language header, e.g. "ca-ES,ca;q=0.9,es;q=0.8" gives "es". */
export function langFromHeader(header: string | null | undefined): Lang | null {
  for (const part of (header ?? "").split(",")) {
    const l = toLang(part.split(";")[0]);
    if (l) return l;
  }
  return null;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_ES = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

/**
 * Text with no dictionary entry is usually a date or time from the sample data ("31 Mar 2027", "Today, 09:42",
 * "Mon, 08:00"). Those are translated word by word; names of people, companies and places pass through unchanged.
 */
function localizeDates(text: string) {
  return text
    .replace(/^Today\b/, "Hoy")
    .replace(/^Yesterday\b/, "Ayer")
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTHS_ES[MONTHS_EN.indexOf(m)])
    .replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g, (m) => DAYS_ES[DAYS_EN.indexOf(m)]);
}

function fill(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

export function translate(lang: Lang, text: string, vars?: Vars): string {
  if (!text) return text;
  const base = lang === "en" ? text : DICTS[lang][text] ?? localizeDates(text);
  // Dates are moved to "now" before values are filled in, so a value that was translated already isn't moved twice.
  return fill(shiftDates(lang, base), vars);
}

/* ---------- Demo dates ----------
 * The sample data was written as if today were Thursday 8 October 2026. Every date shown in the demo is moved
 * by the same number of days so "today" is always the real date (Spain time) and "expires in 4 days",
 * "5 days overdue" and the dates themselves stay consistent with each other.
 */

const DAY = 86_400_000;
const SAMPLE_TODAY = Date.UTC(2026, 9, 8);
const MADRID = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });

/** Today's date in Spain, as a UTC midnight timestamp. */
function todayStamp() {
  const [y, m, d] = MADRID.format(new Date()).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Days between the date the sample data was written for and today. */
export const demoOffsetDays = () => Math.round((todayStamp() - SAMPLE_TODAY) / DAY);

/** A date from the sample data (written for 8 Oct 2026) moved to the same distance from today. */
export function demoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) + demoOffsetDays() * DAY);
}

/** Today in the demo (UTC midnight). */
export const demoToday = () => new Date(todayStamp());

const SHORT_DATE: Record<Lang, RegExp> = {
  en: /\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b(?: (\d{4})\b)?/g,
  es: /\b(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sept|oct|nov|dic)\b(?: (\d{4})\b)?/g,
};
const SHORT_MONTHS: Record<Lang, string[]> = { en: MONTHS_EN, es: MONTHS_ES };

/** Moves every "12 Oct" / "12 Oct 2026" (or "12 oct 2026") in a text by the demo offset. */
function shiftDates(lang: Lang, text: string) {
  const offset = demoOffsetDays();
  if (!offset || !/\d/.test(text)) return text;
  const months = SHORT_MONTHS[lang];
  return text.replace(SHORT_DATE[lang], (_m, d: string, mon: string, y?: string) => {
    // Without a year the year doesn't matter: only the day and month are shown.
    const date = new Date(Date.UTC(y ? Number(y) : 2026, months.indexOf(mon), Number(d)) + offset * DAY);
    const out = `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
    return y ? `${out} ${date.getUTCFullYear()}` : out;
  });
}

const MONTHS_LONG: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};
const WEEKDAYS_LONG: Record<Lang, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
};
/** Monday first. */
export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  en: DAYS_EN,
  es: DAYS_ES,
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Tuesday 20 October 2026" / "Martes, 20 de octubre de 2026" */
export function longDate(lang: Lang, d: Date) {
  const wd = WEEKDAYS_LONG[lang][d.getUTCDay()];
  const m = MONTHS_LONG[lang][d.getUTCMonth()];
  return lang === "en" ? `${wd} ${d.getUTCDate()} ${m} ${d.getUTCFullYear()}` : `${cap(wd)}, ${d.getUTCDate()} de ${m} de ${d.getUTCFullYear()}`;
}

/** "20 October 2026" / "20 de octubre de 2026" */
export function dayMonthYear(lang: Lang, d: Date) {
  const m = MONTHS_LONG[lang][d.getUTCMonth()];
  return lang === "en" ? `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}` : `${d.getUTCDate()} de ${m} de ${d.getUTCFullYear()}`;
}

/** "20 October" / "20 de octubre" */
export function dayMonth(lang: Lang, d: Date) {
  const m = MONTHS_LONG[lang][d.getUTCMonth()];
  return lang === "en" ? `${d.getUTCDate()} ${m}` : `${d.getUTCDate()} de ${m}`;
}

/** "20 Oct" / "20 oct" */
export function dayShort(lang: Lang, d: Date) {
  return `${d.getUTCDate()} ${SHORT_MONTHS[lang][d.getUTCMonth()]}`;
}

/** "October 2026" / "Octubre de 2026" */
export function monthYear(lang: Lang, year: number, month: number) {
  const m = MONTHS_LONG[lang][month];
  return lang === "en" ? `${m} ${year}` : `${cap(m)} de ${year}`;
}

export function makeT(lang: Lang): TFunction {
  return (text, vars) => translate(lang, text, vars);
}

/** True when a Spanish entry exists. Used by the coverage check script. */
export function hasTranslation(lang: Lang, text: string) {
  return lang === "en" || text in DICTS[lang];
}
