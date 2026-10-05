import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.advisorly.tech";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/shiftcomply-demo"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}