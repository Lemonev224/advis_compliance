"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RENEWALS_COOKIE, demoData, type DemoData, type Renewals } from "@/compliance/lib/demo-state";

type Ctx = { data: DemoData; changed: boolean; reset: () => void };

const DemoCtx = createContext<Ctx>({ data: demoData({}), changed: false, reset: () => {} });

/** Gives client pages the sample data with the visitor's changes applied (read from the cookie by the layout). */
export function DemoStateProvider({ renewals, children }: { renewals: Renewals; children: ReactNode }) {
  const router = useRouter();
  const reset = useCallback(() => {
    document.cookie = `${RENEWALS_COOKIE}=; path=/; max-age=0; samesite=lax`;
    router.refresh();
  }, [router]);
  const value = useMemo(() => ({ data: demoData(renewals), changed: Object.keys(renewals).length > 0, reset }), [renewals, reset]);
  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export const useDemo = () => useContext(DemoCtx);
