"use client";

import { createContext, useContext, type ReactNode } from "react";

// The demo always runs as a sample admin of a sample organisation.
export type ShellIdentity = { live: false; name: string; email: string; orgName: string; roleLabel: string; initials: string; orgInitials: string };

const DEMO: ShellIdentity = { live: false, name: "Demo admin", email: "Sample data", orgName: "Grupo Heracles", roleLabel: "Admin", initials: "DA", orgInitials: "GH" };

const Ctx = createContext<ShellIdentity>(DEMO);

export function ShellUserProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={DEMO}>{children}</Ctx.Provider>;
}

export const useShellUser = () => useContext(Ctx);
