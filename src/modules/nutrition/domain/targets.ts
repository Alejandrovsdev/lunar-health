import type { Tone } from "@/shared/domain/status";
import type { Sex } from "@/modules/monitoring/domain/types";
import { FOOD_BY_ID } from "./foods";
import type { DayTotals, IntakeEntry, Meal, NutrientId } from "./types";

/**
 * Metas diarias según los requerimientos nutricionales de la NASA para misiones de exploración
 * (NASA-STD-3001 Vol. 2 y Smith et al., "Nutritional requirements for exploration missions"):
 * - Energía: ecuaciones de la OMS (30–60 años) × 1,7 de actividad.
 * - Proteína: al menos 0,8 g por kg (y no más del 35 % de las calorías).
 * - Fibra: 10 a 14 g cada 1.000 kcal. Calcio: 1.000 a 1.200 mg. Vitamina D: 800 UI.
 * - Sodio: 1.500 a 2.300 mg (la comida envasada suele pasarse). Líquidos: ≥ 2.000 mL, idealmente 1 mL por kcal.
 */
export interface NutrientDefinition {
  id: NutrientId;
  label: string;
  unit: string;
  /** "min": hay que llegar; "max": no hay que pasarse; "range": llegar sin pasarse demasiado. */
  kind: "min" | "max" | "range";
  why: string;
}

export const NUTRIENTS: NutrientDefinition[] = [
  { id: "energy", label: "Energía", unit: "kcal", kind: "range", why: "Comer menos de lo que gastás acelera la pérdida de músculo y hueso." },
  { id: "protein", label: "Proteína", unit: "g", kind: "min", why: "Ayuda a conservar el músculo que la menor gravedad tiende a reducir." },
  { id: "fiber", label: "Fibra", unit: "g", kind: "min", why: "Cuida la digestión con una dieta de comidas envasadas." },
  { id: "calcium", label: "Calcio", unit: "mg", kind: "min", why: "Con menos gravedad el hueso pierde calcio." },
  { id: "vitaminD", label: "Vitamina D", unit: "UI", kind: "min", why: "En la base no hay sol: viene de la comida y del suplemento." },
  { id: "sodium", label: "Sodio (sal)", unit: "mg", kind: "max", why: "El exceso de sal aumenta la pérdida de hueso y la presión arterial." },
];

export interface DailyTargets {
  nutrients: Record<NutrientId, number>;
  waterMinMl: number;
  waterIdealMl: number;
}

export function energyTarget(sex: Sex, massKg: number): number {
  const bmr = sex === "male" ? 11.6 * massKg + 879 : 8.7 * massKg + 829;
  return Math.round((bmr * 1.7) / 10) * 10;
}

export function dailyTargets({ sex, massKg }: { sex: Sex; massKg: number }): DailyTargets {
  const energy = energyTarget(sex, massKg);
  return {
    nutrients: {
      energy,
      protein: Math.round(0.8 * massKg),
      fiber: Math.round((energy / 1000) * 10),
      calcium: 1000,
      vitaminD: 800,
      sodium: 2300,
    },
    waterMinMl: 2000,
    waterIdealMl: Math.max(2000, Math.round(energy / 50) * 50),
  };
}

export function dayTotals(entries: IntakeEntry[]): DayTotals {
  const nutrients: Record<NutrientId, number> = { energy: 0, protein: 0, fiber: 0, calcium: 0, vitaminD: 0, sodium: 0 };
  let waterMl = 0;
  for (const e of entries) {
    const food = FOOD_BY_ID.get(e.foodId);
    if (!food) continue;
    for (const k of Object.keys(nutrients) as NutrientId[]) nutrients[k] += food.nutrients[k] * e.servings;
    waterMl += food.waterMl * e.servings;
  }
  return { nutrients, waterMl: Math.round(waterMl), entries: entries.length };
}

/**
 * Estado de un nutriente en el día. `progress` = fracción del día de ingesta transcurrida
 * (si el día está en curso, quedarse corto todavía no es una falta).
 */
export function evaluateNutrient(kind: NutrientDefinition["kind"], value: number, target: number, progress: number): { tone: Tone; plain: string } {
  if (kind === "max") {
    if (value > target * 1.5) return { tone: "bad", plain: "Muy alto" };
    if (value > target) return { tone: "warn", plain: "De más" };
    return { tone: "ok", plain: "Dentro del límite" };
  }
  if (kind === "range" && value > target * 1.25) return { tone: "warn", plain: "De más" };
  const minimum = kind === "range" ? target * 0.9 : target;
  if (value >= minimum) return { tone: "ok", plain: "Cubierto" };
  if (progress >= 1) return value < minimum * 0.75 ? { tone: "bad", plain: "Faltó mucho" } : { tone: "warn", plain: "Faltó" };
  if (progress < 0.15 || value >= minimum * progress * 0.6) return { tone: "pending", plain: "En camino" };
  return { tone: "warn", plain: "Atrasado" };
}

export const MEALS: { id: Meal; label: string }[] = [
  { id: "desayuno", label: "Desayuno" },
  { id: "almuerzo", label: "Almuerzo" },
  { id: "merienda", label: "Merienda" },
  { id: "cena", label: "Cena" },
  { id: "colacion", label: "Colación" },
  { id: "eva", label: "Durante la EVA" },
];

export const MEAL_LABEL = Object.fromEntries(MEALS.map((m) => [m.id, m.label])) as Record<Meal, string>;

/** Comida sugerida según la hora. */
export function mealForHour(hour: number): Meal {
  if (hour < 11) return "desayuno";
  if (hour < 15) return "almuerzo";
  if (hour < 19) return "merienda";
  return "cena";
}
