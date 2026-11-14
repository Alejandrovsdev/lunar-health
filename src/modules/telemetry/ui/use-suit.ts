"use client";

import { useNow } from "@/shared/lib/use-now";
import type { EvaSession } from "../domain/types";
import { suitSnapshot } from "../domain/suit";
import { evaPosition } from "../domain/route";

/** Datos en vivo de un astronauta en EVA (simulados, se actualizan cada segundo). */
export function useSuit(eva: EvaSession | undefined) {
  const now = useNow(1000);
  if (!eva) return null;
  const snapshot = suitSnapshot(eva.startedAt, now, eva.plannedHours);
  const position = evaPosition(snapshot.elapsedS, eva.plannedHours);
  return { snapshot, position };
}
