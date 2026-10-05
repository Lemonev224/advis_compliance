"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Card, cx, Progress } from "./ui";
import { useStore } from "@/shiftcomply/lib/store";

const key = (hotelId: string) => `shiftcomply.setupDismissed.${hotelId}`;

/** Shows the remaining setup steps on the dashboard until they are all done (or hidden). */
export function SetupChecklist() {
  const { hotel, rooms, employees, documents, members, invites, myRole, acceptTerms } = useStore();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!hotel) return;
    let v = false;
    try {
      v = window.localStorage.getItem(key(hotel.id)) === "1";
    } catch {}
    // Read once per hotel from this browser's storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(v);
  }, [hotel]);

  if (!hotel || hotel.isDemo) return null;

  const items = [
    { done: !!hotel.seasonLabel, title: "Hotel and season details", href: "/shiftcomply-demo/settings", action: "Add season" },
    {
      done: !!hotel.termsAcceptedAt,
      title: "Accept the terms and data processing agreement",
      href: null,
      action: myRole === "admin" ? "Review and accept" : "Ask an administrator",
    },
    { done: rooms.length > 0, title: "Add your staff rooms", href: "/shiftcomply-demo/setup?step=rooms", action: "Add rooms" },
    { done: employees.length > 0, title: "Add your employees", href: "/shiftcomply-demo/setup?step=staff", action: "Import or add" },
    {
      done: documents.some((d) => d.filePath),
      title: "Upload a first document",
      href: "/shiftcomply-demo/staff?filter=documents",
      action: "See what is missing",
    },
    { done: members.length > 1 || invites.length > 0, title: "Invite your team", href: "/shiftcomply-demo/setup?step=team", action: "Invite" },
  ];
  const completed = items.filter((i) => i.done).length;
  if (completed === items.length || hidden) return null;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 border-b border-line px-[18px] py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-semibold">Finish setting up {hotel.name}</span>
            <span className="text-[13px] text-muted tabular">
              {completed} of {items.length} done
            </span>
          </div>
          <div className="mt-2 max-w-md">
            <Progress value={completed} max={items.length} color="var(--color-success-bar)" />
          </div>
        </div>
        <button
          onClick={() => {
            try {
              window.localStorage.setItem(key(hotel.id), "1");
            } catch {}
            setHidden(true);
          }}
          className="rounded p-1 text-muted hover:bg-sunken"
          aria-label="Hide setup checklist"
          title="Hide"
        >
          <X size={16} />
        </button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="flex items-center gap-3 border-b border-[#eef1f5] px-[18px] py-3 text-[13.5px]">
            <span
              className={cx(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                it.done ? "border-success bg-success text-white" : "border-line-strong",
              )}
            >
              {it.done && <Check size={12} />}
            </span>
            <span className={cx("min-w-0 flex-1", it.done && "text-muted line-through")}>{it.title}</span>
            {!it.done &&
              (it.href ? (
                <Link href={it.href} className="shrink-0 text-[13px] text-primary hover:underline">
                  {it.action}
                </Link>
              ) : myRole === "admin" ? (
                <AcceptTerms onAccept={acceptTerms} label={it.action} />
              ) : (
                <span className="shrink-0 text-[13px] text-muted">{it.action}</span>
              ))}
          </li>
        ))}
      </ul>
    </Card>
  );
}

const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL;
const DPA_URL = process.env.NEXT_PUBLIC_DPA_URL;

function AcceptTerms({ onAccept, label }: { onAccept: () => Promise<boolean>; label: string }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="shrink-0 text-[13px] text-primary hover:underline">
        {label}
      </button>
    );
  return (
    <span className="flex shrink-0 items-center gap-2 text-[12.5px]">
      <label className="flex items-center gap-1.5">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="accent-[var(--color-primary)]" />
        I accept the{" "}
        {TERMS_URL ? (
          <a href={TERMS_URL} target="_blank" rel="noreferrer" className="text-primary underline">
            terms
          </a>
        ) : (
          "terms"
        )}{" "}
        and{" "}
        {DPA_URL ? (
          <a href={DPA_URL} target="_blank" rel="noreferrer" className="text-primary underline">
            DPA
          </a>
        ) : (
          "DPA"
        )}
      </label>
      <button disabled={!checked} onClick={onAccept} className="font-medium text-primary disabled:opacity-40">
        Confirm
      </button>
    </span>
  );
}
