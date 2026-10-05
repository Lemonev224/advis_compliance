"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BedDouble, Building2, Check, FileCheck2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button, cx, Field, inputClass } from "./ui";
import { useStore } from "@/shiftcomply/lib/store";
import { TODAY } from "@/shiftcomply/lib/dates";
import { BrandLogo } from "./brand";

const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL;
const DPA_URL = process.env.NEXT_PUBLIC_DPA_URL;

function suggestedSeason() {
  const y = TODAY.getFullYear();
  const m = TODAY.getMonth(); // 0 = January
  if (m >= 6) return { label: `Winter ${y}/${String(y + 1).slice(2)}`, start: `${y}-12-01`, end: `${y + 1}-04-15` };
  if (m <= 1) return { label: `Winter ${y - 1}/${String(y).slice(2)}`, start: `${y - 1}-12-01`, end: `${y}-04-15` };
  return { label: `Summer ${y}`, start: `${y}-06-01`, end: `${y}-09-30` };
}

function DocLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <span className="font-medium text-ink">{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
      {children}
    </a>
  );
}

const STEPS = ["Welcome", "Your hotel", "Agreements"] as const;

/** First-run setup: choose real hotel or demo, enter hotel and season details, accept the agreements. */
export function OnboardingWizard() {
  const { userEmail, signOut, createHotel, createDemoHotel, myHotels } = useStore();
  const router = useRouter();
  const season = suggestedSeason();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    seasonLabel: season.label,
    seasonStart: season.start,
    seasonEnd: season.end,
    reminderEmail: userEmail,
  });
  const [agreed, setAgreed] = useState({ terms: false, dpa: false, authority: false });
  const allAgreed = agreed.terms && agreed.dpa && agreed.authority;
  const hasDemo = myHotels.some((h) => h.isDemo);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between bg-navy px-6 text-white">
        <BrandLogo />
        <div className="flex items-center gap-4 text-[13px] text-[#c3cfe2]">
          {myHotels.length > 0 && (
            <Link href="/shiftcomply-demo" className="hover:text-white">
              Back to the app
            </Link>
          )}
          <span className="hidden sm:inline">{userEmail}</span>
          <button onClick={signOut} className="hover:text-white">
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[720px] px-4 py-10">
        <ol className="mb-6 flex items-center gap-2 text-[13px]">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold",
                  i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-line text-muted",
                )}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </span>
              <span className={i === step ? "font-medium text-ink" : "text-muted"}>{label}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line-strong" />}
            </li>
          ))}
        </ol>

        <div className="rounded border border-line bg-surface">
          {step === 0 && (
            <div className="p-7">
              <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Welcome to ShiftComply</h1>
              <p className="mt-2 max-w-lg text-[14px] text-muted">
                Keep seasonal contracts, staff rooms and work documents in one place, and get warned before anything
                expires. Setting up takes about ten minutes.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { icon: Building2, title: "Your hotel and season", text: "Name, location and season dates" },
                  { icon: BedDouble, title: "Staff rooms", text: "Add a whole building in one go" },
                  { icon: Users, title: "Employees", text: "Import a spreadsheet or add people one by one" },
                  { icon: FileCheck2, title: "Your team", text: "Invite managers and your gestoria" },
                ].map((it) => (
                  <li key={it.title} className="flex gap-3 rounded border border-line p-4">
                    <it.icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      <span className="block text-[14px] font-medium">{it.title}</span>
                      <span className="block text-[13px] text-muted">{it.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => setStep(1)}>
                  Set up my hotel
                </Button>
                <Button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const ok = await createDemoHotel();
                    setBusy(false);
                    if (ok) router.push("/shiftcomply-demo");
                  }}
                >
                  <Sparkles size={15} />
                  {hasDemo ? "Open the demo hotel" : busy ? "Preparing demo" : "Explore a demo hotel first"}
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-muted">
                Joining a hotel that already uses ShiftComply? Ask an administrator there to invite {userEmail}, then sign in
                again.
              </p>
            </div>
          )}

          {step === 1 && (
            <form
              className="p-7"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
            >
              <h1 className="text-[20px] font-semibold">Your hotel</h1>
              <p className="mt-1 text-[14px] text-muted">You can change any of this later in Settings.</p>
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Hotel name">
                    <input required autoFocus className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. Park Hotel Andorra" />
                  </Field>
                  <Field label="Location">
                    <input className={inputClass} value={form.location} onChange={set("location")} placeholder="e.g. Andorra la Vella" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Season">
                    <input className={inputClass} value={form.seasonLabel} onChange={set("seasonLabel")} />
                  </Field>
                  <Field label="Starts">
                    <input type="date" className={inputClass} value={form.seasonStart} onChange={set("seasonStart")} />
                  </Field>
                  <Field label="Ends">
                    <input type="date" className={inputClass} value={form.seasonEnd} onChange={set("seasonEnd")} />
                  </Field>
                </div>
                <Field label="Send reminders to" hint="Contract, checkout and document reminders go to this address.">
                  <input type="email" className={inputClass} value={form.reminderEmail} onChange={set("reminderEmail")} />
                </Field>
              </div>
              <div className="mt-7 flex justify-between">
                <Button type="button" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={form.name.trim().length < 2 || (!!form.seasonStart && !!form.seasonEnd && form.seasonEnd < form.seasonStart)}
                >
                  Continue
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="p-7">
              <h1 className="text-[20px] font-semibold">Agreements</h1>
              <p className="mt-1 text-[14px] text-muted">
                {form.name} decides what employee data is kept and why. ShiftComply stores and processes it for you, under
                the data processing agreement.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  { key: "terms" as const, text: <>I accept the <DocLink href={TERMS_URL}>Terms of Service</DocLink>.</> },
                  {
                    key: "dpa" as const,
                    text: (
                      <>
                        I accept the <DocLink href={DPA_URL}>Data Processing Agreement</DocLink> on behalf of {form.name}.
                      </>
                    ),
                  },
                  {
                    key: "authority" as const,
                    text: <>I am authorised to set this up for {form.name}, and the hotel will tell its employees how their data is used.</>,
                  },
                ].map((a) => (
                  <label key={a.key} className="flex cursor-pointer items-start gap-3 rounded border border-line p-3.5 text-[14px] hover:bg-sunken">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                      checked={agreed[a.key]}
                      onChange={(e) => setAgreed({ ...agreed, [a.key]: e.target.checked })}
                    />
                    <span>{a.text}</span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex gap-3 rounded bg-primary-soft px-4 py-3 text-[13px] text-primary-hover">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <span>
                  Only people you invite can see your hotel&apos;s data. Documents are stored privately and open through
                  links that expire after five minutes, and every time a document is opened it is recorded.
                </span>
              </div>
              <div className="mt-7 flex justify-between">
                <Button onClick={() => setStep(1)}>Back</Button>
                <Button
                  variant="primary"
                  disabled={!allAgreed || busy}
                  onClick={async () => {
                    setBusy(true);
                    const ok = await createHotel({
                      ...form,
                      name: form.name.trim(),
                      location: form.location.trim(),
                      seasonStart: form.seasonStart || null,
                      seasonEnd: form.seasonEnd || null,
                    });
                    setBusy(false);
                    if (ok) router.push("/shiftcomply-demo/setup");
                  }}
                >
                  {busy ? "Creating your hotel" : "Create hotel"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
