// Compliance rules engine — HANDOFF §6 "Core business rules".
// Pure functions, no I/O, so the same logic can run on the server, in a nightly job and in tests.
//
// 1. Required documents = items of every active rule set whose conditions match the worker.
// 2. Status: Blocked if any blocking item is missing or expired; Pending if a permit is awaiting
//    decision (or dates await confirmation); Expiring if any item is inside its reminder window;
//    otherwise Compliant.
// 3. Site access until = earliest expiry among blocking items (contract end and permit end included).
// 5. Dates read automatically are not trusted until a person confirms them.

export type Status = "ok" | "warn" | "bad" | "pending";
export type EmployerScope = "any" | "foreign" | "own";
export type DocCategory = "contracts" | "id" | "permits" | "social" | "prl" | "medical" | "insurance" | "other";

export type RuleItem = {
  documentTypeId: string;
  documentTypeKey: string;
  name: string;
  category: DocCategory;
  remindDays: number | null;
  blocksAccess: boolean;
  skipIfNationality: string | null;
};

export type RuleSet = {
  id: string;
  name: string;
  nationality: string | null; // null = any
  employerScope: EmployerScope;
  active: boolean;
  items: RuleItem[];
};

export type WorkerFacts = {
  nationality: string;
  employerKind: "own" | "subcontractor" | "client";
  employerCountry: string | null;
  orgCountry: string;
};

/** Something that can satisfy a rule item: an uploaded document, a contract or an approved permit. */
export type Evidence = {
  documentTypeId: string;
  expiresOn: string | null; // ISO date, null = does not expire
  confirmed: boolean;
  source: "document" | "contract" | "permit";
  label?: string;
};

export type ItemState = "valid" | "expiring" | "expired" | "missing" | "unconfirmed" | "awaiting_decision";

export type Requirement = {
  item: RuleItem;
  ruleSets: string[];
  evidence: Evidence | null;
  state: ItemState;
  daysLeft: number | null;
};

export type Evaluation = {
  status: Status;
  requirements: Requirement[];
  requiredCount: number;
  validCount: number;
  /** Earliest date access ends (ISO), null when there is no end date or access is already blocked. */
  accessUntil: string | null;
  /** The requirement that sets accessUntil. */
  accessBinding: Requirement | null;
  attention: string;
};

const DAY = 86_400_000;

export function toDay(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return toDay(toIso) - toDay(fromIso);
}

export function formatDate(iso: string | null | undefined, opts: { year?: boolean } = {}): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return opts.year === false ? `${d} ${month}` : `${d} ${month} ${y}`;
}

export function ruleSetMatches(rs: RuleSet, w: WorkerFacts): boolean {
  if (!rs.active) return false;
  if (rs.nationality && rs.nationality !== w.nationality) return false;
  switch (rs.employerScope) {
    case "any":
      return true;
    case "own":
      return w.employerKind === "own";
    case "foreign":
      return w.employerKind !== "own" && (w.employerCountry ?? "") !== w.orgCountry;
  }
}

/** Required items for a worker, merged across rule sets (strictest wins: blocks if any blocks, earliest reminder). */
export function requiredItems(ruleSets: RuleSet[], w: WorkerFacts): { item: RuleItem; ruleSets: string[] }[] {
  const byType = new Map<string, { item: RuleItem; ruleSets: string[] }>();
  for (const rs of ruleSets) {
    if (!ruleSetMatches(rs, w)) continue;
    for (const it of rs.items) {
      if (it.skipIfNationality && it.skipIfNationality === w.nationality) continue;
      const prev = byType.get(it.documentTypeId);
      if (!prev) {
        byType.set(it.documentTypeId, { item: { ...it }, ruleSets: [rs.name] });
      } else {
        prev.ruleSets.push(rs.name);
        prev.item.blocksAccess ||= it.blocksAccess;
        if (it.remindDays !== null) prev.item.remindDays = Math.max(prev.item.remindDays ?? 0, it.remindDays);
      }
    }
  }
  return [...byType.values()];
}

/** Pick the evidence that best satisfies an item: confirmed beats unconfirmed, then the latest expiry. */
function bestEvidence(list: Evidence[]): Evidence | null {
  if (list.length === 0) return null;
  const rank = (e: Evidence) => (e.confirmed ? 1 : 0);
  const exp = (e: Evidence) => (e.expiresOn === null ? Infinity : toDay(e.expiresOn));
  return [...list].sort((a, b) => rank(b) - rank(a) || exp(b) - exp(a))[0];
}

export function evaluate(
  worker: WorkerFacts,
  ruleSets: RuleSet[],
  evidence: Evidence[],
  opts: { today: string; permitAwaitingDecision?: boolean },
): Evaluation {
  const requirements: Requirement[] = requiredItems(ruleSets, worker).map(({ item, ruleSets }) => {
    const ev = bestEvidence(evidence.filter((e) => e.documentTypeId === item.documentTypeId));
    let state: ItemState;
    let daysLeft: number | null = null;
    if (!ev) {
      state = item.category === "permits" && opts.permitAwaitingDecision ? "awaiting_decision" : "missing";
    } else if (!ev.confirmed) {
      state = "unconfirmed";
      daysLeft = ev.expiresOn ? daysBetween(opts.today, ev.expiresOn) : null;
    } else {
      daysLeft = ev.expiresOn ? daysBetween(opts.today, ev.expiresOn) : null;
      if (daysLeft !== null && daysLeft < 0) state = "expired";
      else if (daysLeft !== null && item.remindDays !== null && daysLeft <= item.remindDays) state = "expiring";
      else state = "valid";
    }
    return { item, ruleSets, evidence: ev, state, daysLeft };
  });

  const blocking = requirements.filter((r) => r.item.blocksAccess);
  const hard = blocking.filter((r) => r.state === "missing" || r.state === "expired");
  const waiting = blocking.filter((r) => r.state === "awaiting_decision" || r.state === "unconfirmed");
  const soon = requirements.filter((r) => r.state === "expiring" || (!r.item.blocksAccess && (r.state === "missing" || r.state === "expired")));

  const status: Status = hard.length ? "bad" : waiting.length ? "pending" : soon.length ? "warn" : "ok";

  let accessBinding: Requirement | null = null;
  if (status !== "bad") {
    for (const r of blocking) {
      if (r.state === "unconfirmed" || !r.evidence?.expiresOn) continue;
      if (!accessBinding || toDay(r.evidence.expiresOn) < toDay(accessBinding.evidence!.expiresOn!)) accessBinding = r;
    }
  }

  const validCount = requirements.filter((r) => r.state === "valid" || r.state === "expiring").length;

  return {
    status,
    requirements: sortRequirements(requirements),
    requiredCount: requirements.length,
    validCount,
    accessUntil: status === "bad" ? null : accessBinding?.evidence?.expiresOn ?? null,
    accessBinding,
    attention: describe(status, hard, waiting, soon),
  };
}

const order: Record<ItemState, number> = { expired: 0, missing: 1, awaiting_decision: 2, unconfirmed: 3, expiring: 4, valid: 5 };
function sortRequirements(list: Requirement[]): Requirement[] {
  return [...list].sort((a, b) => order[a.state] - order[b.state] || (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9));
}

function describe(status: Status, hard: Requirement[], waiting: Requirement[], soon: Requirement[]): string {
  const one = (r: Requirement): string => {
    const n = r.item.name;
    const d = r.evidence?.expiresOn ? formatDate(r.evidence.expiresOn, { year: false }) : "";
    switch (r.state) {
      case "expired": return r.item.category === "contracts" ? `${n} ended ${d}` : `${n} expired ${d}`;
      case "missing": return `${n} missing`;
      case "awaiting_decision": return `${n} awaiting Govern decision`;
      case "unconfirmed": return `${n} dates need confirming`;
      case "expiring": return r.item.category === "contracts" ? `${n} ends ${d}` : `${n} expires ${d}`;
      default: return n;
    }
  };
  const list = (rs: Requirement[]) => rs.slice(0, 2).map(one).join("; ") + (rs.length > 2 ? ` (+${rs.length - 2} more)` : "");
  switch (status) {
    case "bad": return `${list(hard)}. Site access blocked.`;
    case "pending": return `${list(waiting)}. Cannot start until resolved.`;
    case "warn": return `${list(soon)}.`;
    default: return "Nothing to do. All documents valid.";
  }
}
