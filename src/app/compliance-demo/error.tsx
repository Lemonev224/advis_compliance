"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useT } from "@/compliance/components/I18nProvider";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useT();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-bad-bg text-bad-fg"><AlertTriangle className="size-6" aria-hidden /></span>
      <h1 className="text-[18px] font-semibold">{t("Something went wrong loading this page")}</h1>
      <p className="text-sm text-ink-muted">
        {t("Try again. If it keeps happening, reload the page.")}
      </p>
      {process.env.NODE_ENV !== "production" && <code className="max-w-full wrap-break-word rounded-sm bg-surface-muted px-2 py-1 text-xs text-ink-soft">{error.message}</code>}
      <button className="btn-primary mt-2" onClick={reset}><RotateCcw className="size-4" aria-hidden />{t("Try again")}</button>
    </div>
  );
}
