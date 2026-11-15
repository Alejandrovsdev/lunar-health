import type { Food, FoodCategory, NutrientId } from "./types";

/**
 * Menú de la base (ilustrativo). Valores aproximados por porción, inspirados en el sistema de comida
 * de la NASA: rehidratables, termoestabilizados, naturales y verduras de la huerta de la base.
 * Orden de los aportes: kcal, proteína (g), fibra (g), calcio (mg), vitamina D (UI), sodio (mg).
 */
type Row = [id: string, name: string, category: FoodCategory, serving: string, origin: string, waterMl: number, n: [number, number, number, number, number, number], hidden?: boolean];

const ROWS: Row[] = [
  ["water-250", "Agua", "Bebidas", "1 vaso (250 mL)", "Agua reciclada de la base", 250, [0, 0, 0, 0, 0, 0]],
  ["water-500", "Agua (botella)", "Bebidas", "1 botella (500 mL)", "Agua reciclada de la base", 500, [0, 0, 0, 0, 0, 0]],
  ["coffee", "Café", "Bebidas", "1 taza (240 mL)", "Rehidratable", 240, [5, 0, 0, 5, 0, 5]],
  ["tea", "Té", "Bebidas", "1 taza (240 mL)", "Rehidratable", 240, [2, 0, 0, 0, 0, 5]],
  ["orange-juice", "Jugo de naranja", "Bebidas", "1 vaso (240 mL)", "Rehidratable", 240, [110, 1, 0, 20, 0, 10]],
  ["electrolytes", "Bebida con electrolitos", "Bebidas", "1 botella (500 mL)", "Rehidratable", 500, [30, 0, 0, 0, 0, 230]],

  ["oatmeal", "Avena con frutos rojos", "Desayuno", "1 sobre", "Rehidratable", 150, [250, 8, 6, 110, 40, 200]],
  ["eggs", "Huevos revueltos", "Desayuno", "1 sobre", "Rehidratable", 60, [220, 14, 0, 60, 80, 450]],
  ["tortilla", "Tortilla de harina", "Desayuno", "1 unidad", "Natural", 0, [140, 4, 1, 60, 0, 340]],
  ["granola", "Granola con almendras", "Desayuno", "1 bolsa", "Natural", 0, [230, 6, 4, 40, 0, 90]],

  ["chicken-curry", "Pollo al curry con arroz", "Platos principales", "1 bandeja", "Termoestabilizado", 0, [420, 30, 3, 50, 10, 760]],
  ["beef-bbq", "Carne con salsa barbacoa", "Platos principales", "1 bandeja", "Termoestabilizado", 0, [380, 28, 1, 30, 5, 700]],
  ["salmon", "Salmón", "Platos principales", "1 bandeja", "Termoestabilizado", 0, [300, 26, 0, 25, 520, 410]],
  ["lentils", "Lentejas guisadas", "Platos principales", "1 bandeja", "Termoestabilizado", 0, [280, 16, 9, 50, 0, 430]],
  ["mac-cheese", "Fideos con queso", "Platos principales", "1 sobre", "Rehidratable", 120, [360, 15, 2, 250, 20, 690]],
  ["tofu", "Tofu salteado con verduras", "Platos principales", "1 bandeja", "Termoestabilizado", 0, [260, 18, 4, 300, 0, 520]],
  ["veggie-soup", "Sopa de verduras", "Platos principales", "1 sobre", "Rehidratable", 250, [120, 4, 4, 40, 0, 560]],

  ["greens", "Hojas verdes de la huerta", "Acompañamientos", "1 plato", "Huerta de la base", 0, [20, 2, 2, 60, 0, 15]],
  ["grilled-veg", "Verduras grilladas", "Acompañamientos", "1 sobre", "Rehidratable", 80, [100, 3, 4, 50, 0, 240]],
  ["mashed-potatoes", "Puré de papas", "Acompañamientos", "1 sobre", "Rehidratable", 120, [190, 4, 2, 40, 0, 400]],
  ["brown-rice", "Arroz integral", "Acompañamientos", "1 sobre", "Rehidratable", 80, [210, 5, 3, 20, 0, 10]],

  ["milk", "Leche", "Lácteos", "1 vaso (240 mL)", "En polvo, reconstituida", 220, [150, 8, 0, 290, 120, 120]],
  ["yogurt", "Yogur", "Lácteos", "1 pote", "Liofilizado", 120, [140, 9, 0, 260, 100, 95]],
  ["cheese", "Queso en cubos", "Lácteos", "30 g", "Natural", 0, [120, 7, 0, 200, 10, 190]],

  ["nuts", "Mix de frutos secos", "Colaciones", "1 bolsa (40 g)", "Natural", 0, [200, 6, 3, 50, 0, 60]],
  ["cereal-bar", "Barra de cereal", "Colaciones", "1 barra", "Natural", 0, [190, 4, 3, 20, 0, 110]],
  ["dried-peach", "Durazno deshidratado", "Colaciones", "1 bolsa", "Natural", 0, [120, 1, 3, 15, 0, 10]],
  ["peanut-butter", "Pasta de maní", "Colaciones", "1 sobre", "Natural", 0, [190, 8, 2, 15, 0, 150]],
  ["cookies", "Galletas de chocolate", "Colaciones", "1 paquete", "Natural", 0, [210, 2, 1, 15, 0, 160]],

  ["vitamin-d", "Vitamina D (comprimido)", "Suplementos", "1 comprimido (800 UI)", "Suplemento indicado", 0, [0, 0, 0, 0, 800, 0]],

  ["suit-water", "Agua de la bolsa del traje", "EVA", "bolsa completa (950 mL)", "Traje", 950, [0, 0, 0, 0, 0, 0], true],
];

const KEYS: NutrientId[] = ["energy", "protein", "fiber", "calcium", "vitaminD", "sodium"];

export const FOODS: Food[] = ROWS.map(([id, name, category, serving, origin, waterMl, n, hidden]) => ({
  id,
  name,
  category,
  serving,
  origin,
  waterMl,
  hidden,
  nutrients: Object.fromEntries(KEYS.map((k, i) => [k, n[i]])) as Record<NutrientId, number>,
}));

export const FOOD_BY_ID = new Map(FOODS.map((f) => [f.id, f]));

export const SUIT_WATER_ID = "suit-water";

export const FOOD_CATEGORIES: FoodCategory[] = ["Bebidas", "Desayuno", "Platos principales", "Acompañamientos", "Lácteos", "Colaciones", "Suplementos"];
