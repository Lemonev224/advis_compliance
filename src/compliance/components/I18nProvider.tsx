"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, makeT, type Lang, type TFunction } from "@/compliance/lib/i18n";

type I18n = { lang: Lang; t: TFunction; setLang: (lang: Lang) => void };

const Ctx = createContext<I18n>({ lang: "en", t: makeT("en"), setLang: () => {} });

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter();
  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      document.documentElement.lang = next;
      // Server components (dashboard, page titles, form messages) render again in the new language.
      router.refresh();
    },
    [router],
  );
  const value = useMemo(() => ({ lang, t: makeT(lang), setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Translate function and language for client components inside the demo. */
export const useT = () => useContext(Ctx);
