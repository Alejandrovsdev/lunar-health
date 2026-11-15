import type { Tone } from "@/shared/domain/status";
import type { StressAnswers, WeeklyAnswers } from "./types";

/* ---------- PVT (vigilancia psicomotora) ---------- */

export const PVT_TRIALS = 5;
export const PVT_LAPSE_MS = 335;

export function scorePvt(times: number[], falseStarts: number) {
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const lapses = times.filter((t) => t > PVT_LAPSE_MS).length;
  const tone: Tone = avg >= 360 || lapses >= 3 ? "bad" : avg >= 300 || lapses >= 2 ? "warn" : "ok";
  const plain = tone === "ok" ? "Normal" : tone === "warn" ? "Más lento" : "Muy lento";
  return { avg, lapses, falseStarts, tone, plain };
}

/* ---------- Cuestionario semanal ---------- */

/**
 * PANAS completo (Watson, Clark & Tellegen, 1988): 20 adjetivos, 10 de afecto
 * positivo (1, 3, 5, 9, 10, 12, 14, 16, 17, 19) y 10 de afecto negativo.
 * Escala 1–5 durante la última semana.
 */
export const PANAS_ITEMS = [
  { id: "interesado", label: "Interesado/a", positive: true },
  { id: "angustiado", label: "Angustiado/a", positive: false },
  { id: "excitado", label: "Excitado/a", positive: true },
  { id: "molesto", label: "Molesto/a", positive: false },
  { id: "fuerte", label: "Fuerte", positive: true },
  { id: "culpable", label: "Culpable", positive: false },
  { id: "asustado", label: "Asustado/a", positive: false },
  { id: "hostil", label: "Hostil", positive: false },
  { id: "entusiasmado", label: "Entusiasmado/a", positive: true },
  { id: "orgulloso", label: "Orgulloso/a", positive: true },
  { id: "irritable", label: "Irritable", positive: false },
  { id: "alerta", label: "Alerta", positive: true },
  { id: "avergonzado", label: "Avergonzado/a", positive: false },
  { id: "inspirado", label: "Inspirado/a", positive: true },
  { id: "nervioso", label: "Nervioso/a", positive: false },
  { id: "decidido", label: "Decidido/a", positive: true },
  { id: "atento", label: "Atento/a", positive: true },
  { id: "inquieto", label: "Inquieto/a", positive: false },
  { id: "activo", label: "Activo/a", positive: true },
  { id: "temeroso", label: "Temeroso/a", positive: false },
] as const;

export const PANAS_SCALE = [
  { value: 1, label: "Muy poco o nada" },
  { value: 2, label: "Un poco" },
  { value: 3, label: "Moderadamente" },
  { value: 4, label: "Bastante" },
  { value: 5, label: "Extremadamente" },
];

/**
 * Salud general: preguntas propias que cubren los dominios del GHQ que registra la NASA
 * (ansiedad, insomnio, ánimo, vida social, síntomas físicos). No reproduce el cuestionario original.
 */
export const GENERAL_HEALTH_ITEMS = [
  { id: "ansiedad", label: "¿Te sentiste tenso/a o con los nervios de punta?" },
  { id: "insomnio", label: "¿Perdiste sueño por preocupaciones?" },
  { id: "animo", label: "¿Te sentiste triste o desanimado/a?" },
  { id: "social", label: "¿Te costó disfrutar el tiempo con la tripulación?" },
  { id: "somatico", label: "¿Tuviste dolores o malestares sin una causa clara?" },
] as const;

export const FREQUENCY_SCALE = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "A veces" },
  { value: 2, label: "Seguido" },
  { value: 3, label: "Casi siempre" },
];

/** Convivencia y cohesión: basadas en las variables del cuestionario de sueño y equipo de la NASA. */
export const TEAM_ITEMS = [
  { id: "aprecio", label: "En la tripulación nos apreciamos" },
  { id: "problemas", label: "Se pueden plantear problemas y temas difíciles" },
  { id: "proposito", label: "Compartimos el propósito de la misión" },
  { id: "privacidad", label: "Tengo la privacidad que necesito en la base" },
] as const;

export const AGREEMENT_SCALE = [
  { value: 1, label: "Muy en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "Ni sí ni no" },
  { value: 4, label: "De acuerdo" },
  { value: 5, label: "Muy de acuerdo" },
];

export function isWeeklyComplete(a: WeeklyAnswers) {
  return (
    PANAS_ITEMS.every((i) => a.panas[i.id] != null) &&
    GENERAL_HEALTH_ITEMS.every((i) => a.ghq[i.id] != null) &&
    TEAM_ITEMS.every((i) => a.team[i.id] != null)
  );
}

/* ---------- Escala de Estrés Percibido (PSS-14) ---------- */

/**
 * PSS-14, versión española de E. Remor. Escala 0–4.
 * Los ítems 4, 5, 6, 7, 9, 10 y 13 se invierten antes de sumar.
 * Bandas orientativas: 0–18 bajo, 19–37 moderado, 38–56 alto. No es un diagnóstico.
 */
export const PSS_ITEMS = [
  { id: "pss1", label: "En el último mes, ¿con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?", reverse: false },
  { id: "pss2", label: "En el último mes, ¿con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?", reverse: false },
  { id: "pss3", label: "En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?", reverse: false },
  { id: "pss4", label: "En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?", reverse: true },
  { id: "pss5", label: "En el último mes, ¿con qué frecuencia ha sentido que ha afrontado efectivamente los cambios importantes que han estado ocurriendo en su vida?", reverse: true },
  { id: "pss6", label: "En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?", reverse: true },
  { id: "pss7", label: "En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?", reverse: true },
  { id: "pss8", label: "En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?", reverse: false },
  { id: "pss9", label: "En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?", reverse: true },
  { id: "pss10", label: "En el último mes, ¿con qué frecuencia se ha sentido que tenía todo bajo control?", reverse: true },
  { id: "pss11", label: "En el último mes, ¿con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?", reverse: false },
  { id: "pss12", label: "En el último mes, ¿con qué frecuencia ha pensado sobre las cosas que le quedan por hacer?", reverse: false },
  { id: "pss13", label: "En el último mes, ¿con qué frecuencia ha podido controlar la forma de pasar el tiempo?", reverse: true },
  { id: "pss14", label: "En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?", reverse: false },
] as const;

export const PSS_SCALE = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Casi nunca" },
  { value: 2, label: "De vez en cuando" },
  { value: 3, label: "A menudo" },
  { value: 4, label: "Muy a menudo" },
];

export function isStressComplete(a: StressAnswers) {
  return PSS_ITEMS.every((i) => a[i.id] != null);
}

export function scoreStress(a: StressAnswers) {
  const total = PSS_ITEMS.reduce((s, i) => s + (i.reverse ? 4 - (a[i.id] ?? 0) : (a[i.id] ?? 0)), 0);
  const tone: Tone = total >= 38 ? "bad" : total >= 19 ? "warn" : "ok";
  const plain = tone === "ok" ? "Bajo" : tone === "warn" ? "Moderado" : "Alto";
  return { total, tone, plain };
}

export function scoreWeekly(a: WeeklyAnswers) {
  const positive = PANAS_ITEMS.filter((i) => i.positive).reduce((s, i) => s + (a.panas[i.id] ?? 0), 0);
  const negative = PANAS_ITEMS.filter((i) => !i.positive).reduce((s, i) => s + (a.panas[i.id] ?? 0), 0);
  const generalHealth = GENERAL_HEALTH_ITEMS.reduce((s, i) => s + (a.ghq[i.id] ?? 0), 0);
  const cohesion = TEAM_ITEMS.reduce((s, i) => s + (a.team[i.id] ?? 0), 0) / TEAM_ITEMS.length;
  const emotionalTone: Tone = negative >= 36 || generalHealth >= 10 ? "bad" : negative >= 26 || generalHealth >= 6 || positive <= 24 ? "warn" : "ok";
  return {
    positive,
    negative,
    generalHealth,
    cohesion: Math.round(cohesion * 100) / 100,
    emotionalTone,
    emotionalPlain: emotionalTone === "ok" ? "Bien" : emotionalTone === "warn" ? "Con algo de carga" : "Con mucha carga",
  };
}
