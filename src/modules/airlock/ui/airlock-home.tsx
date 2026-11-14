"use client";

import Link from "next/link";
import { useAppStore } from "@/core/store";
import { formatNumber, formatTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { StatusPill } from "@/shared/components/status";
import { useSuit } from "@/modules/telemetry";
import type { Astronaut } from "@/modules/monitoring/domain";

const OUT_STEPS = ["Plan de la salida", "Cómo te sentís", "Signos vitales", "Test cognitivo", "Equilibrio", "Traje y pre-respirado", "Resultado"];
const IN_STEPS = ["Resumen de la salida", "Síntomas de descompresión", "Polvo lunar", "Signos vitales", "Manos e hidratación", "Resultado y seguimiento"];

/** Inicio de la esclusa: quién puede salir y quién vuelve. */
export function AirlockHome() {
  const astronauts = useAppStore((s) => s.astronauts);
  const log = useAppStore((s) => s.airlockLog);
  const inside = astronauts.filter((a) => a.location === "interior");
  const outside = astronauts.filter((a) => a.location === "exterior");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Salir de la base</span>
          <h2 className="text-4xl font-bold">Check-out</h2>
          <ol className="list-decimal pl-6 text-lg leading-relaxed">{OUT_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
          <div className="mt-auto flex flex-col gap-2">
            {inside.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
                <span className="flex flex-col">
                  <span className="text-lg font-semibold">{a.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {a.nextEva ? `Salida programada ${new Date(a.nextEva.at).toLocaleString("es-AR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}` : a.role}
                  </span>
                </span>
                <Button asChild size="lg" variant={a.nextEva ? "default" : "outline"}>
                  <Link href={`/esclusa/check-out/${a.id}`}>Empezar check-out</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Entrar a la base</span>
          <h2 className="text-4xl font-bold">Check-in</h2>
          <ol className="list-decimal pl-6 text-lg leading-relaxed">{IN_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
          <div className="mt-auto flex flex-col gap-2">
            {outside.length === 0 && <p className="text-muted-foreground">No hay nadie afuera.</p>}
            {outside.map((a) => (
              <OutsideRow key={a.id} a={a} />
            ))}
          </div>
        </section>
      </div>

      {log.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registro de la esclusa</h2>
          {log
            .slice()
            .reverse()
            .map((r) => (
              <div key={r.id} className="flex items-center gap-4 rounded-lg border bg-card px-4 py-2 text-sm">
                <span className="w-16 text-muted-foreground">{formatTime(r.at)}</span>
                <span className="w-24 font-semibold">{r.kind === "check-out" ? "Check-out" : "Check-in"}</span>
                <span className="w-32">{astronauts.find((a) => a.id === r.astronautId)?.name}</span>
                <StatusPill tone={r.verdict.tone} label={r.verdict.title} />
              </div>
            ))}
        </section>
      )}
      <p className="text-sm text-muted-foreground">Los resultados del check-in pasan a la ficha del astronauta en la base como seguimiento post-salida.</p>
    </div>
  );
}

function OutsideRow({ a }: { a: Astronaut }) {
  const live = useSuit(a.eva);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
      <span className="flex flex-col">
        <span className="text-lg font-semibold">{a.name}</span>
        <Link href={`/astronautas/${a.id}/mapa`} className="text-sm font-semibold text-primary hover:underline">
          Afuera · a {live ? formatNumber(live.position.distanceKm, 2) : "—"} km de la base →
        </Link>
      </span>
      <Button asChild size="lg">
        <Link href={`/esclusa/check-in/${a.id}`}>Empezar check-in</Link>
      </Button>
    </div>
  );
}
