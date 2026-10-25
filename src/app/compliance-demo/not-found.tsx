import { SearchX } from "lucide-react";
import { ComingSoon } from "@/compliance/components/ui";
import { getT } from "@/compliance/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return <ComingSoon icon={SearchX} title={t("Page not found")} text={t("That page doesn’t exist in the demo.")} href="/compliance-demo" cta={t("Back to dashboard")} />;
}
