import { formatDuration } from "@/shared/lib/format";
import type { SuitSnapshot } from "../domain/suit";

export function ConsumableRings({ items }: { items: SuitSnapshot["consumables"] }) {
  const C = 2 * Math.PI * 40;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <svg viewBox="0 0 100 100" className="size-20 shrink-0" role="img" aria-label={`${c.label} ${Math.round(c.percent)} por ciento`}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={c.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(c.percent / 100) * C} ${C}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{c.label}</span>
            <span className="font-display text-2xl font-bold">{Math.round(c.percent)} %</span>
            <span className="text-xs text-muted-foreground">{c.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EvaTimeline({ elapsedS, returnAtS, limitS }: { elapsedS: number; returnAtS: number; limitS: number }) {
  const pct = Math.min(100, (elapsedS / limitS) * 100);
  const marker = (returnAtS / limitS) * 100;
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4" aria-label="Tiempo de la EVA">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2">
          <span className="font-semibold">En EVA</span>
          <span className="font-display text-2xl font-bold">{formatDuration(elapsedS)}</span>
        </span>
        <span className="flex items-baseline gap-2">
          <span className="font-semibold">Empezar a volver en</span>
          <span className="font-display text-2xl font-bold text-primary">{formatDuration(returnAtS - elapsedS)}</span>
        </span>
      </div>
      <div className="relative h-5 rounded-full bg-border">
        <div className="h-5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
        <div aria-hidden className="absolute -top-1.5 h-8 w-1 rounded bg-warn" style={{ left: `${marker}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Salida</span>
        <span>Marca naranja: iniciar regreso (incluye la caminata)</span>
        <span>Límite del traje 8 h</span>
      </div>
    </div>
  );
}
