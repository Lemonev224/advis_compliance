"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Users, FileText, Folder } from "lucide-react";
import { PageHeader, cx } from "@/compliance/components/ui";
import { useT } from "@/compliance/components/I18nProvider";

// One Workforce area: people, the contracts they work under, and the documents filed against them.
const TABS = [
  { key: "people", href: "/compliance-demo/workers", label: "People", icon: Users, desc: "Everyone working on your sites, across your company and subcontractors" },
  { key: "contracts", href: "/compliance-demo/workers/contracts", label: "Contracts", icon: FileText, desc: "Employment contracts and the subcontracts they sit under. An ended contract revokes site access." },
  { key: "documents", href: "/compliance-demo/workers/documents", label: "Documents", icon: Folder, desc: "Every certificate, permit and form, filed per worker with its expiry date" },
] as const;

type Counts = Partial<Record<(typeof TABS)[number]["key"], number>>;

export function WorkforceHeader({ actions, counts, description }: { actions?: ReactNode; counts?: Counts; description?: string }) {
  const pathname = usePathname();
  const { t } = useT();
  const active = TABS.find((t) => t.href === pathname) ?? TABS[0];
  return (
    <>
      <PageHeader section={t("Workforce")} title={t("Workers")} description={description ?? t(active.desc)} actions={actions} />
      <nav aria-label={t("Workforce sections")} className="flex gap-1 overflow-x-auto border-b border-[#DDE2E8] scroll-thin">
        {TABS.map((tab) => {
          const on = tab === active;
          const n = counts?.[tab.key];
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={on ? "page" : undefined}
              className={cx(
                "-mb-px inline-flex h-ctl items-center gap-2 whitespace-nowrap border-b-2 px-3.5 no-underline transition-colors",
                on ? "border-accent font-semibold text-ink hover:text-ink" : "border-transparent text-ink-soft hover:text-ink",
              )}
            >
              <tab.icon className={cx("size-4", on ? "text-accent" : "text-ink-muted")} aria-hidden />
              {t(tab.label)}
              {n !== undefined && <span className="num text-xs font-normal text-ink-muted">{n}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
