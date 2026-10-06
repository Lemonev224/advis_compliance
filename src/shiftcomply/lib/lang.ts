// Languages for the ShiftComply demo app. Safe to import from server and client code.

export type Lang = "en" | "ca" | "es";

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "ca", label: "CA", name: "Català" },
  { code: "es", label: "ES", name: "Español" },
];

/** Cookie that remembers the demo app's language. The website's own NEXT_LOCALE cookie is used as a fallback. */
export const LANG_COOKIE = "sc_lang";

export function toLang(value: string | null | undefined): Lang | null {
  const v = (value ?? "").trim().toLowerCase().slice(0, 2);
  return v === "en" || v === "ca" || v === "es" ? v : null;
}

/** Picks a language from the Accept-Language header, e.g. "ca-ES,ca;q=0.9,es;q=0.8". */
export function langFromHeader(header: string | null | undefined): Lang | null {
  for (const part of (header ?? "").split(",")) {
    const l = toLang(part.split(";")[0]);
    if (l) return l;
  }
  return null;
}

/** The public ShiftComply page in the given language (English has no prefix on the website). */
export function sitePath(lang: Lang, path: string) {
  return lang === "en" ? path : `/${lang}${path}`;
}
