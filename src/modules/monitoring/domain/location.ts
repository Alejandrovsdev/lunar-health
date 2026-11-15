import type { Location } from "./types";

/**
 * Etiquetas de ubicación según la terminología de Artemis Base Camp:
 * el Surface Habitat es el núcleo de la base; afuera, la tripulación está en EVA (actividad extravehicular).
 * El valor interno ("interior" | "exterior") no cambia: solo lo que ve el usuario.
 */
export const LOCATION_LABEL: Record<Location, { group: string; short: string; detail: string; count: (n: number) => string }> = {
  exterior: {
    group: "En EVA · superficie lunar",
    short: "EVA",
    detail: "En EVA · superficie lunar",
    count: (n) => `${n} en EVA`,
  },
  interior: {
    group: "En el hábitat",
    short: "Hábitat",
    detail: "En el hábitat · base",
    count: (n) => `${n} en el hábitat`,
  },
};

/** Orden de los grupos en el tablero: primero quien está expuesto (EVA). */
export const LOCATION_ORDER: Location[] = ["exterior", "interior"];
