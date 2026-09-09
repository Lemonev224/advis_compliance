import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.advisorly.tech";
  const paths = ["", "/terms", "/privacy"];

  // helper: default locale gets no prefix under "as-needed"
  const localeUrl = (locale: string, path: string) =>
    locale === routing.defaultLocale
      ? `${baseUrl}${path}`
      : `${baseUrl}/${locale}${path}`;

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: path === "" ? "monthly" : "yearly",
      priority: path === "" ? 1 : 0.3,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, localeUrl(l, path)])
        ),
      },
    })) as MetadataRoute.Sitemap
  );
}