"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";
import { TONE_CLASSES } from "@/shared/domain/status";
import { PlainValue, StatusDot } from "@/shared/components/status";
import { EscalationLadder } from "@/shared/components/escalation-ladder";
import { SectionLabel } from "@/shared/components/page-header";
import { PARAMETERS } from "../domain/parameters";
import { useActiveFollowUp, useHealthSummary } from "./hooks";
import { TrendChart } from "./trend-chart";

/**
 * Ficha de un astronauta en la base.
 * Regla: si hay N parámetros a atender, se ven los N (ninguno queda escondido).
 */
export function InteriorProfile({ astronautId }: { astronautId: string }) {
  const h = useHealthSummary(astronautId);
  const followUp = useActiveFollowUp(astronautId);
  const [selected, setSelected] = useState(0);
  const list = h.attention.length ? h.attention : h.inRange.slice(0, 1);
  const current = list[Math.min(selected, list.length - 1)];
  const def = PARAMETERS[current.id];
  const tc = TONE_CLASSES[h.attention.length ? h.tone : "ok"];

  return (
    <div className="flex flex-col gap-5">
      <section className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-2xl px-6 py-4", tc.soft)}>
        <span className={cn("font-display text-3xl font-bold", tc.strong)}>
          {h.attention.length} de {h.total} parámetros a atender
        </span>
        <span className="text-base">{h.attention.length ? "Tocá cada uno para ver su evolución y qué hacer." : "Todo en rango. Seguí con tu rutina."}</span>
      </section>

      {followUp && (
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-info bg-info-soft px-4 py-3 text-sm text-info-strong">
          <strong>Seguimiento post-salida activo.</strong>
          {followUp.checkpoints.map((c) => (
            <span key={c.label}>
              {c.label}: {new Date(c.at).getTime() < Date.now() ? "hecho" : `a las ${formatTime(c.at)}`}
            </span>
          ))}
        </section>
      )}

      {h.attention.length > 0 && (
        <section aria-label="Parámetros a atender" className="flex flex-col gap-2">
          <SectionLabel>A atender ({h.attention.length})</SectionLabel>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(3, h.attention.length)}, minmax(0, 1fr))` }}>
            {h.attention.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
                className={cn(
                  "flex min-h-28 flex-col items-start gap-1.5 rounded-xl border-[3px] bg-card p-3 text-left transition-colors",
                  i === selected ? "border-primary" : "border-border hover:border-input",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-muted-foreground">
                  {s.label}
                  <StatusDot tone={s.tone} />
                </span>
                <PlainValue tone={s.tone} plain={s.plain} detail={`${s.detail} · normal: ${s.normalText}`} />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 rounded-2xl border bg-card p-5 lg:grid-cols-[1.2fr_1fr]" aria-live="polite">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-xl font-bold">
            {current.label}: <span className={current.tone === "ok" ? "" : TONE_CLASSES[current.tone].strong}>{current.plain}</span>
          </h2>
          <span className="text-sm text-muted-foreground">Últimos días · franja verde = normal ({current.normalText})</span>
          <TrendChart status={current} height={190} />
          <span className="text-sm text-muted-foreground">Cómo se mide: {def.how}</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <SectionLabel>Por qué importa en la Luna</SectionLabel>
            <p className="text-[15px] leading-relaxed">{def.why}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4">
            <SectionLabel>Qué hacer</SectionLabel>
            <p className="text-[15px] leading-relaxed">{def.action[current.tone] ?? "Seguí con tu rutina."}</p>
            <EscalationLadder level={current.tone === "bad" ? 1 : 0} />
          </div>
          <span className="text-xs text-muted-foreground">Referencia NASA: {def.source}</span>
        </div>
      </section>

      <section aria-label="Parámetros en rango" className="flex flex-wrap items-center gap-2">
        <SectionLabel>En rango ({h.inRange.length})</SectionLabel>
        {h.inRange.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm">
            <StatusDot tone={s.tone} />
            {s.label}: <strong>{s.plain}</strong>
            <span className="text-xs text-muted-foreground">{s.detail}</span>
          </span>
        ))}
      </section>
    </div>
  );
}
