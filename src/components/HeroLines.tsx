"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/* Animated vector line-field background for the hero.
   Each ribbon is a family of strands interpolated between two edge curves.
   The edge curves' control points drift on slow, out-of-phase sine waves, so
   the ribbons gently breathe and twist. Path data is written straight to the
   DOM inside requestAnimationFrame (no React re-renders), the loop pauses when
   the hero is off-screen or the tab is hidden, and it stays still for users
   who prefer reduced motion. */

type Pt = [number, number];

type Ribbon = {
  a: Pt[];
  b: Pt[];
  count: number;
  minO: number;
  maxO: number;
  amp: number; // drift amplitude in viewBox units
  speed: number; // radians per second
};

const MAIN: Ribbon = {
  a: [[-60, 940], [200, 820], [300, 640], [520, 600], [760, 560], [660, 300], [880, 250], [1060, 210], [1180, 260], [1300, 180]],
  b: [[-60, 620], [180, 560], [420, 760], [580, 480], [700, 280], [560, 110], [860, 90], [1060, 70], [1160, -20], [1300, -60]],
  count: 46,
  minO: 0.18,
  maxO: 0.85,
  amp: 34,
  speed: 0.32,
};

const BACK: Ribbon = {
  a: [[200, 980], [420, 860], [560, 760], [760, 700], [960, 640], [980, 420], [1120, 360], [1220, 320], [1260, 300], [1320, 280]],
  b: [[200, 900], [460, 760], [520, 560], [760, 560], [1000, 560], [900, 300], [1080, 220], [1200, 170], [1260, 120], [1320, 80]],
  count: 26,
  minO: 0.06,
  maxO: 0.3,
  amp: 26,
  speed: 0.24,
};

const fmt = (v: number) => v.toFixed(1);

/* Each ribbon edge is three joined cubic segments. A joint and the two handles
   on either side of it are moved together (one shared offset plus a small
   rotation around the joint), so the handles stay in line with the joint and
   the curve stays smooth. Moving every point independently bends the joints
   into visible creases. The two edges rotate in opposite directions, which
   gives the ribbon a gentle twist without letting it pinch shut. */
const GROUPS: number[][] = [[0, 1], [2, 3, 4], [5, 6, 7], [8, 9]];

function drift(pts: Pt[], time: number, amp: number, speed: number, edge: 1 | -1): Pt[] {
  const out: Pt[] = pts.map(([x, y]) => [x, y]);
  GROUPS.forEach((group, gi) => {
    const ph = gi * 1.7;
    // the end groups move less, so the ribbon stays anchored past the frame
    const w = gi === 0 || gi === GROUPS.length - 1 ? 0.35 : 1;
    const dx = Math.sin(time * speed + ph) * amp * 0.6 * w;
    const dy = Math.cos(time * speed * 0.8 + ph * 1.3) * amp * w * (gi % 2 ? edge : 1);
    const rot = Math.sin(time * speed * 0.7 + ph) * 0.1 * edge * w;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    // pivot on the joint (middle point) or, for the end groups, the outer point
    const [px, py] = pts[group.length === 3 ? group[1] : group[0]];
    for (const k of group) {
      const rx = pts[k][0] - px;
      const ry = pts[k][1] - py;
      out[k] = [px + rx * cos - ry * sin + dx, py + rx * sin + ry * cos + dy];
    }
  });
  return out;
}

function strandPaths(r: Ribbon, time: number): string[] {
  const a = drift(r.a, time, r.amp, r.speed, 1);
  const b = drift(r.b, time + 3.1, r.amp, r.speed, -1);
  const out: string[] = [];
  for (let i = 0; i < r.count; i++) {
    const t = i / (r.count - 1);
    let d = "";
    for (let k = 0; k < a.length; k++) {
      const x = a[k][0] + (b[k][0] - a[k][0]) * t;
      const y = a[k][1] + (b[k][1] - a[k][1]) * t;
      d += k === 0 ? `M${fmt(x)} ${fmt(y)}` : `${k % 3 === 1 ? " C" : " "}${fmt(x)} ${fmt(y)}`;
    }
    out.push(d);
  }
  return out;
}

const opacities = (r: Ribbon) =>
  Array.from({ length: r.count }, (_, i) =>
    +(r.minO + (r.maxO - r.minO) * Math.sin((Math.PI * i) / (r.count - 1))).toFixed(2),
  );

// first frame, computed once so server and client markup match
const mainStart = strandPaths(MAIN, 0);
const backStart = strandPaths(BACK, 0);
const mainO = opacities(MAIN);
const backO = opacities(BACK);

export function HeroLines({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mainRefs = useRef<(SVGPathElement | null)[]>([]);
  const backRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      // clamp the step so returning to the tab doesn't make the lines jump
      elapsed += Math.min(now - last, 50) / 1000;
      last = now;
      const m = strandPaths(MAIN, elapsed);
      const b = strandPaths(BACK, elapsed);
      for (let i = 0; i < m.length; i++) mainRefs.current[i]?.setAttribute("d", m[i]);
      for (let i = 0; i < b.length; i++) backRefs.current[i]?.setAttribute("d", b[i]);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(svg);
    start();

    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  return (
    <motion.svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="hl-main" x1="0" y1="900" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2451B8" />
          <stop offset="0.5" stopColor="#2A6FDB" />
          <stop offset="1" stopColor="#18C6D1" />
        </linearGradient>
        <linearGradient id="hl-back" x1="200" y1="900" x2="1300" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18C6D1" />
          <stop offset="1" stopColor="#2451B8" />
        </linearGradient>
        <radialGradient id="hl-glow" cx="820" cy="380" r="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2A6FDB" stopOpacity="0.09" />
          <stop offset="1" stopColor="#2A6FDB" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="-200" y="-200" width="1600" height="1300" fill="url(#hl-glow)" />
      <g strokeWidth={1}>
        {backStart.map((d, i) => (
          <path key={`b${i}`} ref={(el) => { backRefs.current[i] = el; }} d={d} stroke="url(#hl-back)" strokeOpacity={backO[i]} />
        ))}
      </g>
      <g strokeWidth={1.15}>
        {mainStart.map((d, i) => (
          <path key={`m${i}`} ref={(el) => { mainRefs.current[i] = el; }} d={d} stroke="url(#hl-main)" strokeOpacity={mainO[i]} />
        ))}
      </g>
    </motion.svg>
  );
}
