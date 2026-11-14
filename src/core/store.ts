"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createMonitoringSlice, monitoringInitialState } from "@/modules/monitoring/data/slice";
import { createAirlockSlice, airlockInitialState } from "@/modules/airlock/data/slice";
import { createAssessmentsSlice, assessmentsInitialState } from "@/modules/assessments/data/slice";
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
      seededAt: new Date().toISOString(),
      resetDemo: () =>
        set({
          ...monitoringInitialState(),
          ...airlockInitialState(),
          ...assessmentsInitialState(),
          seededAt: new Date().toISOString(),
        }),
    }),
    {
      name: "lunar-health-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
