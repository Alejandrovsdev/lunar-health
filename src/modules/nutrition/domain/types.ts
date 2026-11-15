export type NutrientId = "energy" | "protein" | "fiber" | "calcium" | "vitaminD" | "sodium";

export type Meal = "desayuno" | "almuerzo" | "merienda" | "cena" | "colacion" | "eva";

export type FoodCategory = "Bebidas" | "Desayuno" | "Platos principales" | "Acompañamientos" | "Lácteos" | "Colaciones" | "Suplementos" | "EVA";

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  /** Porción de referencia, en palabras ("1 sobre", "1 taza (240 mL)"). */
  serving: string;
  /** Cómo llega a la base: rehidratable, termoestabilizado, natural, huerta de la base… */
  origin: string;
  /** Agua que aporta la porción (bebidas y agua de rehidratación), en mL. */
  waterMl: number;
  /** Aportes por porción. */
  nutrients: Record<NutrientId, number>;
  /** No se ofrece en el buscador (p. ej. la bolsa del traje, que la carga la esclusa). */
  hidden?: boolean;
}

export interface IntakeEntry {
  id: string;
  astronautId: string;
  foodId: string;
  /** Porciones (puede ser fracción: media porción, 40 % de la bolsa del traje…). */
  servings: number;
  meal: Meal;
  at: string;
}

export interface DayTotals {
  nutrients: Record<NutrientId, number>;
  waterMl: number;
  entries: number;
}
