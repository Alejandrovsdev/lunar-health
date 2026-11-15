import { t } from "@/shared/i18n";
import type { Location } from "./types";

/**
 * Etiquetas de ubicación según la terminología de Artemis Base Camp:
 * el Surface Habitat es el núcleo de la base; afuera, la tripulación está en EVA (actividad extravehicular).
 * El valor interno ("interior" | "exterior") no cambia: solo lo que ve el usuario.
 * Los textos se traducen donde se muestran (t()); `count` ya devuelve el texto traducido.
 */
export const LOCATION_LABEL: Record<Location, { group: string; short: string; detail: string; count: (n: number) => string }> = {
  exterior: {
    group: "En EVA · superficie lunar",
    short: "EVA",
    detail: "En EVA · superficie lunar",
    count: (n) => t("{n} en EVA", { n }),
  },
  interior: {
    group: "En el hábitat",
    short: "Hábitat",
    detail: "En el hábitat · base",
    count: (n) => t("{n} en el hábitat", { n }),
  },
};

/** Orden de los grupos en el tablero: primero quien está expuesto (EVA). */
export const LOCATION_ORDER: Location[] = ["exterior", "interior"];
