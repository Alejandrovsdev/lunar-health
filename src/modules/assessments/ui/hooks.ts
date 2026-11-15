"use client";

import { useMemo } from "react";
import { useAppStore } from "@/core/store";
import { isSameDay } from "@/shared/lib/format";
import { TESTS, type TestDefinition } from "../domain/catalog";
import type { AssessmentResult, TestId } from "../domain/types";

export type TestState = "done" | "pending" | "scheduled";

export interface TestStatus extends TestDefinition {
  state: TestState;
  last?: AssessmentResult;
  note: string;
  /** Cuándo se hizo por última vez dentro del período vigente (si está hecho). */
  doneAt?: string;
  /** Hasta cuándo hay tiempo: "hoy", "esta semana", "este mes" o "antes de salir". */
  due: string;
}

export function useLatestResult(astronautId: string, testId: TestId) {
  const results = useAppStore((s) => s.assessmentResults);
  return useMemo(() => results.filter((r) => r.astronautId === astronautId && r.testId === testId).at(-1), [results, astronautId, testId]);
}

/** Estado de cada test para hoy: hecho, pendiente o programado. */
export function useTestStatuses(astronautId: string): TestStatus[] {
  const results = useAppStore((s) => s.assessmentResults);
  const readings = useAppStore((s) => s.readings);
  const astronaut = useAppStore((s) => s.astronauts.find((a) => a.id === astronautId));

  return useMemo(() => {
    const now = new Date();
    const last = (id: TestId) => results.filter((r) => r.astronautId === astronautId && r.testId === id).at(-1);
    // La semilla trae lecturas de convivencia: cuentan como cuestionario semanal hecho.
    const lastCohesion = readings.filter((r) => r.astronautId === astronautId && r.parameterId === "cohesion").at(-1);

    return TESTS.map((t) => {
      const l = last(t.id);
      if (t.frequency === "daily") {
        const doneToday = l && isSameDay(l.at, now);
        return { ...t, last: l, due: "hoy", doneAt: doneToday ? l!.at : undefined, state: doneToday ? "done" : "pending", note: doneToday ? `Hecho hoy · ${l!.plain}` : "Pendiente hoy" } as TestStatus;
      }
      if (t.frequency === "weekly") {
        const at = l?.at ?? lastCohesion?.at;
        const fresh = at && now.getTime() - new Date(at).getTime() < 6 * 86400_000;
        return { ...t, last: l, due: "esta semana", doneAt: fresh ? at : undefined, state: fresh ? "done" : "pending", note: fresh ? "Hecho esta semana" : "Pendiente esta semana" } as TestStatus;
      }
      if (t.frequency === "monthly") {
        const fresh = l && now.getTime() - new Date(l.at).getTime() < 30 * 86400_000;
        return {
          ...t,
          last: l,
          due: "este mes",
          doneAt: fresh ? l!.at : undefined,
          state: fresh ? "done" : "pending",
          note: fresh ? `Hecho este mes · ${l!.plain}` : "Pendiente este mes",
        } as TestStatus;
      }
      const evaSoon = astronaut?.nextEva && new Date(astronaut.nextEva.at).getTime() - now.getTime() < 24 * 3600_000;
      const doneToday = l && isSameDay(l.at, now);
      return {
        ...t,
        last: l,
        due: "antes de salir",
        doneAt: doneToday ? l!.at : undefined,
        state: doneToday ? "done" : "scheduled",
        note: doneToday ? `Hecho hoy · ${l!.plain}` : evaSoon ? "Antes de la salida de mañana" : "Antes de cada salida",
      } as TestStatus;
    });
  }, [results, readings, astronaut, astronautId]);
}

export function usePendingTestsCount(astronautId: string) {
  return useTestStatuses(astronautId).filter((t) => t.state === "pending").length;
}
