"use client";

import { useState } from "react";
import { formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { KM_PER_PX, MAP_IMAGE, ROUTE, ROUTE_LENGTH_PX, SAFE_RADIUS_KM, STOPS, WALK_KMH, distanceAlong, pointAt } from "../domain/route";

const W = 800;
const H = 560;
/** Barra de escala: 500 m en unidades del lienzo. */
const SCALE_M = 500;
const SCALE_PX = SCALE_M / 1000 / KM_PER_PX;

/** Texto legible sobre la foto (que tiene zonas claras y oscuras): relleno claro con contorno oscuro. */
const LABEL = { fill: "#fff", stroke: "#0b0f19", strokeWidth: 4, paintOrder: "stroke" as const };

/**
 * Mapa de la EVA sobre la imagen real de la zona (LRO). Cada parada muestra su objetivo y una foto
 * al pasar el mouse o al llegar con el teclado (Tab).
 */
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
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full rounded-lg bg-neutral-900" role="img" aria-label={`Mapa: ${name} en la ruta de la EVA, ${MAP_IMAGE.place}`}>
        <image href={MAP_IMAGE.src} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" />

        <text x="22" y="470" fontSize="15" fontWeight="700" {...LABEL}>
          Cráter en sombra permanente
        </text>
        <text x="22" y="490" fontSize="12" {...LABEL}>
          Nunca le da el sol: puede guardar hielo
        </text>

        <circle cx={bx} cy={by} r={safeR} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 6" />
        <polyline points={remaining} fill="none" stroke="#f8fafc" strokeWidth="3.5" strokeDasharray="10 8" strokeLinecap="round" opacity="0.9" />
        <polyline points={traveled} fill="none" stroke="#0b0f19" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <polyline points={traveled} fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {stops.map((s) => (
          <g
            key={s.k}
            tabIndex={0}
            role="button"
            aria-label={`Parada ${s.k + 1}: ${s.task}. ${s.reached ? "Hecha" : `Pendiente, llega en unos ${s.etaMin} minutos`}`}
            className="cursor-help outline-none"
            onMouseEnter={() => setHover(s.k)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(s.k)}
            onBlur={() => setHover(null)}
          >
            <circle cx={s.x} cy={s.y} r={24} fill="transparent" />
            {hover === s.k && <circle cx={s.x} cy={s.y} r={19} fill="none" stroke="#fff" strokeWidth="2" />}
            <circle cx={s.x} cy={s.y} r={hover === s.k ? 14 : 11} fill={s.reached ? "#16a34a" : "#6b7280"} stroke="#fff" strokeWidth="3" />
            <text x={s.x} y={s.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
              {s.k + 1}
            </text>
            <text x={s.x + 18} y={s.y + 5} fontSize="13" fontWeight="600" {...LABEL}>
              Parada {s.k + 1}
            </text>
          </g>
        ))}

        <rect x={bx - 18} y={by - 18} width="36" height="36" rx="8" fill="#111827" stroke="#fff" strokeWidth="2" />
        <path d={`M${bx - 9} ${by + 8} L${bx - 9} ${by - 2} L${bx} ${by - 10} L${bx + 9} ${by - 2} L${bx + 9} ${by + 8} Z`} fill="none" stroke="#fff" strokeWidth="2.5" />
        <text x={bx} y={by - 26} textAnchor="middle" fontSize="14" fontWeight="700" {...LABEL}>
          Base
        </text>

        <circle cx={p.x} cy={p.y} r="18" fill="#3b82f6" opacity="0.35" className="animate-live" />
        <circle cx={p.x} cy={p.y} r="10" fill="#2563eb" stroke="#fff" strokeWidth="3" />
        <text x={p.x - 16} y={p.y + 5} textAnchor="end" fontSize="15" fontWeight="700" {...LABEL}>
          {name}
        </text>

        <g aria-hidden>
          <rect x={W - SCALE_PX - 34} y={H - 44} width={SCALE_PX + 24} height="32" rx="6" fill="#0b0f19" opacity="0.6" />
          <line x1={W - SCALE_PX - 22} y1={H - 20} x2={W - 22} y2={H - 20} stroke="#fff" strokeWidth="3" />
          <line x1={W - SCALE_PX - 22} y1={H - 25} x2={W - SCALE_PX - 22} y2={H - 15} stroke="#fff" strokeWidth="2" />
          <line x1={W - 22} y1={H - 25} x2={W - 22} y2={H - 15} stroke="#fff" strokeWidth="2" />
          <text x={W - 22 - SCALE_PX / 2} y={H - 29} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
            {SCALE_M} m
          </text>
        </g>
      </svg>

      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
        {MAP_IMAGE.place} · {MAP_IMAGE.credit}
      </span>

      {active && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 w-72 overflow-hidden rounded-xl border bg-card shadow-lg"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: `${(active.y / H) * 100}%`,
            transform: `${active.x > 520 ? "translate(calc(-100% - 22px)," : "translate(22px,"} ${active.y > H / 2 ? "calc(-100% + 12px))" : "-12px)"}`,
          }}
        >
          <div className="bg-foreground px-3 py-2 font-display font-bold text-background">Parada {active.k + 1}</div>
          <figure className="relative">
            {/* Imagen chica y local: no hace falta next/image. */}
            <img src={active.image.src} alt={active.image.alt} width={640} height={400} className="aspect-[16/10] w-full bg-muted object-cover" />
            <figcaption className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{active.image.credit}</figcaption>
          </figure>
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
