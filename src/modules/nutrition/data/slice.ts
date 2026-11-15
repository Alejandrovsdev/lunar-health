import type { StateCreator } from "zustand";
import type { AppState } from "@/core/store-types";
import { dayKey } from "@/shared/domain/intake-day";
import { newId } from "@/modules/monitoring/data/slice";
import { intakeDayReadings } from "../domain/readings";
import type { IntakeEntry, Meal } from "../domain/types";
import { seedIntakeLog } from "./seed";

export interface NutritionSlice {
  intakeLog: IntakeEntry[];
  /**
   * Registra una comida o bebida y actualiza las lecturas diarias de hidratación y alimentación.
   * Devuelve el id del registro (para poder deshacerlo), o null si no se registró nada.
   */
  logIntake: (astronautId: string, foodId: string, servings: number, meal: Meal, at?: string) => string | null;
  removeIntake: (entryId: string) => void;
  /** Corrige la cantidad de un registro (porciones > 0). */
  updateIntakeServings: (entryId: string, servings: number) => void;
}

export function nutritionInitialState() {
  return { intakeLog: seedIntakeLog() };
}

export const createNutritionSlice: StateCreator<AppState, [], [], NutritionSlice> = (set, get) => {
  /** Recalcula las lecturas del día a partir del registro (fuente de verdad). */
  const sync = (astronautId: string, key: string) => {
    const s = get();
    const astronaut = s.astronauts.find((a) => a.id === astronautId);
    if (!astronaut) return;
    const { upsert, removeIds } = intakeDayReadings(astronaut, s.intakeLog, key);
    s.upsertReadings(upsert, removeIds);
  };

  return {
    ...nutritionInitialState(),

    logIntake: (astronautId, foodId, servings, meal, at = new Date().toISOString()) => {
      if (!(servings > 0)) return null;
      const entry: IntakeEntry = { id: newId("intake"), astronautId, foodId, servings, meal, at };
      set((s) => ({ intakeLog: [...s.intakeLog, entry] }));
      sync(astronautId, dayKey(at));
      return entry.id;
    },

    removeIntake: (entryId) => {
      const entry = get().intakeLog.find((e) => e.id === entryId);
      if (!entry) return;
      set((s) => ({ intakeLog: s.intakeLog.filter((e) => e.id !== entryId) }));
      sync(entry.astronautId, dayKey(entry.at));
    },

    updateIntakeServings: (entryId, servings) => {
      const entry = get().intakeLog.find((e) => e.id === entryId);
      if (!entry || !(servings > 0)) return;
      const rounded = Math.round(servings * 100) / 100;
      set((s) => ({ intakeLog: s.intakeLog.map((e) => (e.id === entryId ? { ...e, servings: rounded } : e)) }));
      sync(entry.astronautId, dayKey(entry.at));
    },
  };
};
