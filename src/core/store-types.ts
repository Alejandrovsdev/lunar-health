import type { MonitoringSlice } from "@/modules/monitoring/data/slice";
import type { AirlockSlice } from "@/modules/airlock/data/slice";
import type { AssessmentsSlice } from "@/modules/assessments/data/slice";
import type { NutritionSlice } from "@/modules/nutrition/data/slice";

/**
 * Estado de la demo: composición de los slices de cada módulo.
 * Cada módulo es dueño de su slice; los demás lo usan solo a través de sus acciones.
 */
export type AppState = MonitoringSlice &
  AirlockSlice &
  AssessmentsSlice &
  NutritionSlice & {
    seededAt: string;
    resetDemo: () => void;
  };
