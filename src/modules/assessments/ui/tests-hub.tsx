"use client";

import Link from "next/link";
import { ArrowRight, Check, Rocket } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatTime, isSameDay } from "@/shared/lib/format";
import { t, tn } from "@/shared/i18n";
import { SectionLabel } from "@/shared/components/page-header";
import { StatusPill } from "@/shared/components/status";
import { Button } from "@/shared/ui/button";
import { useTestStatuses, type TestStatus } from "./hooks";

/**
 * Tests del astronauta, organizados por lo que hay que hacer (no por frecuencia):
 * 1. progreso y el siguiente test, 2. lo que falta en orden, 3. lo hecho con su resultado, 4. lo que va antes de salir.
 */
export function TestsHub({ astronautId }: { astronautId: string }) {
  const tests = useTestStatuses(astronautId);
  const pending = tests.filter((x) => x.state === "pending");
  const done = tests.filter((x) => x.state === "done");
  const beforeEva = tests.filter((x) => x.state === "scheduled");
  const href = (test: TestStatus) => `/tests/${astronautId}/${test.id}`;

  return (
    <div className="flex flex-col gap-8">
      <Progress pending={pending} doneCount={done.length} href={href} />

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>{t("Para hacer · {n}", { n: pending.length })}</SectionLabel>
          <ol className="flex flex-col gap-3">
            {pending.map((test, i) => (
              <li key={test.id}>
                <PendingCard test={test} n={i + 1} next={i === 0} href={href(test)} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {done.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>{t("Hechos · {n}", { n: done.length })}</SectionLabel>
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {done.map((test) => (
              <li key={test.id}>
                <DoneRow test={test} href={href(test)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {beforeEva.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>{t("Antes de salir de la base")}</SectionLabel>
          {beforeEva.map((test) => (
            <div key={test.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed bg-card px-5 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-info-soft text-info-strong">
                <Rocket aria-hidden className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">
                  {t(test.title)} <span className="font-normal text-muted-foreground">· {test.minutes} min</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {t(test.description)} {t("Se hace en el check-out de la esclusa ({when}).", { when: t(test.note).toLowerCase() })}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-4">
                <Link href={href(test)} className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline">
                  {t("Practicar ahora")}
                </Link>
                <Button asChild variant="outline">
                  <Link href="/esclusa">{t("Ir a la esclusa")}</Link>
                </Button>
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/** Cuánto falta (Goal-gradient) y un único botón principal al siguiente test. */
function Progress({ pending, doneCount, href }: { pending: TestStatus[]; doneCount: number; href: (test: TestStatus) => string }) {
  const total = pending.length + doneCount;
  const minutes = pending.reduce((sum, x) => sum + x.minutes, 0);
  const next = pending[0];
  const pct = total ? Math.round((doneCount / total) * 100) : 100;

  if (!next) {
    return (
      <section className="flex items-center gap-4 rounded-2xl border-2 border-ok bg-ok-soft p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ok text-white">
          <Check aria-hidden className="size-6" />
        </span>
        <span className="flex flex-col">
          <span className="text-2xl font-bold text-ok-strong">{t("Todo al día")}</span>
          <span className="text-sm">{t("No hay tests pendientes. Los resultados ya están en tu ficha.")}</span>
        </span>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border-2 border-warn bg-warn-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="text-2xl font-bold">
          {tn(pending.length, "Te falta {n} test", "Te faltan {n} tests")}
          <span className="whitespace-nowrap font-normal text-muted-foreground"> · {t("unos {n} min", { n: minutes })}</span>
        </h2>
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={doneCount}
            aria-label={t("Tests hechos")}
            className="h-2.5 max-w-sm flex-1 overflow-hidden rounded-full bg-card"
          >
            <div className="h-full rounded-full bg-ok" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold">{t("{done} de {total} hechos", { done: doneCount, total })}</span>
        </div>
        <span className="text-sm text-muted-foreground">{t("Cada test actualiza tu ficha al terminar.")}</span>
      </div>
      <Button asChild size="lg" className="shrink-0">
        <Link href={href(next)}>
          {t("Empezar: {test}", { test: t(next.title) })}
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </Button>
    </section>
  );
}

function PendingCard({ test, n, next, href }: { test: TestStatus; n: number; next: boolean; href: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 rounded-2xl border bg-card px-5 py-4", next && "border-2 border-primary")}>
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
          next ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{t(test.title)}</span>
          {next && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{t("Siguiente")}</span>}
        </span>
        <span className="text-sm text-muted-foreground">{t(test.description)}</span>
        <span className="text-sm">
          <span className="font-semibold">{test.minutes} min</span> · {t("para")} <span className="font-semibold text-warn-strong">{t(test.due)}</span>
        </span>
      </span>
      {/* Un solo botón principal en la pantalla (el de arriba); acá todos son secundarios. */}
      <Button asChild variant="outline" size="lg">
        <Link href={href}>{t("Empezar")}</Link>
      </Button>
    </div>
  );
}

function DoneRow({ test, href }: { test: TestStatus; href: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok-strong">
        <Check aria-hidden className="size-4" />
      </span>
      <span className="min-w-40 flex-1 font-semibold">{t(test.title)}</span>
      <span className="text-sm text-muted-foreground">{test.doneAt ? whenDone(test.doneAt) : t(test.note)}</span>
      {test.last && test.doneAt === test.last.at && <StatusPill tone={test.last.tone} label={test.last.plain} />}
      <Link href={href} className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline">
        {t("Repetir")}
      </Link>
    </div>
  );
}

/** "Hoy a las 08:12", "Ayer" o "Hace 3 días". */
function whenDone(iso: string): string {
  const now = new Date();
  if (isSameDay(iso, now)) return t("Hoy a las {time}", { time: formatTime(iso) });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(iso, yesterday)) return t("Ayer");
  const days = Math.round((now.getTime() - new Date(iso).getTime()) / 86400_000);
  return t("Hace {n} días", { n: days });
}
