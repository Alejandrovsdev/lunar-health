import { HoverTip } from "@/shared/components/hover-tip";
import { formatDuration } from "@/shared/lib/format";
import type { SuitSnapshot } from "../domain/suit";

export function ConsumableRings({ items }: { items: SuitSnapshot["consumables"] }) {
  const C = 2 * Math.PI * 40;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((c) => {
        const pct = Math.round(c.percent);
        return (
          <div key={c.id} tabIndex={0} className="group relative flex cursor-help items-center gap-3 rounded-xl border bg-card p-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
            <svg viewBox="0 0 100 100" className="size-20 shrink-0" role="img" aria-label={`${c.label} ${pct} por ciento`}>
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
              <span className="font-display text-2xl font-bold">{pct} %</span>
              <span className="text-xs text-muted-foreground">{c.sub}</span>
            </div>
            <HoverTip className="bottom-full left-1/2 mb-2 -translate-x-1/2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: c.color }} />
                <span className="font-display text-base font-bold">{pct} % restante</span>
              </span>
              <span className="text-muted-foreground">{c.sub}</span>
              <span className="border-t pt-1 text-xs text-muted-foreground">
                Usado: {100 - pct} %. El anillo lleno es el 100 % al salir.
              </span>
            </HoverTip>
          </div>
        );
      })}
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
      <div tabIndex={0} className="group relative h-5 cursor-help rounded-full bg-border outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <div className="h-5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
        <div aria-hidden className="absolute -top-1.5 h-8 w-1 rounded bg-warn" style={{ left: `${marker}%` }} />
        <HoverTip className="bottom-full mb-3 w-64">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tiempo de la EVA</span>
          <span className="flex justify-between gap-2">
            <span className="flex items-center gap-2"><span aria-hidden className="inline-block size-2.5 rounded-full bg-blue-500" />Transcurrido</span>
            <b>{formatDuration(elapsedS)} ({Math.round(pct)} %)</b>
          </span>
          <span className="flex justify-between gap-2">
            <span className="flex items-center gap-2"><span aria-hidden className="inline-block size-2.5 rounded-full bg-warn" />Iniciar regreso</span>
            <b>{formatDuration(returnAtS)}</b>
          </span>
          <span className="flex justify-between gap-2">
            <span className="flex items-center gap-2"><span aria-hidden className="inline-block size-2.5 rounded-full bg-border" />Límite del traje</span>
            <b>{formatDuration(limitS)}</b>
          </span>
          <span className="border-t pt-1 text-xs text-muted-foreground">
            Faltan {formatDuration(returnAtS - elapsedS)} para la marca naranja y {formatDuration(limitS - elapsedS)} para el límite.
          </span>
        </HoverTip>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Salida</span>
        <span>Marca naranja: iniciar regreso (incluye la caminata)</span>
        <span>Límite del traje 8 h</span>
      </div>
    </div>
  );
}
