import type { Tone } from "@/shared/domain/status";
import type { WeeklyAnswers } from "./types";

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

/** PANAS breve internacional (10 adjetivos). Escala 1–5. */
export const PANAS_ITEMS = [
  { id: "alerta", label: "Alerta", positive: true },
  { id: "inspirado", label: "Inspirado/a", positive: true },
  { id: "decidido", label: "Decidido/a", positive: true },
  { id: "atento", label: "Atento/a", positive: true },
  { id: "activo", label: "Activo/a", positive: true },
  { id: "molesto", label: "Molesto/a", positive: false },
  { id: "hostil", label: "Hostil", positive: false },
  { id: "avergonzado", label: "Avergonzado/a", positive: false },
  { id: "nervioso", label: "Nervioso/a", positive: false },
  { id: "asustado", label: "Asustado/a", positive: false },
] as const;

export const PANAS_SCALE = [
  { value: 1, label: "Nada" },
  { value: 2, label: "Poco" },
  { value: 3, label: "Algo" },
  { value: 4, label: "Bastante" },
  { value: 5, label: "Mucho" },
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

export function scoreWeekly(a: WeeklyAnswers) {
  const positive = PANAS_ITEMS.filter((i) => i.positive).reduce((s, i) => s + (a.panas[i.id] ?? 0), 0);
  const negative = PANAS_ITEMS.filter((i) => !i.positive).reduce((s, i) => s + (a.panas[i.id] ?? 0), 0);
  const generalHealth = GENERAL_HEALTH_ITEMS.reduce((s, i) => s + (a.ghq[i.id] ?? 0), 0);
  const cohesion = TEAM_ITEMS.reduce((s, i) => s + (a.team[i.id] ?? 0), 0) / TEAM_ITEMS.length;
  const emotionalTone: Tone = negative >= 18 || generalHealth >= 10 ? "bad" : negative >= 13 || generalHealth >= 6 || positive <= 12 ? "warn" : "ok";
  return {
    positive,
    negative,
    generalHealth,
    cohesion: Math.round(cohesion * 100) / 100,
    emotionalTone,
    emotionalPlain: emotionalTone === "ok" ? "Bien" : emotionalTone === "warn" ? "Con algo de carga" : "Con mucha carga",
  };
}
