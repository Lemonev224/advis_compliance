"use client";

// Small hand-drawn SVG charts for the demo's reports. Thin marks, hairline grid, one axis, hover tooltips;
// every value is also in the table under each chart, so the tooltip never gates a number.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

const INK_MUTED = "#5b6675";
const GRID = "#eef1f4";
const BASELINE = "#c9d1da";
const SURFACE = "#ffffff";
export const SERIES = "#3b6fb6";
export const REFERENCE = "#aeb8c4";

// Width of a printed A4 page's content area in CSS pixels, roughly (default browser margins).
const PRINT_WIDTH = 700;

/** The chart's width in pixels. Just before printing it switches to the width the chart will have on paper,
 *  so lines, bars and text are drawn for the page instead of being shrunk from the screen. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let printing = false;
    const ro = new ResizeObserver(([e]) => { if (!printing) setWidth(Math.floor(e.contentRect.width)); });
    ro.observe(el);
    const before = () => {
      printing = true;
      const main = el.closest("main") ?? document.body;
      const share = el.getBoundingClientRect().width / (main.getBoundingClientRect().width || 1);
      flushSync(() => setWidth(Math.floor(Math.min(1, share) * PRINT_WIDTH)));
    };
    const after = () => { printing = false; setWidth(Math.floor(el.getBoundingClientRect().width)); };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => { ro.disconnect(); window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); };
  }, []);
  return [ref, width] as const;
}

/** Legend: a line key for lines, a square for bars. */
export function Legend({ items }: { items: { label: string; color: string; shape: "line" | "rect" }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          {it.shape === "line"
            ? <span aria-hidden className="inline-block h-[2px] w-4 rounded-full" style={{ background: it.color }} />
            : <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ background: it.color }} />}
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.max(4, Math.min(x + 12, width - 184));
  return (
    <div role="status" className="pointer-events-none absolute z-10 w-[180px] rounded-ctl bg-nav-bg px-2.5 py-2 text-xs text-white shadow-pop" style={{ left, top: Math.max(0, y - 8) }}>
      {children}
    </div>
  );
}

const niceStep = (max: number, ticks = 4) => {
  const raw = max / ticks;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  return [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
};

/* ---------------- Small multiples: one line per panel, a shared scale ---------------- */

export function SmallMultiples({ labels, panels, reference, seriesLabel, referenceLabel, min, max, unit = "%" }: {
  labels: string[];
  panels: { name: string; values: number[]; sub?: string }[];
  reference: number[];
  seriesLabel: string;
  referenceLabel: string;
  min: number;
  max: number;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Legend items={[{ label: seriesLabel, color: SERIES, shape: "line" }, { label: referenceLabel, color: REFERENCE, shape: "line" }]} />
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {panels.map((p) => <Panel key={p.name} labels={labels} panel={p} reference={reference} referenceLabel={referenceLabel} min={min} max={max} unit={unit} />)}
      </div>
    </div>
  );
}

function Panel({ labels, panel, reference, referenceLabel, min, max, unit }: {
  labels: string[]; panel: { name: string; values: number[]; sub?: string }; reference: number[]; referenceLabel: string; min: number; max: number; unit: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  // Drawn in a coordinate space as wide as the box on screen, then scaled to fit (printing, resizing, before measuring).
  const W = width || 520;
  const H = 150, L = 30, R = 36, T = 10, B = 22;
  const w = Math.max(0, W - L - R);
  const n = labels.length;
  const x = (i: number) => L + (n === 1 ? 0 : (i / (n - 1)) * w);
  const y = (v: number) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const last = panel.values[n - 1];
  const first = panel.values[0];
  const delta = last - first;
  const ticks: number[] = [];
  for (let v = min; v <= max; v += 10) ticks.push(v);

  return (
    <div className="rounded-ctl bg-surface-subtle p-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-medium">{panel.name}</span>
        <span className="text-sm"><span className="font-semibold">{last}{unit}</span> <span className={delta < 0 ? "text-bad-fg" : "text-ok-fg"}>{delta > 0 ? "+" : ""}{delta} pts</span></span>
      </div>
      {panel.sub && <div className="mb-1 text-xs text-ink-muted">{panel.sub}</div>}
      <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
        {(
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`${panel.name}: ${first}${unit} → ${last}${unit}`}
            onPointerMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const px = ((e.clientX - box.left) * W) / (box.width || 1);
              const i = Math.round(((px - L) / (w || 1)) * (n - 1));
              setHover(Math.max(0, Math.min(n - 1, i)));
            }}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={L} x2={L + w} y1={y(v)} y2={y(v)} stroke={v === min ? BASELINE : GRID} strokeWidth={1} />
                <text x={L - 6} y={y(v) + 3.5} textAnchor="end" fontSize={10} fill={INK_MUTED} className="num">{v}</text>
              </g>
            ))}
            <text x={L} y={H - 6} fontSize={10} fill={INK_MUTED}>{labels[0]}</text>
            <text x={L + w} y={H - 6} fontSize={10} fill={INK_MUTED} textAnchor="end">{labels[n - 1]}</text>
            <path d={path(reference)} fill="none" stroke={REFERENCE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={path(panel.values)} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke={BASELINE} strokeWidth={1} />}
            <circle cx={x(hover ?? n - 1)} cy={y(panel.values[hover ?? n - 1])} r={4} fill={SERIES} stroke={SURFACE} strokeWidth={2} />
            <text x={x(n - 1) + 8} y={y(last) + 4} fontSize={11} fontWeight={600} fill="#0f1b2d">{last}{unit}</text>
          </svg>
        )}
        {hover !== null && (
          <Tip x={x(hover)} y={y(panel.values[hover]) - 50} width={W}>
            <div className="text-white/70">{labels[hover]}</div>
            <div className="flex items-center gap-1.5"><span className="h-[2px] w-3" style={{ background: "#8fb3e6" }} /><span className="font-semibold">{panel.values[hover]}{unit}</span> {panel.name}</div>
            <div className="flex items-center gap-1.5"><span className="h-[2px] w-3" style={{ background: REFERENCE }} /><span className="font-semibold">{reference[hover]}{unit}</span> {referenceLabel}</div>
          </Tip>
        )}
      </div>
    </div>
  );
}

/* ---------------- Columns: stacked by series (or one series) ---------------- */

export function Columns({ rows, series, height = 220, totalLabel }: {
  rows: { label: string; values: Record<string, number>; note?: string }[];
  series: { key: string; label: string; color: string }[];
  height?: number;
  totalLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const W = width || 720;
  const L = 28, R = 8, T = 18, B = 24;
  const w = Math.max(0, W - L - R);
  const totals = rows.map((r) => series.reduce((a, s) => a + (r.values[s.key] ?? 0), 0));
  const step = niceStep(Math.max(1, ...totals));
  const top = Math.ceil(Math.max(1, ...totals) / step) * step;
  const band = rows.length ? w / rows.length : 0;
  const bar = Math.min(24, band * 0.6);
  const y = (v: number) => T + (1 - v / top) * (height - T - B);
  const every = Math.max(1, Math.ceil(46 / Math.max(1, band)));
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);

  return (
    <div className="flex flex-col gap-2">
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: s.color, shape: "rect" }))} />}
      <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
        {(
          <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full" role="img" aria-label={rows.map((r, i) => `${r.label}: ${totals[i]}`).join(", ")}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={L} x2={L + w} y1={y(v)} y2={y(v)} stroke={v === 0 ? BASELINE : GRID} strokeWidth={1} />
                <text x={L - 6} y={y(v) + 3.5} textAnchor="end" fontSize={10} fill={INK_MUTED} className="num">{v}</text>
              </g>
            ))}
            {rows.map((r, i) => {
              const cx = L + band * i + band / 2;
              let acc = 0;
              const segs = series.map((s) => ({ s, v: r.values[s.key] ?? 0 })).filter((x) => x.v > 0);
              return (
                <g key={i} onPointerEnter={() => setHover(i)} opacity={hover === null || hover === i ? 1 : 0.55}>
                  <rect x={L + band * i} y={T} width={band} height={height - T - B} fill="transparent" />
                  {segs.map(({ s, v }, j) => {
                    const y0 = y(acc), y1 = y(acc + v);
                    acc += v;
                    const gap = j > 0 ? 2 : 0;
                    const h = Math.max(0, y0 - y1 - gap);
                    const isTop = j === segs.length - 1;
                    const rr = isTop ? Math.min(4, h, bar / 2) : 0;
                    const x0 = cx - bar / 2, x1 = cx + bar / 2, yt = y1, yb = y1 + h;
                    const d = `M${x0},${yb}L${x0},${yt + rr}Q${x0},${yt} ${x0 + rr},${yt}L${x1 - rr},${yt}Q${x1},${yt} ${x1},${yt + rr}L${x1},${yb}Z`;
                    return <path key={s.key} d={d} fill={s.color} />;
                  })}
                  {i % every === 0 && <text x={cx} y={height - 7} textAnchor="middle" fontSize={10} fill={INK_MUTED}>{r.label}</text>}
                </g>
              );
            })}
          </svg>
        )}
        {hover !== null && (
          <Tip x={L + band * hover + band / 2} y={y(totals[hover]) - 10} width={W}>
            <div className="text-white/70">{rows[hover].label}{rows[hover].note ? ` · ${rows[hover].note}` : ""}</div>
            <div><span className="font-semibold">{totals[hover]}</span> {totalLabel}</div>
            {series.length > 1 && series.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5"><span className="h-[2px] w-3" style={{ background: s.color }} /><span className="font-semibold">{rows[hover].values[s.key] ?? 0}</span> {s.label}</div>
            ))}
          </Tip>
        )}
      </div>
    </div>
  );
}

/* ---------------- Horizontal bars ---------------- */

export function Bars({ rows, max, unit = "", color = SERIES }: {
  rows: { label: string; value: number; sub?: string; muted?: boolean }[];
  max: number;
  unit?: string;
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <li key={r.label} className="grid grid-cols-[minmax(120px,200px)_1fr] items-center gap-3" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.label}</div>
            {r.sub && <div className="truncate text-xs text-ink-muted">{r.sub}</div>}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 rounded-r-[4px] transition-opacity" style={{ width: `${Math.max(0.5, (r.value / max) * 85)}%`, background: r.muted ? REFERENCE : color, opacity: hover === null || hover === i ? 1 : 0.55 }} />
            <span className="num whitespace-nowrap text-sm font-semibold">{r.value}{unit}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
