 "use client";
 
 {/*"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("hero");
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    // pt-[72px] clears the fixed white nav (see Navigation.tsx height)
    <section id="top" className="relative overflow-hidden pt-[72px] bg-navy">
      <div className="relative min-h-[560px] lg:min-h-[640px] flex items-center">
        {/* Full-bleed background image. Point this at a real photo — a
            city skyline (Coupa's look), a compliance-dashboard screenshot,
            or an Andorra/regulatory shot — dropped into /public. Until you
            add one, the section just shows solid navy (bg-navy on the
            <section> above) instead of breaking to white. 
        <img
          src="/andorra3.jpg"
          alt=""
          aria-hidden
          ref={(img) => {
            if (img && img.complete) {
              setImgLoaded(true);
            }
          }}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => (e.currentTarget.style.display = "none")}
          className={`absolute inset-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-500 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

         Navy panel dissolving into the photo — solid under the text,
            fading to transparent toward the right, Coupa-style. Hardcoded
            hex values so this never depends on a CSS variable resolving. 
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #071b3a 0%, #071b3a 38%, rgba(7,27,58,0.85) 55%, rgba(7,27,58,0.25) 78%, rgba(7,27,58,0) 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1320px] px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-[620px]">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="text-balance text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.08] font-semibold tracking-[-0.02em] text-white"
            >
              {t("headlinePart1")} {t("headlineHighlight")} {t("headlinePart2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mt-6 text-[17px] leading-[1.6] text-white/75 max-w-[480px]"
            >
              {t("subtext")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-9 flex flex-wrap items-center gap-6"
            >
              Solid pill CTA — Coupa: "Learn More" 
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-cyan px-7 py-3.5 text-[15px] font-semibold text-navy transition-colors hover:bg-cyan/85 active:scale-[0.98]"
              >
                {t("ctaPrimary")}
              </a>

               Ghost play-button CTA — Coupa: "Watch Now" 
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-3 text-[15px] font-semibold text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-white/25">
                  <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" strokeWidth={0} />
                </span>

              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
*/}



import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("hero");

  return (
    // pt-[72px] clears the fixed white nav (see Navigation.tsx height)
    <section id="top" className="relative overflow-hidden pt-[72px] bg-navy">
      {/* ambient glow, same treatment as your old HeroVisual */}
      <div
        aria-hidden
        className="absolute -z-10 top-[-160px] right-[-120px] h-[520px] w-[520px] rounded-full opacity-30 blur-[110px]"
        style={{ background: "radial-gradient(circle, #18c6d1, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -z-10 bottom-[-160px] left-[-160px] h-[420px] w-[420px] rounded-full opacity-20 blur-[110px]"
        style={{ background: "radial-gradient(circle, #2451b8, transparent 70%)" }}
      />
      {/* faint technical grid like the rest of the site */}
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-[0.06]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-16 lg:gap-10 items-center">
          {/* Left column — copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="text-balance text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.08] font-semibold tracking-[-0.02em] text-white"
            >
              {t("headlinePart1")} {t("headlineHighlight")} {t("headlinePart2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mt-6 text-[17px] leading-[1.6] text-white/70 max-w-[460px]"
            >
              {t("subtext")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-9 flex flex-wrap items-center gap-6"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-cyan px-7 py-3.5 text-[15px] font-semibold text-navy transition-colors hover:bg-cyan/85 active:scale-[0.98]"
              >
                {t("ctaPrimary")}
              </a>

              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-3 text-[15px] font-semibold text-white"
              >


              </a>
            </motion.div>
          </div>

          {/* Right column — dashboard screenshot in a laptop frame */}
          <LaptopMockup />
        </div>
      </div>
    </section>
  );
}

function LaptopMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease }}
      className="relative mx-auto w-full max-w-[600px]"
      style={{ perspective: "1400px" }}
    >
      {/* glow behind the laptop */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[40px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(24,198,209,0.22), rgba(36,81,184,0.14), transparent)",
        }}
      />

      <div
        className="relative"
        style={{ transform: "rotateX(6deg) rotateY(-10deg)", transformStyle: "preserve-3d" }}
      >
        {/* screen / bezel */}
        <div className="rounded-t-xl rounded-b-md border-[10px] border-[#0c1e3f] bg-[#0c1e3f] shadow-[0_40px_80px_-24px_rgba(2,10,26,0.6)]">
          {/* browser chrome */}
          <div className="flex items-center gap-1.5 bg-[#0c1e3f] px-3 py-2.5 rounded-t-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1 text-[11px] text-white/50">
              advisorly.tech/dashboard
            </div>
          </div>

          {/* screenshot — naturally scaled to fit the image aspect ratio */}
          <div className="relative w-full overflow-hidden bg-white">
            <img
              src="/dash_hero.png"
              alt="Advisorly compliance dashboard showing active contracts, expiring documents and alerts"
              className="block h-auto w-full"
            />

          </div>
        </div>

        <div className="mx-auto h-1 w-[70%] rounded-b-md bg-[#0c1e3f]/80" />
      </div>
    </motion.div>
  );
}