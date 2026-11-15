"use client";

import { PlainValue, StatusDot } from "@/shared/components/status";
import { formatTime } from "@/shared/lib/format";
import type { ParameterId } from "../domain/types";
import { useHealthSummary } from "./hooks";
import { TrendChart } from "./trend-chart";

const VITALS: ParameterId[] = ["restingHr", "bloodPressure", "glucose", "temperature", "spo2", "sleep", "mood"];

const SOURCE_LABEL: Record<string, string> = {
  seed: "registro previo",
  "check-in-diario": "check-in diario",
  "test-cognitivo": "test cognitivo",
  "cuestionario-semanal": "cuestionario semanal",
  "escala-estres": "escala de estrés",
  esclusa: "esclusa",
  "registro-alimentos": "registro de alimentos",
};

/** Signos vitales (M3): cada indicador con su gráfico y la franja normal. */
export function VitalsGrid({ astronautId }: { astronautId: string }) {
  const h = useHealthSummary(astronautId);
  const items = h.statuses.filter((s) => VITALS.includes(s.id));
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((s) => (
        <article key={s.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
          <span className="flex items-center justify-between font-semibold text-muted-foreground">
            {s.label}
            <StatusDot tone={s.tone} />
          </span>
          <PlainValue tone={s.tone} plain={s.plain} detail={`${s.detail} · normal: ${s.normalText}`} size="lg" />
          <div className="rounded-lg bg-muted">
            <TrendChart status={s} height={90} compact />
          </div>
          {s.latest && (
            <span className="text-xs text-muted-foreground">
              Último: {formatTime(s.latest.at)} · {SOURCE_LABEL[s.latest.source]}
            </span>
          )}
        </article>
      ))}
    </div>
  );
}

/** Mi evolución: todos los parámetros activos, en palabras primero. */
export function EvolutionList({ astronautId }: { astronautId: string }) {
  const h = useHealthSummary(astronautId);
  return (
    <div className="flex flex-col gap-2">
      {h.statuses.map((s) => (
        <div key={s.id} className="grid grid-cols-[200px_1fr_200px_16px] items-center gap-5 rounded-xl border bg-card px-5 py-2">
          <span className="font-semibold">{s.label}</span>
          <div className="min-w-0">
            <TrendChart status={s} height={48} compact />
          </div>
          <PlainValue tone={s.tone} plain={s.plain} detail={s.detail} size="sm" className="items-end text-right" />
          <StatusDot tone={s.tone} className="size-3" />
        </div>
      ))}
    </div>
  );
}
