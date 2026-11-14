import type { ParameterId } from "./types";

/** Mapa corporal (M2 del documento): cada zona se vincula a parámetros y a riesgos HRP. */
export interface BodyZone {
  id: string;
  name: string;
  x: number;
  y: number;
  parameters: ParameterId[];
  function: string;
  space: string;
  todo: string;
  /** Dato informativo que no es un parámetro diario (p. ej. densidad ósea de laboratorio). */
  note?: { plain: string; detail: string };
}

export const BODY_ZONES: BodyZone[] = [
  {
    id: "brain",
    name: "Cerebro y ojos",
    x: 150,
    y: 50,
    parameters: ["sleep", "mood", "pvt"],
    function: "Piensa, decide y controla la visión.",
    space:
      "Los fluidos suben a la cabeza y pueden inflamar el nervio óptico (SANS): cerca del 70 % de los astronautas de la ISS tiene alguna inflamación ocular. Dormir poco afecta el ánimo y las decisiones.",
    todo: "Dormí 7 a 9 h, hacé el test visual semanal y avisá si el sueño sigue en rojo.",
  },
  {
    id: "inner-ear",
    name: "Oído interno",
    x: 193,
    y: 66,
    parameters: [],
    function: "Controla el equilibrio y la orientación.",
    space: "Cada cambio de gravedad (0 g en el viaje, 0,16 g en la Luna) puede causar mareo y problemas para caminar.",
    todo: "Hacé el test de equilibrio antes de cada salida.",
    note: { plain: "Sin mareo", detail: "Último test de equilibrio: estable" },
  },
  {
    id: "heart",
    name: "Corazón y vasos",
    x: 168,
    y: 172,
    parameters: ["bloodPressure", "restingHr"],
    function: "Bombea la sangre a todo el cuerpo.",
    space: "Los fluidos se desplazan, el corazón puede volverse más esférico y aumenta el riesgo de desmayo y de coágulos.",
    todo: "Ejercicio diario e hidratación. Registrá presión y pulso cada mañana.",
  },
  {
    id: "lungs",
    name: "Pulmones",
    x: 124,
    y: 165,
    parameters: ["spo2", "dustIrritation"],
    function: "Llevan oxígeno a la sangre.",
    space: "El hábitat a menor presión puede causar hipoxia leve. El polvo lunar irrita las vías respiratorias.",
    todo: "Reportá dolor de cabeza, confusión o tos después de una salida.",
  },
  {
    id: "bones",
    name: "Huesos y columna",
    x: 150,
    y: 250,
    parameters: ["decompression"],
    function: "Sostienen el cuerpo y protegen los órganos.",
    space: "En ingravidez se pierde entre 1 y 1,5 % de masa ósea por mes. En la gravedad lunar el efecto todavía se estudia.",
    todo: "Ejercicio de resistencia todos los días y calcio con vitamina D.",
    note: { plain: "Bajando un poco", detail: "Densidad de columna −1,2 % (laboratorio)" },
  },
  {
    id: "muscles",
    name: "Músculos",
    x: 75,
    y: 230,
    parameters: ["exercise"],
    function: "Dan fuerza y movimiento.",
    space: "La tripulación pierde en promedio entre 10 y 12 % de fuerza y capacidad aeróbica.",
    todo: "Completá 90 minutos de ejercicio por día.",
  },
  {
    id: "immune",
    name: "Sistema inmune",
    x: 150,
    y: 122,
    parameters: ["temperature"],
    function: "Defiende al cuerpo de infecciones.",
    space: "Se pueden reactivar virus latentes (herpes, culebrilla) y aparecer sarpullidos o alergias nuevas.",
    todo: "Reportá fiebre, sarpullido o herpes apenas aparezcan.",
  },
  {
    id: "gut",
    name: "Piel e intestino",
    x: 140,
    y: 292,
    parameters: ["glucose"],
    function: "Son barrera contra microbios y digieren la comida.",
    space: "En el espacio cambia el microbioma y la dieta es limitada (fatiga de menú).",
    todo: "Variá las comidas y reducí el azúcar.",
  },
];
