import type { Tone } from "@/shared/domain/status";

/**
 * Resultados periódicos basados en las variables de NASA Standard Measures
 * (https://nlsp.nasa.gov/resources/standard-measures). Valores de ejemplo, sin rangos clínicos validados.
 */
export interface LabRow {
  label: string;
  plain: string;
  tone: Tone;
  detail?: string;
}

export interface LabPanel {
  id: string;
  name: string;
  standardMeasure: string;
  last: string;
  next: string;
  what: string;
  rows: LabRow[];
}

const SATO_PANELS: LabPanel[] = [
  {
    id: "blood",
    name: "Análisis de sangre y orina",
    standardMeasure: "ISS · Biochemical Measures",
    last: "12 nov",
    next: "26 nov",
    what: "Muestra de sangre en ayunas y orina de 24 h. Revisa azúcar, sangre, riñón, hígado, minerales, vitamina D y huesos.",
    rows: [
      { label: "Azúcar en sangre (glucosa)", plain: "Alta", tone: "warn", detail: "104 mg/dL · normal 70–99" },
      { label: "Glóbulos rojos (hemoglobina)", plain: "Normal", tone: "ok", detail: "13,8 g/dL" },
      { label: "Vitamina D", plain: "Normal", tone: "ok", detail: "31 ng/mL" },
      { label: "Calcio", plain: "Normal", tone: "ok", detail: "9,4 mg/dL" },
      { label: "Riñón (creatinina, urea)", plain: "Normal", tone: "ok", detail: "0,8 · 14 mg/dL" },
      { label: "Hígado (ALT, AST)", plain: "Normal", tone: "ok", detail: "22 · 24 U/L" },
      { label: "Sales (sodio, potasio)", plain: "Normal", tone: "ok", detail: "140 · 4,2 mmol/L" },
      { label: "Recambio de hueso (PTH, PINP)", plain: "Aumentado", tone: "info", detail: "Esperado en la misión" },
      { label: "Riesgo de cálculos renales (orina)", plain: "Bajo", tone: "ok", detail: "Calcio, oxalato, citrato" },
    ],
  },
  {
    id: "cortisol",
    name: "Hormona del estrés",
    standardMeasure: "HERA · Serum Measurements",
    last: "12 nov",
    next: "26 nov",
    what: "El cortisol sube con el estrés y el mal sueño, y afecta defensas y metabolismo.",
    rows: [{ label: "Cortisol", plain: "Algo alto", tone: "warn", detail: "Por encima de tu valor previo al vuelo" }],
  },
  {
    id: "immune",
    name: "Defensas (sistema inmune)",
    standardMeasure: "ISS · Cellular Profile",
    last: "12 nov",
    next: "26 nov",
    what: "Glóbulos blancos, linfocitos, señales de inflamación y virus que quedan dormidos en el cuerpo.",
    rows: [
      { label: "Glóbulos blancos", plain: "Normal", tone: "ok", detail: "6,1 mil/µL" },
      { label: "Linfocitos T", plain: "Normal", tone: "ok", detail: "CD4+ y CD8+" },
      { label: "Inflamación (citoquinas)", plain: "Sin inflamación", tone: "ok", detail: "IL-6, IFN-γ" },
      { label: "Virus dormidos (EBV, CMV)", plain: "No se reactivaron", tone: "ok", detail: "ADN no detectado" },
    ],
  },
  {
    id: "microbiome",
    name: "Microbioma",
    standardMeasure: "ISS · Microbiome",
    last: "5 nov",
    next: "en análisis",
    what: "Los microbios que viven en la piel, nariz, boca e intestino cambian en el espacio.",
    rows: [
      { label: "Microbios de piel, nariz y boca", plain: "En análisis", tone: "pending", detail: "Resultado en ~7 días" },
      { label: "Virus en saliva (EBV, varicela)", plain: "Algo activos", tone: "warn", detail: "Bajo nivel detectado" },
      { label: "Defensas en saliva (IgA, PCR)", plain: "Normal", tone: "ok" },
    ],
  },
  {
    id: "carotid",
    name: "Corazón y arterias",
    standardMeasure: "ISS · Carotid Intima-Media Thickness",
    last: "30 oct",
    next: "30 nov",
    what: "Ecografía del cuello: muestra si las arterias se engrosan y cómo bombea el corazón.",
    rows: [
      { label: "Pared de la arteria carótida", plain: "Sin cambios", tone: "ok", detail: "0,55 mm" },
      { label: "Bombeo del corazón", plain: "Normal", tone: "ok", detail: "Gasto cardíaco y volumen" },
      { label: "Presión y pulso", plain: "Normal", tone: "ok", detail: "118/76 · 64 lpm" },
    ],
  },
  {
    id: "sensorimotor",
    name: "Equilibrio y marcha",
    standardMeasure: "ISS · Sensorimotor · :envihab · Postural Equilibrium",
    last: "8 nov",
    next: "22 nov",
    what: "Caminar en línea con ojos cerrados, levantarse después de una caída y mantenerse quieto de pie.",
    rows: [
      { label: "Caminar en línea, ojos cerrados", plain: "Bien", tone: "ok", detail: "85 % de pasos correctos" },
      { label: "Levantarse tras una caída", plain: "Rápido", tone: "ok", detail: "2,1 s" },
      { label: "Estabilidad de pie", plain: "Normal", tone: "ok", detail: "+10 % de balanceo vs. tu base" },
      { label: "Mareo", plain: "Ninguno", tone: "ok" },
    ],
  },
  {
    id: "bone",
    name: "Huesos y músculo",
    standardMeasure: ":envihab · Bone Mineral Density",
    last: "1 nov",
    next: "1 dic",
    what: "Densitometría: cuánto hueso y músculo tenés comparado con antes de la misión.",
    rows: [
      { label: "Hueso de la columna", plain: "Bajando un poco", tone: "info", detail: "−1,2 % vs. antes del vuelo" },
      { label: "Hueso de la cadera", plain: "Bajando un poco", tone: "info", detail: "−0,9 % vs. antes del vuelo" },
      { label: "Masa muscular", plain: "Bajando un poco", tone: "info", detail: "−2 % vs. antes del vuelo" },
    ],
  },
  {
    id: "fitness",
    name: "Fuerza y resistencia",
    standardMeasure: ":envihab · Muscle Strength · VO2max",
    last: "8 nov",
    next: "22 nov",
    what: "Fuerza de piernas y tronco, y cuánto oxígeno podés usar al hacer esfuerzo.",
    rows: [
      { label: "Fuerza de piernas", plain: "Normal", tone: "ok", detail: "−8 % vs. tu base" },
      { label: "Fuerza de tronco", plain: "Normal", tone: "ok", detail: "−5 % vs. tu base" },
      { label: "Resistencia (VO2máx)", plain: "Bajando un poco", tone: "info", detail: "−6 % vs. tu base" },
    ],
  },
  {
    id: "ocular",
    name: "Ojos (SANS)",
    standardMeasure: ":envihab · Ocular Tests",
    last: "10 nov",
    next: "17 nov",
    what: "Visión, presión dentro del ojo, retina y nervio óptico, que pueden inflamarse en el espacio.",
    rows: [
      { label: "Visión de lejos y de cerca", plain: "Sin cambios", tone: "ok" },
      { label: "Presión dentro del ojo", plain: "Normal", tone: "ok", detail: "15 mmHg" },
      { label: "Retina", plain: "Sin cambios", tone: "ok", detail: "OCT" },
      { label: "Nervio óptico", plain: "Sin inflamación", tone: "ok", detail: "Diámetro de la vaina" },
    ],
  },
  {
    id: "cognition",
    name: "Mente y atención",
    standardMeasure: "ISS · Cognition (10 tests)",
    last: "hoy",
    next: "test diario",
    what: "Atención, memoria, razonamiento, lectura de emociones y toma de riesgos.",
    rows: [
      { label: "Atención y reflejos (PVT)", plain: "Normal", tone: "ok", detail: "268 ms · 1 lapso" },
      { label: "Memoria de trabajo", plain: "Normal", tone: "ok", detail: "N-back" },
      { label: "Reconocer emociones", plain: "Normal", tone: "ok" },
      { label: "Toma de riesgos", plain: "Normal", tone: "ok", detail: "BART" },
    ],
  },
];

/** En la demo solo Sato tiene hallazgos; al resto se le muestran los mismos estudios en rango. */
export function getLabPanels(astronautId: string): LabPanel[] {
  if (astronautId === "sato") return SATO_PANELS;
  return SATO_PANELS.map((p) => ({
    ...p,
    rows: p.rows.map((r) => (r.tone === "warn" || r.tone === "bad" ? { ...r, plain: "Normal", tone: "ok" as Tone, detail: undefined } : r)),
  }));
}
