"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, IdCard, FileBadge, PartyPopper } from "lucide-react";
import { Avatar, Segmented, cx } from "@/compliance/components/ui";
import type { QueueItem } from "@/compliance/lib/db/views";

const kindIcon = { Contract: FileText, Document: FileBadge, Permit: IdCard };

export function ActionQueue({ items, limit, showFooter = true }: { items: QueueItem[]; limit?: number; showFooter?: boolean }) {
  const [filter, setFilter] = useState("all");
  const filtered = items.filter((q) => filter === "all" || q.severity === filter);
  const shown = limit ? filtered.slice(0, limit) : filtered;
  const overdue = items.filter((q) => q.severity === "overdue").length;

  return (
    <section id="queue" aria-labelledby="queue-title" className="card min-w-0 flex flex-col">
      <div className="card-head">
        <div>
          <h2 id="queue-title" className="card-title">Action queue</h2>
          <div className="card-sub">Sorted by urgency · {filtered.length} item{filtered.length === 1 ? "" : "s"}</div>
        </div>
        <Segmented
          label="Filter actions"
          active={filter}
          onSelect={setFilter}
          items={[{ id: "all", label: `All · ${items.length}` }, { id: "overdue", label: `Overdue & blocked · ${overdue}` }, { id: "soon", label: `Due soon · ${items.length - overdue}` }]}
        />
      </div>
      <ul className="flex-1">
        {shown.map((q) => {
          const Icon = kindIcon[q.kind];
          return (
            <li key={q.id} className="group flex flex-wrap items-center gap-3 border-b border-line-row px-[18px] py-3 last:border-b-0 hover:bg-surface-subtle">
              <Avatar name={q.worker} size={28} />
              <div className="min-w-0 flex-1 basis-[220px]">
                <div className="truncate font-medium">
                  {q.workerId ? <Link href={`/compliance-demo/workers/${q.workerId}`} className="text-ink no-underline hover:text-accent">{q.worker}</Link> : q.worker}
                  <span className="font-normal text-ink-muted"> · </span>{q.issue}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon className="size-3" aria-hidden />{q.kind} · {q.site} · {q.company}
                </div>
              </div>
              <span className={cx("whitespace-nowrap rounded-sm px-1.5 py-0.5 text-xs font-medium", q.severity === "overdue" ? "bg-bad-bg text-bad-fg" : "bg-warn-bg text-warn-fg")}>{q.when}</span>
              <Link href={q.href} className="btn-secondary h-[34px] px-3 text-sm">{q.action}</Link>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-[18px] py-12 text-center text-ink-muted">
            <PartyPopper className="size-6 text-ok-fg" aria-hidden />
            {items.length === 0 ? "Nothing to do. Every worker is compliant." : "Nothing in this filter."}
          </li>
        )}
      </ul>
      {showFooter && limit && filtered.length > limit && (
        <div className="border-t border-line-row px-[18px] py-3">
          <Link href="/compliance-demo/inbox" className="text-sm font-medium">View all {filtered.length} actions →</Link>
        </div>
      )}
    </section>
  );
}
