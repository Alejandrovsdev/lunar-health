"use client";

import Link from "next/link";
import { useAppStore } from "@/core/store";
import { formatNumber, formatTime, formatWeekdayTime } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { StatusPill } from "@/shared/components/status";
import { CrewAvatar } from "@/shared/components/avatar";
import { useSuit } from "@/modules/telemetry";
import type { Astronaut } from "@/modules/monitoring/domain";
import { evaTeams } from "../domain/team";

const OUT_STEPS = ["Plan de la salida", "Cómo te sentís", "Signos vitales", "Test cognitivo", "Equilibrio", "Traje y pre-respirado", "Resultado"];
const IN_STEPS = ["Resumen de la salida", "Síntomas de descompresión", "Polvo lunar", "Signos vitales", "Manos e hidratación", "Resultado y seguimiento"];

/** Inicio de la esclusa: quién puede salir y quién vuelve. */
export function AirlockHome() {
  const astronauts = useAppStore((s) => s.astronauts);
  const log = useAppStore((s) => s.airlockLog);
  const inside = astronauts.filter((a) => a.location === "interior");
  const teams = evaTeams(astronauts);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("Salir de la base")}</span>
          <h2 className="text-4xl font-bold">Check-out</h2>
          <div className="flex flex-col gap-2">
            {scheduledFirst(inside).map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
                <span className="flex items-center gap-3">
                  <CrewAvatar name={a.name} photo={a.photo} tone="info" className="size-12 ring-2 ring-offset-1 ring-offset-muted" />
                  <span className="flex flex-col">
                    <span className="text-lg font-semibold">{a.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {a.nextEva ? t("Salida programada {when}", { when: formatWeekdayTime(a.nextEva.at) }) : t(a.role)}
                    </span>
                  </span>
                </span>
                <Button asChild size="lg" variant={a.nextEva ? "default" : "outline"}>
                  <Link href={`/esclusa/check-out/${a.id}`}>{t("Empezar check-out")}</Link>
                </Button>
              </div>
            ))}
          </div>
          <StepList steps={OUT_STEPS} />
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("Entrar a la base")}</span>
          <h2 className="text-4xl font-bold">Check-in</h2>
          <div className="flex flex-col gap-2">
            {teams.length === 0 && <p className="rounded-xl bg-muted px-4 py-3 text-muted-foreground">{t("No hay nadie en EVA: no hay check-in pendiente.")}</p>}
            {teams.map((team) => (
              <TeamRow key={team[0].id} team={team} />
            ))}
          </div>
          <StepList steps={IN_STEPS} />
        </section>
      </div>

      {log.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Registro de la esclusa")}</h2>
          {log
            .slice()
            .reverse()
            .map((r) => (
              <div key={r.id} className="flex items-center gap-4 rounded-lg border bg-card px-4 py-2 text-sm">
                <span className="w-16 text-muted-foreground">{formatTime(r.at)}</span>
                <span className="w-24 font-semibold">{r.kind === "check-out" ? "Check-out" : "Check-in"}</span>
                <span className="w-32">{astronauts.find((a) => a.id === r.astronautId)?.name}</span>
                <StatusPill tone={r.verdict.tone} label={t(r.verdict.title)} />
              </div>
            ))}
        </section>
      )}
      <p className="text-sm text-muted-foreground">{t("Los resultados del check-in pasan a la ficha del astronauta en la base como seguimiento post-salida.")}</p>
    </div>
  );
}

/** Quien tiene una salida programada va primero: es el check-out más probable. */
function scheduledFirst(list: Astronaut[]) {
  return [...list].sort((a, b) => Number(Boolean(b.nextEva)) - Number(Boolean(a.nextEva)));
}

/** Los pasos como referencia secundaria: la acción (a quién) va primero. */
function StepList({ steps }: { steps: string[] }) {
  return (
    <div className="mt-auto flex flex-col gap-2 border-t pt-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("{n} pasos · se guían uno por uno", { n: steps.length })}</span>
      <ol className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <li key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">
            <span className="font-semibold text-muted-foreground">{i + 1}.</span> {t(s)}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Equipo de EVA: la pareja salió junta y hace el check-in junta. */
function TeamRow({ team }: { team: Astronaut[] }) {
  const [lead] = team;
  const live = useSuit(lead.eva);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
      <span className="flex items-center gap-3">
        <span className="flex -space-x-3">
          {team.map((a) => (
            <CrewAvatar key={a.id} name={a.name} photo={a.photo} tone="info" className="size-12 ring-2 ring-offset-1 ring-offset-muted" />
          ))}
        </span>
        <span className="flex flex-col">
          <span className="text-lg font-semibold">{team.map((a) => a.name).join(t(" y "))}</span>
          <Link href={`/astronautas/${lead.id}/mapa`} className="text-sm font-semibold text-primary hover:underline">
            {t("En EVA · a {km} km de la base →", { km: live ? formatNumber(live.position.distanceKm, 2) : "—" })}
          </Link>
        </span>
      </span>
      <Button asChild size="lg">
        <Link href={`/esclusa/check-in/${lead.id}`}>{team.length > 1 ? t("Check-in del equipo") : t("Empezar check-in")}</Link>
      </Button>
    </div>
  );
}
