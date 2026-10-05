import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DemoAccess } from "@/components/shiftcomply/DemoAccess";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shiftcomply.demo" });
  return { title: t("metaTitle"), robots: { index: false, follow: true } };
}

export default function ShiftComplyDemoAccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <DemoAccess />
      <Footer />
    </main>
  );
}
