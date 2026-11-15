import { isSameDay } from "@/shared/lib/format";
import type { IntakeEntry, Meal } from "../domain/types";

/**
 * Registro de hoy para la demo (los días anteriores vienen como lecturas diarias en el seed de monitoring).
 * - Ortega ya desayunó.
 * - Varga volvió de una EVA hace 3 h: la esclusa cargó el agua de la bolsa del traje y después tomó electrolitos.
 * - Sato todavía no registró nada (su estado muestra el día de ayer, que fue flojo de agua).
 * Solo se cargan registros de hoy que ya pasaron.
 */
export function seedIntakeLog(now = new Date()): IntakeEntry[] {
  const at = (hour: number, minute: number) => {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const returnedAt = new Date(now.getTime() - 3 * 3600_000);
  const plan: { astronautId: string; foodId: string; servings: number; meal: Meal; at: Date }[] = [
    ...(["oatmeal", "eggs", "coffee", "milk", "water-500", "vitamin-d"] as const).map((foodId) => ({
      astronautId: "ortega",
      foodId,
      servings: 1,
      meal: "desayuno" as const,
      at: at(7, 40),
    })),
    { astronautId: "varga", foodId: "suit-water", servings: 0.7, meal: "eva", at: returnedAt },
    { astronautId: "varga", foodId: "electrolytes", servings: 1, meal: "colacion", at: new Date(returnedAt.getTime() + 20 * 60_000) },
  ];
  return plan
    .filter((p) => p.at.getTime() <= now.getTime() && isSameDay(p.at, now))
    .map((p, i) => ({ id: `seed-intake-${p.astronautId}-${i}`, astronautId: p.astronautId, foodId: p.foodId, servings: p.servings, meal: p.meal, at: p.at.toISOString() }));
}
