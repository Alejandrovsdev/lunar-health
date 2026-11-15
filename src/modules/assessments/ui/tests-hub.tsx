"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { SectionLabel } from "@/shared/components/page-header";
import { StatusPill } from "@/shared/components/status";
import { Button } from "@/shared/ui/button";
import { useTestStatuses, type TestStatus } from "./hooks";

const GROUPS: { label: string; match: (t: TestStatus) => boolean }[] = [
  { label: "Hoy", match: (t) => t.frequency === "daily" },
  { label: "Esta semana", match: (t) => t.frequency === "weekly" },
  { label: "Este mes", match: (t) => t.frequency === "monthly" },
  { label: "Antes de salir", match: (t) => t.frequency === "pre-eva" },
];

/** Tests de hoy: lista lo pendiente, lo hecho y lo programado. */
export function TestsHub({ astronautId }: { astronautId: string }) {
  const tests = useTestStatuses(astronautId);
  const pending = tests.filter((t) => t.state === "pending").length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-full px-4 py-2 text-sm font-semibold", pending ? "bg-warn-soft text-warn-strong" : "bg-ok-soft text-ok-strong")}>
          {pending ? `${pending} pendientes` : "Todo hecho por hoy"}
        </span>
        <span className="text-sm text-muted-foreground">Cada test actualiza tu ficha. Empezá por los marcados en naranja.</span>
      </div>
      {GROUPS.map((g) => (
        <section key={g.label} className="flex flex-col gap-2">
          <SectionLabel>{g.label}</SectionLabel>
          {tests.filter(g.match).map((t) => (
            <div
              key={t.id}
              className={cn(
                "grid items-center gap-4 rounded-xl border bg-card px-5 py-3 md:grid-cols-[1fr_100px_220px_160px_170px]",
                t.state === "pending" && "border-warn",
              )}
            >
              <span className="flex flex-col">
                <span className="text-lg font-semibold">{t.title}</span>
                <span className="text-sm text-muted-foreground">{t.description}</span>
                <span className="text-xs text-muted-foreground">Tipo: {t.category}</span>
              </span>
              <span className="text-sm">{t.minutes} min</span>
              <span className="text-sm">{t.frequencyLabel}</span>
              <StatusPill tone={t.state === "done" ? "ok" : t.state === "pending" ? "warn" : "pending"} label={t.note} />
              <Button asChild variant={t.state === "pending" ? "default" : "outline"}>
                <Link href={`/tests/${astronautId}/${t.id}`}>{t.state === "done" ? "Repetir" : t.state === "pending" ? "Empezar" : "Probar ahora"}</Link>
              </Button>
            </div>
          ))}
        </section>
      ))}
      <Link href="/esclusa" className="text-sm font-semibold text-primary hover:underline">
        Los chequeos antes de salir y al volver se hacen en la esclusa: check-out / check-in →
      </Link>
    </div>
  );
}
