import { formatNumber } from "@/shared/lib/format";
import type { Tone } from "@/shared/domain/status";
import type { Evaluation, ParameterId, Reading, DailyParameterId } from "./types";

/**
 * Catálogo de parámetros.
 * Umbrales: tabla 3.2 del documento del equipo (referencias clínicas generales, a validar).
 * Fuentes NASA: Standard Measures (nlsp.nasa.gov) y riesgos HRP.
 */
export interface ParameterDefinition {
  id: ParameterId;
  label: string;
  unit: string;
  normalText: string;
  format: (r: Reading) => string;
  evaluate: (r: Reading) => Evaluation;
  chart: { min: number; max: number; bandLow: number; bandHigh: number };
  why: string;
  action: Partial<Record<Tone, string>>;
  source: string;
  how: string;
}

const e = (tone: Tone, plain: string): Evaluation => ({ tone, plain });

export const PARAMETERS: Record<ParameterId, ParameterDefinition> = {
  sleep: {
    id: "sleep",
    label: "Sueño",
    unit: "h",
    normalText: "7 a 9 h",
    format: (r) => `${formatNumber(r.value, 1)} h`,
    evaluate: ({ value: v }) => (v < 6 ? e("bad", "Muy poco") : v < 7 ? e("warn", "Poco") : v > 9 ? e("warn", "Mucho") : e("ok", "Suficiente")),
    chart: { min: 3, max: 10, bandLow: 7, bandHigh: 9 },
    why: "En el polo sur lunar la luz no sigue un ciclo de 24 h y el reloj biológico se desajusta. Dormir poco afecta el ánimo, las decisiones y el rendimiento en las salidas.",
    action: {
      warn: "Adelantá 30 minutos tu horario de dormir y evitá pantallas 30 minutos antes.",
      bad: "Adelantá 1 h tu horario de dormir, luz tenue 1 h antes y nada de cafeína después del mediodía. Si sigue en rojo, avisá a la tripulación.",
    },
    source: "Standard Measures · Actigrafía (tiempo total de sueño, eficiencia, despertares)",
    how: "Sensor de muñeca, confirmado en el check-in diario",
  },
  mood: {
    id: "mood",
    label: "Ánimo",
    unit: "/ 5",
    normalText: "4 o 5",
    format: (r) => `${r.value} de 5`,
    evaluate: ({ value: v }) => (v <= 2 ? e("bad", "Mal") : v < 4 ? e("warn", "Regular") : e("ok", "Bien")),
    chart: { min: 1, max: 5, bandLow: 4, bandHigh: 5 },
    why: "El aislamiento y el encierro aumentan el estrés. La NASA mide el afecto positivo y negativo en todos sus análogos de aislamiento.",
    action: {
      warn: "Hablá con alguien de la tripulación o con tu familia y escribí 5 minutos en tu diario esta noche.",
      bad: "Avisá al oficial médico hoy. Hablarlo temprano ayuda.",
    },
    source: "Standard Measures · PANAS (afecto positivo y negativo) y GHQ",
    how: "Check-in diario (1 a 5) y PANAS breve semanal",
  },
  cohesion: {
    id: "cohesion",
    label: "Convivencia",
    unit: "/ 5",
    normalText: "4 o 5",
    format: (r) => `${formatNumber(r.value, 1)} de 5`,
    evaluate: ({ value: v }) => (v < 2.5 ? e("bad", "Mala") : v < 3.75 ? e("warn", "Regular") : e("ok", "Buena")),
    chart: { min: 1, max: 5, bandLow: 4, bandHigh: 5 },
    why: "En una base chica, los conflictos sin resolver afectan el sueño, el ánimo y el trabajo en equipo.",
    action: {
      warn: "Planteá el tema en la próxima reunión de equipo. Si preferís, hablalo primero con el oficial médico.",
      bad: "Pedí una conversación con el oficial médico y el comandante esta semana.",
    },
    source: "Standard Measures · Cuestionario de sueño y equipo (convivencia, cohesión, privacidad)",
    how: "Cuestionario semanal",
  },
  glucose: {
    id: "glucose",
    label: "Glucosa en ayunas",
    unit: "mg/dL",
    normalText: "70 a 99 mg/dL",
    format: (r) => `${r.value} mg/dL`,
    evaluate: ({ value: v }) => (v < 70 ? e("bad", "Baja") : v >= 126 ? e("bad", "Muy alta") : v >= 100 ? e("warn", "Alta") : e("ok", "Normal")),
    chart: { min: 60, max: 140, bandLow: 70, bandHigh: 99 },
    why: "La dieta en la base es limitada, y el estrés y el mal sueño suben la glucosa.",
    action: {
      warn: "Menos azúcar en el desayuno, más fibra, y repetí la medición mañana en ayunas.",
      bad: "Repetí la medición ahora y avisá al oficial médico.",
    },
    source: "Standard Measures · Bioquímica (panel metabólico en sangre)",
    how: "Glucómetro en ayunas, cargado a mano",
  },
  exercise: {
    id: "exercise",
    label: "Ejercicio",
    unit: "min",
    normalText: "90 min o más por día",
    format: (r) => `${r.value} min`,
    evaluate: ({ value: v }) => (v < 45 ? e("bad", "Muy poco") : v < 90 ? e("warn", "Insuficiente") : e("ok", "Suficiente")),
    chart: { min: 0, max: 120, bandLow: 90, bandHigh: 120 },
    why: "Con menos gravedad se pierden hueso y músculo. La NASA indica 1,5 h de ejercicio por día, 6 a 7 días por semana.",
    action: {
      warn: "Completá hoy los minutos que faltan, con ejercicios de resistencia para piernas y espalda.",
      bad: "Hacé hoy al menos 45 minutos y avisá si algo te impide entrenar.",
    },
    source: "Standard Measures (:envihab) · Fuerza muscular y VO2máx",
    how: "Registro del equipo de ejercicio",
  },
  bloodPressure: {
    id: "bloodPressure",
    label: "Presión arterial",
    unit: "mmHg",
    normalText: "menos de 120/80",
    format: (r) => `${r.value}/${r.value2 ?? "?"} mmHg`,
    evaluate: ({ value: s, value2: d = 0 }) =>
      s < 90 || d < 60 ? e("bad", "Baja") : s >= 140 || d >= 90 ? e("bad", "Alta") : s >= 120 || d >= 80 ? e("warn", "Algo alta") : e("ok", "Normal"),
    chart: { min: 80, max: 160, bandLow: 90, bandHigh: 119 },
    why: "Los fluidos se desplazan hacia la cabeza y el corazón se adapta a la menor gravedad.",
    action: { warn: "Repetí la medición en reposo en 2 h.", bad: "Repetí la medición ahora y avisá al oficial médico." },
    source: "Standard Measures · Sensoriomotor y cIMT (presión braquial)",
    how: "Tensiómetro, cargado a mano",
  },
  restingHr: {
    id: "restingHr",
    label: "Pulso en reposo",
    unit: "lpm",
    normalText: "60 a 100 lpm",
    format: (r) => `${r.value} lpm`,
    evaluate: ({ value: v }) =>
      v < 50 || v > 120 ? e("bad", v < 50 ? "Muy bajo" : "Muy alto") : v < 60 ? e("warn", "Algo bajo") : v > 100 ? e("warn", "Algo alto") : e("ok", "Normal"),
    chart: { min: 40, max: 130, bandLow: 60, bandHigh: 100 },
    why: "Un pulso en reposo que sube varios días puede indicar cansancio, estrés o deshidratación.",
    action: { warn: "Descansá, hidratate y repetí mañana.", bad: "Avisá al oficial médico." },
    source: "Standard Measures · cIMT y Sensoriomotor (frecuencia cardíaca)",
    how: "Cámara (PPG) o sensor de muñeca",
  },
  temperature: {
    id: "temperature",
    label: "Temperatura",
    unit: "°C",
    normalText: "36,1 a 37,2 °C",
    format: (r) => `${formatNumber(r.value, 1)} °C`,
    evaluate: ({ value: v }) =>
      v >= 38 ? e("bad", "Fiebre") : v < 35 ? e("bad", "Muy baja") : v >= 37.3 ? e("warn", "Algo alta") : v < 36.1 ? e("warn", "Algo baja") : e("ok", "Normal"),
    chart: { min: 35, max: 39, bandLow: 36.1, bandHigh: 37.2 },
    why: "En el espacio el sistema inmune cambia y pueden reactivarse virus dormidos.",
    action: { warn: "Repetí la medición en 2 h y anotá si tenés otros síntomas.", bad: "Avisá al oficial médico ahora." },
    source: "Documento del equipo (tabla 3.2) · riesgo HRP: sistema inmune",
    how: "Termómetro, cargado a mano",
  },
  spo2: {
    id: "spo2",
    label: "Oxígeno en sangre",
    unit: "%",
    normalText: "95 % o más",
    format: (r) => `${r.value} %`,
    evaluate: ({ value: v }) => (v < 90 ? e("bad", "Bajo") : v < 95 ? e("warn", "Algo bajo") : e("ok", "Normal")),
    chart: { min: 85, max: 100, bandLow: 95, bandHigh: 100 },
    why: "El hábitat trabaja a menor presión (8,2 psi) y eso puede causar hipoxia leve, parecida al mal de altura.",
    action: { warn: "Repetí en reposo. Si sigue bajo, avisá antes de cualquier salida.", bad: "Avisá al oficial médico ahora." },
    source: "Documento del equipo (tabla 3.2) · riesgo HRP: hipoxia",
    how: "Oxímetro de dedo",
  },
  pvt: {
    id: "pvt",
    label: "Test cognitivo",
    unit: "ms",
    normalText: "menos de 300 ms",
    format: (r) => `${r.value} ms · ${r.value2 ?? 0} lapsos`,
    evaluate: ({ value: v, value2: lapses = 0 }) =>
      v >= 360 || lapses >= 3 ? e("bad", "Muy lento") : v >= 300 || lapses >= 2 ? e("warn", "Más lento") : e("ok", "Normal"),
    chart: { min: 200, max: 420, bandLow: 200, bandHigh: 299 },
    why: "La NASA mide la cognición en todas sus tripulaciones. El sueño corto y el estrés te hacen más lento.",
    action: { warn: "Repetilo después de descansar.", bad: "No hagas tareas críticas hasta repetirlo y avisá a la tripulación." },
    source: "Standard Measures · Cognition (vigilancia psicomotora, PVT)",
    how: "Test de reacción en pantalla, 5 intentos",
  },
  decompression: {
    id: "decompression",
    label: "Descompresión (post-salida)",
    unit: "",
    normalText: "sin síntomas",
    format: (r) => (r.value === 0 ? "sin síntomas" : `${r.value} síntoma(s)`),
    evaluate: ({ value: v }) => (v >= 2 ? e("bad", "Síntomas") : v === 1 ? e("warn", "Un síntoma") : e("ok", "Sin síntomas")),
    chart: { min: 0, max: 3, bandLow: 0, bandHigh: 0.3 },
    why: "Al bajar de presión pueden formarse burbujas de nitrógeno: dolor en articulaciones, piel o síntomas neurológicos.",
    action: { warn: "Avisá al oficial médico ahora.", bad: "Avisá al oficial médico ahora: puede requerir volver a presión." },
    source: "Riesgo HRP · Enfermedad por descompresión",
    how: "Check-in de la esclusa y controles a las 2 h y 24 h",
  },
  dustIrritation: {
    id: "dustIrritation",
    label: "Ojos y respiración (post-salida)",
    unit: "",
    normalText: "sin irritación",
    format: (r) => (r.value === 0 ? "sin irritación" : `intensidad ${r.value} de 3`),
    evaluate: ({ value: v }) => (v >= 2 ? e("bad", "Irritación fuerte") : v === 1 ? e("warn", "Irritación leve") : e("ok", "Sin irritación")),
    chart: { min: 0, max: 3, bandLow: 0, bandHigh: 0.3 },
    why: "El polvo lunar es filoso y se pega al traje: al entrar irrita ojos y vías respiratorias.",
    action: { warn: "Lavate los ojos con solución. Si sigue igual en el próximo control, avisá.", bad: "Avisá al oficial médico." },
    source: "Riesgo HRP · Lesión en caminatas espaciales (EVA)",
    how: "Check-in de la esclusa y controles a las 2 h y 24 h",
  },
};

export const DAILY_PARAMETERS: DailyParameterId[] = [
  "sleep",
  "mood",
  "cohesion",
  "glucose",
  "exercise",
  "bloodPressure",
  "restingHr",
  "temperature",
  "spo2",
  "pvt",
];

export function evaluateReading(r: Reading): Evaluation {
  return PARAMETERS[r.parameterId].evaluate(r);
}
