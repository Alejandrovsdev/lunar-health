"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/i18n";
import { TONE_CLASSES, needsAttention, worstTone } from "@/shared/domain/status";
import { PlainValue, StatusDot } from "@/shared/components/status";
import { getLabPanels } from "../data/panels";

/** Resultados periódicos: lista de estudios a la izquierda, componentes a la derecha. */
export function LabResults({ astronautId }: { astronautId: string }) {
  const panels = getLabPanels(astronautId);
  const [sel, setSel] = useState(0);
  const cur = panels[sel];
  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <nav aria-label={t("Estudios")} className="flex flex-col gap-1.5">
        {panels.map((p, i) => {
          const tone = worstTone(p.rows.map((r) => r.tone));
          const n = p.rows.filter((r) => needsAttention(r.tone)).length;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-lg border-2 px-3 py-2 text-left",
                i === sel ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted",
              )}
            >
              <StatusDot tone={tone} />
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">{t(p.name)}</span>
                <span className="text-xs text-muted-foreground">
                  {t("Último {last} · próximo {next}", { last: t(p.last), next: t(p.next) })}
                </span>
              </span>
              {n > 0 && <span className={cn("text-xs font-semibold", TONE_CLASSES[tone].strong)}>{t("{n} a atender", { n })}</span>}
            </button>
          );
        })}
      </nav>
      <section aria-live="polite" className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{cur.standardMeasure}</span>
          <h2 className="text-2xl font-bold">{t(cur.name)}</h2>
          <p className="text-[15px]">{t(cur.what)}</p>
          <span className="text-sm text-muted-foreground">
            {t("Último: {last} · próximo: {next}", { last: t(cur.last), next: t(cur.next) })}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {cur.rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[1fr_minmax(160px,300px)_16px] items-center gap-4 rounded-lg bg-muted px-4 py-2">
              <span className="font-medium">{t(r.label)}</span>
              <PlainValue tone={r.tone} plain={r.plain} detail={r.detail} size="sm" className="items-end text-right" />
              <StatusDot tone={r.tone} className="size-3" />
            </div>
          ))}
        </div>
        <p className="mt-auto text-xs text-muted-foreground">
          {t("Basado en las variables de NASA Standard Measures. Valores de ejemplo para la demo.")}
        </p>
      </section>
    </div>
  );
}
