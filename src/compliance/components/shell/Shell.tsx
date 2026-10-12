"use client";

import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar, leaveDemo } from "./Topbar";
import { ToastProvider } from "@/compliance/components/Toast";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-info-line bg-info-bg px-4 py-2 text-sm text-info-fg sm:px-7">
          <FlaskConical className="size-4 flex-none" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="sm:hidden">Demo with sample data. Nothing is saved.</span>
            <span className="hidden sm:inline">You’re trying Advisorly with a sample construction group. Explore freely: nothing you do here is saved.</span>
          </span>
          <span className="flex items-center gap-3">
            <a href="/#contact" className="font-medium text-info-fg underline">Book a walkthrough</a>
            <button onClick={leaveDemo} className="font-medium text-info-fg underline">Leave demo</button>
          </span>
        </div>
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 pt-6 pb-10 sm:px-7">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}
