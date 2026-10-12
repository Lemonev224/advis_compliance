"use client";

import Link from "next/link";
import { useState } from "react";
import { QrCode, UserPlus, MapPin } from "lucide-react";
import { PageHeader, Segmented, Avatar, StatusText, StatusPill, Progress, cx } from "@/compliance/components/ui";
import { siteBoard, workerHref, TODAY_LABEL } from "@/compliance/lib/data";
import { SoonButton } from "@/compliance/components/Toast";
import { useShellUser } from "@/compliance/components/shell/UserContext";

const order = { bad: 0, pending: 1, warn: 2, ok: 3 };

export default function SiteAccessPage() {
  const { live } = useShellUser();
  const hrefFor = (name: string) => (live ? "/compliance-demo/workers" : workerHref(name));
  const [view, setView] = useState("board");
  const flat = siteBoard.flatMap((s) => s.workers.map((w) => ({ ...w, site: s.name })));

  return (
    <>
      <PageHeader
        section="Sites"
        title="Site access"
        description={<>{TODAY_LABEL} · access is granted only while contract, permit and site documents are all valid</>}
        actions={<>
          <Segmented tone="strong" label="View" active={view} onSelect={setView} items={[{ id: "board", label: "Board" }, { id: "table", label: "Table" }]} />
          <SoonButton feature="access" className="btn-secondary"><QrCode className="size-4" aria-hidden />Print QR passes</SoonButton>
          <Link href="/compliance-demo/workers" className="btn-primary"><UserPlus className="size-4" aria-hidden />Assign workers</Link>
        </>}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2"><span className="num">45</span><span className="text-ink-muted">assigned</span></span>
        <span className="inline-flex items-center gap-2"><StatusText status="ok">39 allowed</StatusText></span>
        <span className="inline-flex items-center gap-2"><StatusText status="warn">4 allowed, expiring soon</StatusText></span>
        <span className="inline-flex items-center gap-2"><StatusText status="bad">3 blocked</StatusText></span>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-3.5">
          {siteBoard.map((s) => {
            const pct = Math.round((s.assigned / s.capacity) * 100);
            const blocked = s.workers.filter((w) => w.status === "bad").length;
            return (
              <section key={s.name} aria-label={s.name} className="flex flex-col gap-2.5 rounded-card bg-[#EBEEF2] p-2.5">
                <div className="px-1.5 pt-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="flex items-center gap-1.5 text-[15px] font-semibold"><MapPin className="size-3.5 text-ink-muted" aria-hidden />{s.name}</h2>
                    <span className="num text-xs">{s.assigned} / {s.capacity}</span>
                  </div>
                  <div className="mb-2 mt-0.5 text-xs text-ink-muted">{s.project}</div>
                  <Progress value={pct} height={6} track="bg-[#D6DCE3]" />
                  {blocked > 0 && <div className="mt-2 text-xs font-medium text-bad-fg">{blocked} blocked today</div>}
                </div>
                {[...s.workers].sort((a, b) => order[a.status] - order[b.status]).map((w, i) => (
                  <article key={w.name + i} className={cx("flex flex-col gap-2 rounded-ctl border bg-surface px-3 py-2.5", w.status === "bad" ? "border-bad-bg" : "border-line")}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={w.name} />
                      <div className="min-w-0 flex-1">
                        <Link href={hrefFor(w.name)} className="font-medium text-ink no-underline hover:text-accent">{w.name}</Link>
                        <div className="text-xs text-ink-muted">{w.role}</div>
                      </div>
                    </div>
                    {w.status === "bad" ? (
                      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-sm bg-bad-bg px-2 py-1.5">
                        <StatusText status="bad">Blocked · {w.detail}</StatusText>
                        <Link href={hrefFor(w.name)} className="text-xs font-medium text-bad-fg hover:text-bad-fg underline">Resolve</Link>
                      </div>
                    ) : (
                      <StatusText status={w.status}>Allowed · {w.detail}</StatusText>
                    )}
                  </article>
                ))}
                <Link href="/compliance-demo/workers" className="inline-flex h-ctl-dense items-center justify-center rounded-ctl border border-dashed border-line-dashed text-sm text-ink-soft no-underline hover:bg-white/60 hover:text-ink">Show all {s.assigned} workers</Link>
              </section>
            );
          })}
        </div>
      ) : (
        <section aria-label="Site access table" className="card overflow-x-auto scroll-thin">
          <table className="tbl tbl-hover min-w-[720px]">
            <thead><tr><th>Worker</th><th>Site</th><th>Access</th><th>Reason</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {flat.map((w, i) => (
                <tr key={i}>
                  <td><div className="flex items-center gap-2.5"><Avatar name={w.name} /><div><div className="font-medium">{w.name}</div><div className="text-xs text-ink-muted">{w.role}</div></div></div></td>
                  <td>{w.site}</td>
                  <td>{w.status === "bad" ? <StatusPill status="bad">Blocked</StatusPill> : <StatusPill status={w.status === "warn" ? "warn" : "ok"}>Allowed</StatusPill>}</td>
                  <td className="text-ink-soft">{w.detail}</td>
                  <td className="text-right">{w.status === "bad" ? <Link href={hrefFor(w.name)} className="btn-primary btn-row">Resolve</Link> : <Link href={hrefFor(w.name)} className="btn-secondary btn-row font-normal">View</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
