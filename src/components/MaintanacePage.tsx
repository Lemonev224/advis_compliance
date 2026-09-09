import { GeistSans } from "geist/font/sans";

export default function MaintenancePage() {
  return (
    <main
      className={`${GeistSans.className} relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6`}
    >
      {/* Ambient background accents, echoing the dashboard glow from the live site */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-blue-100 opacity-60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full bg-cyan-100 opacity-50 blur-3xl"
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        {/* Logo mark */}
        <div className="mb-10 flex flex-col items-center gap-2">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 2 L30 9.5 V24.5 L17 32 L4 24.5 V9.5 Z"
              stroke="url(#grad)"
              strokeWidth="2"
            />
            <path
              d="M17 9 L24 13 V21 L17 25 L10 21 V13 Z"
              stroke="url(#grad)"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="grad" x1="4" y1="2" x2="30" y2="32">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0B1120]">
            Advisorly
          </span>
        </div>

        {/* Status pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          <span className="text-xs font-medium text-blue-700">
            Scheduled maintenance in progress
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#0B1120] sm:text-6xl">
          We&apos;re
          <br />
          <span className="relative inline-block">
            redesigning
            <svg
              aria-hidden
              className="absolute -bottom-2 left-0 w-full"
              height="10"
              viewBox="0 0 220 10"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8C60 2 160 2 218 8"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          the site.
        </h1>

        <p className="mt-6 max-w-md text-lg text-slate-500">
          Advisorly is offline for a short while as we rebuild the experience.
          We&apos;ll be back shortly, better than before.
        </p>

        <a
          href="mailto:hello@advisorly.com"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[#0B1120] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#182238]"
        >
          Get in touch
          <span aria-hidden>→</span>
        </a>

        <p className="mt-16 text-xs uppercase tracking-[0.15em] text-slate-400">
          &copy; {new Date().getFullYear()} Advisorly. All rights reserved.
        </p>
      </div>
    </main>
  );
}