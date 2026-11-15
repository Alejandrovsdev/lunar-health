"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createMonitoringSlice, monitoringInitialState } from "@/modules/monitoring/data/slice";
import { createAirlockSlice, airlockInitialState } from "@/modules/airlock/data/slice";
import { createAssessmentsSlice, assessmentsInitialState } from "@/modules/assessments/data/slice";
import { createNutritionSlice, nutritionInitialState } from "@/modules/nutrition/data/slice";
import type { AppState } from "./store-types";

/**
 * Repositorio de la demo: un store en el navegador (localStorage).
 * Para pasar a un backend, reemplazar este archivo por llamadas a una API
 * manteniendo las mismas acciones; la UI de los módulos no cambia.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createMonitoringSlice(set, get, api),
      ...createAirlockSlice(set, get, api),
      ...createAssessmentsSlice(set, get, api),
      ...createNutritionSlice(set, get, api),
      seededAt: new Date().toISOString(),
      resetDemo: () =>
        set({
          ...monitoringInitialState(),
          ...airlockInitialState(),
          ...assessmentsInitialState(),
          ...nutritionInitialState(),
          seededAt: new Date().toISOString(),
        }),
    }),
    {
      name: "lunar-health-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 6,
      /**
       * v2: fotos de perfil. v3/v4: compañero/a y variante de traje por integrante de la EVA
       * (datos anteriores no son coherentes: se descartan y la demo arranca de cero).
       * v5: sexo de cada astronauta (figura del mapa corporal): se completa sin reiniciar.
       * v6: hidratación, alimentación (registro de comidas) y radiación acumulada: se completan con la demo sin reiniciar.
       */
      migrate: (persisted, version) => {
        if (version < 4) return {} as AppState;
        const state = persisted as AppState;
        if (version < 5) {
          const seed = new Map(monitoringInitialState().astronauts.map((a) => [a.id, a.sex]));
          state.astronauts = state.astronauts.map((a) => ({ ...a, sex: a.sex ?? seed.get(a.id) ?? "female" }));
        }
        if (version < 6) {
          const seed = monitoringInitialState();
          const byId = new Map(seed.astronauts.map((a) => [a.id, a]));
          state.astronauts = state.astronauts.map((a) => ({
            ...a,
            massKg: a.massKg ?? byId.get(a.id)?.massKg ?? 70,
            radiationMSv: a.radiationMSv ?? byId.get(a.id)?.radiationMSv ?? 20,
          }));
          const intake = new Set(["hydration", "nutrition"]);
          state.readings = [...state.readings.filter((r) => !intake.has(r.parameterId)), ...seed.readings.filter((r) => intake.has(r.parameterId))];
          state.intakeLog = nutritionInitialState().intakeLog;
        }
        return state;
      },
    },
  ),
);
