import { dayKey } from "@/shared/domain/intake-day";
import type { Astronaut, Reading } from "@/modules/monitoring/domain/types";
import { dailyTargets, dayTotals } from "./targets";
import type { IntakeEntry } from "./types";

export const intakeReadingId = (astronautId: string, parameter: "hydration" | "nutrition", key: string) => `${astronautId}-${parameter}-day-${key}`;

/**
 * Convierte el registro de un día en las lecturas diarias de monitoring (una de hidratación y una de alimentación),
 * así el estado, el mapa corporal y la evolución las usan como a cualquier otro parámetro.
 * La lectura lleva la hora del último registro: con eso se sabe si el día está en curso.
 */
export function intakeDayReadings(
  astronaut: Pick<Astronaut, "id" | "sex" | "massKg">,
  allEntries: IntakeEntry[],
  key: string,
): { upsert: Reading[]; removeIds: string[] } {
  const entries = allEntries.filter((e) => e.astronautId === astronaut.id && dayKey(e.at) === key);
  const hydrationId = intakeReadingId(astronaut.id, "hydration", key);
  const nutritionId = intakeReadingId(astronaut.id, "nutrition", key);
  if (entries.length === 0) return { upsert: [], removeIds: [hydrationId, nutritionId] };

  const at = entries.map((e) => e.at).sort().at(-1)!;
  const totals = dayTotals(entries);
  const target = dailyTargets(astronaut).nutrients.energy;
  const kcal = Math.round(totals.nutrients.energy);
  const base = { astronautId: astronaut.id, at, source: "registro-alimentos" as const };
  const upsert: Reading[] = [];
  const removeIds: string[] = [];
  if (totals.waterMl > 0) upsert.push({ ...base, id: hydrationId, parameterId: "hydration", value: totals.waterMl });
  else removeIds.push(hydrationId);
  if (kcal > 0) upsert.push({ ...base, id: nutritionId, parameterId: "nutrition", value: Math.round((kcal / target) * 100), value2: kcal });
  else removeIds.push(nutritionId);
  return { upsert, removeIds };
}
