/** API pública del módulo de nutrición (registro diario de comidas y bebidas, y aportes contra las metas de la NASA). */
export type { Food, IntakeEntry, Meal, NutrientId, DayTotals } from "./domain/types";
export { FOODS, FOOD_BY_ID, SUIT_WATER_ID } from "./domain/foods";
export { NUTRIENTS, MEALS, dailyTargets, dayTotals, energyTarget, evaluateNutrient } from "./domain/targets";
export { NutritionLog } from "./ui/nutrition-log";
