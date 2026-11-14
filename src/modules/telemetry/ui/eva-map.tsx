"use client";

import { useState } from "react";
import { formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { KM_PER_PX, ROUTE, ROUTE_LENGTH_PX, SAFE_RADIUS_KM, STOPS, WALK_KMH, distanceAlong, pointAt } from "../domain/route";

const W = 800;
const H = 560;

export function EvaMap({ progress, name }: { progress: number; name: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const p = pointAt(progress);
  const [bx, by] = ROUTE[0];
  const traveled = [...ROUTE.slice(0, p.segment + 1), [p.x, p.y]].map((q) => q.join(",")).join(" ");
  const remaining = [[p.x, p.y], ...ROUTE.slice(p.segment + 1)].map((q) => q.join(",")).join(" ");
  const safeR = SAFE_RADIUS_KM / KM_PER_PX;
  const doneDistance = progress * ROUTE_LENGTH_PX;

  const stops = STOPS.map((s, k) => {
    const along = distanceAlong(s.index);
    const reached = doneDistance >= along - 0.5;
    const etaMin = Math.max(1, Math.round((((along - doneDistance) * KM_PER_PX) / WALK_KMH) * 60));
    const [x, y] = ROUTE[s.index];
    return { ...s, k, x, y, reached, etaMin, fromBaseKm: Math.hypot(x - bx, y - by) * KM_PER_PX };
  });
  const active = hover === null ? null : stops[hover];

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full rounded-lg bg-stone-200" role="img" aria-label={`Mapa: ${name} en la ruta de la EVA`}>
        <path d="M560 0 C 600 60, 700 80, 800 70 L 800 0 Z" fill="#57534e" opacity="0.55" />
        <text x="790" y="30" textAnchor="end" fontSize="14" fontWeight="600" fill="#fff">Zona en sombra permanente</text>
        <path d="M470 40 C 560 90, 690 110, 800 105" fill="none" stroke="#a8a29e" strokeWidth="3" strokeDasharray="2 6" />
        <text x="690" y="135" fontSize="13" fill="#57534e">Borde del cráter</text>
        {[[300, 160, 46], [610, 380, 64], [450, 470, 24], [90, 250, 30], [200, 520, 18]].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#d6d3d1" stroke="#a8a29e" strokeWidth="2" />
        ))}
        <circle cx={bx} cy={by} r={safeR} fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="8 6" />
        <polyline points={remaining} fill="none" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round" />
        <polyline points={traveled} fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {stops.map((s) => (
          <g key={s.k}>
            <circle cx={s.x} cy={s.y} r={hover === s.k ? 14 : 11} fill={s.reached ? "#16a34a" : "#9ca3af"} stroke={hover === s.k ? "#111827" : "#fff"} strokeWidth="3" />
            <text x={s.x + 16} y={s.y + 26} fontSize="13" fontWeight="600" fill="#1f2937">Parada {s.k + 1}</text>
            <circle
              cx={s.x}
              cy={s.y}
              r={24}
              fill="transparent"
              className="cursor-help"
              onMouseEnter={() => setHover(s.k)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
        <rect x={bx - 18} y={by - 18} width="36" height="36" rx="8" fill="#111827" />
        <path d={`M${bx - 9} ${by + 8} L${bx - 9} ${by - 2} L${bx} ${by - 10} L${bx + 9} ${by - 2} L${bx + 9} ${by + 8} Z`} fill="none" stroke="#fff" strokeWidth="2.5" />
        <text x={bx} y={by + 38} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">Base</text>
        <circle cx={p.x} cy={p.y} r="18" fill="#2563eb" opacity="0.25" className="animate-live" />
        <circle cx={p.x} cy={p.y} r="10" fill="#2563eb" stroke="#fff" strokeWidth="3" />
        <text x={p.x} y={p.y - 24} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e3a8a" stroke="#e7e5e4" strokeWidth="4" paintOrder="stroke">{name}</text>
      </svg>

      {active && (
        <div
          role="tooltip"
          className="pointer-events-none absolute w-64 overflow-hidden rounded-xl border bg-card shadow-lg"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: `${(active.y / H) * 100}%`,
            transform: `${active.x > 520 ? "translate(calc(-100% - 18px)," : "translate(18px,"} ${active.y > 300 ? "calc(-100% + 10px))" : "-10px)"}`,
          }}
        >
          <div className="bg-foreground px-3 py-2 font-display font-bold text-background">Parada {active.k + 1}</div>
          <div className="flex flex-col gap-1 p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objetivo</span>
            <span className="font-semibold">{active.task}</span>
            <span className="text-sm text-muted-foreground">{active.detail}</span>
            <span className={cn("text-sm font-semibold", active.reached ? "text-ok-strong" : "text-warn-strong")}>
              {active.reached ? `Hecha · ${active.minutes} min` : `Pendiente · llega en ~${active.etaMin} min`}
            </span>
            <span className="text-xs text-muted-foreground">{formatNumber(active.fromBaseKm, 2)} km de la base</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function useStops(progress: number) {
  const done = progress * ROUTE_LENGTH_PX;
  return STOPS.map((s, k) => {
    const along = distanceAlong(s.index);
    return { ...s, k, reached: done >= along - 0.5, etaMin: Math.max(1, Math.round((((along - done) * KM_PER_PX) / WALK_KMH) * 60)) };
  });
}
