import type { Tone } from "@/shared/domain/status";
import type { ParameterId } from "./types";

/**
 * Mapa corporal (M2 del documento): agrupa por zona del cuerpo los indicadores diarios y los estudios periódicos.
 * Solo dice DÓNDE está el problema; el detalle (evolución, por qué importa) vive en las pestañas "Resumen" y "Estudios".
 *
 * Coordenadas: la figura se normaliza a 600 de alto. `x` es el desplazamiento desde la línea media
 * (positivo = izquierda del cuerpo, que en vista frontal queda a la derecha de quien mira) e `y` la altura desde la coronilla.
 * Proporciones de referencia (medidas sobre ambas siluetas): ojos 6 %, mentón 12 %, hombros 19 %, corazón 27 %,
 * ombligo 40 %, rodillas 74 % del alto.
 */
export interface BodySpot {
  x: number;
  y: number;
  /** Radio de la zona (halo cuando hay algo para atender). */
  r: number;
}

export interface BodyZone {
  id: string;
  /** Nombre completo, en el panel de detalle. */
  name: string;
  /** Nombre corto, en la etiqueta de la figura. */
  short: string;
  parameters: ParameterId[];
  /** Ids de paneles de laboratorio (NASA Standard Measures) que corresponden a la zona. */
  labPanels: string[];
  /** Puntos anatómicos de la zona; la línea guía de su tarjeta llega a todos. */
  spots: BodySpot[];
  /** Lado y altura (centro) de la tarjeta, en la misma escala de 600. Alineada con su órgano para que la línea quede recta. */
  label: { side: "left" | "right"; y: number };
}

/** Forma mínima de un panel de laboratorio: la ruta los pasa desde el módulo labs (monitoring no depende de labs). */
export interface BodyLabPanel {
  id: string;
  name: string;
  last: string;
  rows: { label: string; plain: string; tone: Tone; detail?: string }[];
}

export const BODY_ZONES: BodyZone[] = [
  {
    id: "mind",
    name: "Mente y sueño",
    short: "Mente y sueño",
    parameters: ["sleep", "mood", "cohesion", "pvt"],
    labPanels: ["cognition", "cortisol"],
    spots: [{ x: 0, y: 20, r: 18 }],
    label: { side: "left", y: 20 },
  },
  {
    id: "eyes",
    name: "Ojos",
    short: "Ojos",
    // La irritación post-salida por polvo lunar afecta ojos y vías respiratorias: aparece en ambas zonas.
    parameters: ["dustIrritation"],
    labPanels: ["ocular"],
    spots: [
      { x: -10, y: 37, r: 7 },
      { x: 10, y: 37, r: 7 },
    ],
    label: { side: "left", y: 82 },
  },
  {
    id: "balance",
    name: "Equilibrio (oído interno)",
    short: "Equilibrio",
    parameters: [],
    labPanels: ["sensorimotor"],
    spots: [{ x: 28, y: 39, r: 8 }],
    label: { side: "right", y: 39 },
  },
  {
    id: "lungs",
    name: "Pulmones y vías respiratorias",
    short: "Pulmones",
    parameters: ["spo2", "dustIrritation"],
    labPanels: [],
    spots: [
      { x: -28, y: 152, r: 28 },
      { x: 28, y: 152, r: 28 },
    ],
    label: { side: "left", y: 152 },
  },
  {
    id: "heart",
    name: "Corazón y circulación",
    short: "Corazón",
    parameters: ["bloodPressure", "restingHr"],
    labPanels: ["carotid"],
    spots: [{ x: 12, y: 164, r: 16 }],
    label: { side: "right", y: 164 },
  },
  {
    id: "metabolism",
    name: "Metabolismo, nutrición y defensas",
    short: "Metabolismo",
    parameters: ["glucose", "temperature", "hydration", "nutrition"],
    labPanels: ["blood", "immune", "microbiome"],
    spots: [{ x: 0, y: 236, r: 30 }],
    label: { side: "right", y: 236 },
  },
  {
    id: "musculoskeletal",
    name: "Huesos, músculos y articulaciones",
    short: "Huesos y músculos",
    parameters: ["exercise", "decompression"],
    labPanels: ["bone", "fitness"],
    // Caderas y rodillas: grandes articulaciones de carga. Quedan por debajo del resto de las zonas,
    // así la línea de esta categoría no cruza la de ninguna otra.
    spots: [
      { x: -28, y: 442, r: 14 },
      { x: 28, y: 442, r: 14 },
      { x: -34, y: 290, r: 13 },
      { x: 34, y: 290, r: 13 },
    ],
    label: { side: "left", y: 442 },
  },
];
