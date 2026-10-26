"use client";

import { Printer } from "lucide-react";
import { useT } from "@/compliance/components/I18nProvider";

/** Opens the browser's print dialog; "Save as PDF" there gives a clean PDF (navigation is hidden when printing). */
export function PrintButton() {
  const { t } = useT();
  return (
    <button type="button" className="btn-secondary" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden />{t("Print or save as PDF")}
    </button>
  );
}
