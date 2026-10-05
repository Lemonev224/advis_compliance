import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ShiftComplyLanding } from "@/components/shiftcomply/ShiftComplyLanding";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shiftcomply" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: { title: t("metaTitle"), description: t("metaDescription") },
  };
}

export default function ShiftComplyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <ShiftComplyLanding />
      <Footer />
    </main>
  );
}
