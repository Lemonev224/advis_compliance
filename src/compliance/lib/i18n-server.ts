import { cookies, headers } from "next/headers";
import { LANG_COOKIE, langFromHeader, makeT, toLang, type Lang } from "./i18n";

/** The demo's language: its own choice, else the language used on the website, else the browser's. */
export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  return (
    toLang(jar.get(LANG_COOKIE)?.value) ??
    toLang(jar.get("NEXT_LOCALE")?.value) ??
    langFromHeader((await headers()).get("accept-language")) ??
    "en"
  );
}

/** Translate function for server components, server actions and metadata. */
export async function getT() {
  return makeT(await getLang());
}
