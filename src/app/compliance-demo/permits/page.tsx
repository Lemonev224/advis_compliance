import { getT } from "@/compliance/lib/i18n-server";
import { PermitsView } from "@/compliance/components/workforce/PermitsView";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Permits & immigration") };
}

// ?open=<permit id> opens that permit straight away (used by the dashboard and worker profiles).
export default async function PermitsPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { open } = await searchParams;
  return <PermitsView initialOpen={open ?? null} />;
}
