import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ComplianceDemoAccess } from "@/components/compliance/ComplianceDemoAccess";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "complianceDemo" });
  return { title: t("metaTitle"), description: t("text"), robots: { index: false, follow: true } };
}

export default function ComplianceDemoAccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <ComplianceDemoAccess />
      <Footer />
    </main>
  );
}
