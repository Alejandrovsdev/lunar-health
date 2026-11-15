import { needsAttention, worstTone, escalationFor, type EscalationLevel, type Tone } from "@/shared/domain/status";
import { DAILY_PARAMETERS, PARAMETERS } from "./parameters";
import type { FollowUp, ParameterId, ParameterStatus, Reading } from "./types";

/** Parámetros activos de un astronauta: los 10 diarios + los de seguimiento post-salida. */
export function activeParameterIds(astronautId: string, followUps: FollowUp[]): ParameterId[] {
  const extra = followUps.filter((f) => f.active && f.astronautId === astronautId).flatMap((f) => f.parameterIds);
  return [...DAILY_PARAMETERS, ...Array.from(new Set(extra))];
}

export function parameterStatus(id: ParameterId, readings: Reading[]): ParameterStatus {
  const def = PARAMETERS[id];
  const history = readings.filter((r) => r.parameterId === id).sort((a, b) => a.at.localeCompare(b.at));
  const latest = history.at(-1);
  if (!latest) {
    return { id, label: def.label, tone: "pending", plain: "Sin datos", detail: "", normalText: def.normalText, history };
  }
  const ev = def.evaluate(latest);
  return { id, label: def.label, ...ev, detail: def.format(latest), normalText: def.normalText, latest, history };
}

export interface HealthSummary {
  statuses: ParameterStatus[];
  /** Fuera de rango, lo más grave primero. */
  attention: ParameterStatus[];
  /** Con dato y dentro de rango (no incluye los "Sin datos"). */
  inRange: ParameterStatus[];
  /** Sin medición todavía: no son un problema de salud, son una tarea (hacer el check-in o el test). */
  missing: ParameterStatus[];
  total: number;
  /** Cuántos de `total` vienen del seguimiento post-salida. */
  followUpCount: number;
  /** Estado general. "Sin datos" no lo empeora: solo cuenta si no hay ningún dato. */
  tone: Tone;
  escalation: EscalationLevel;
  headline: string;
}

export function summarizeHealth(astronautId: string, readings: Reading[], followUps: FollowUp[]): HealthSummary {
  const mine = readings.filter((r) => r.astronautId === astronautId);
  const statuses = activeParameterIds(astronautId, followUps).map((id) => parameterStatus(id, mine));
  const attention = statuses
    .filter((s) => needsAttention(s.tone))
    .sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "bad" ? -1 : 1));
  const missing = statuses.filter((s) => s.tone === "pending");
  const inRange = statuses.filter((s) => !needsAttention(s.tone) && s.tone !== "pending");
  const measured = statuses.filter((s) => s.tone !== "pending");
  const tone: Tone = measured.length === 0 ? "pending" : worstTone(measured.map((s) => s.tone));
  const headline =
    attention.length === 0
      ? "Todo en rango"
      : attention.length === 1
        ? `${attention[0].label}: ${attention[0].plain.toLowerCase()}`
        : `Lo más urgente: ${attention[0].label.toLowerCase()}`;
  return {
    statuses,
    attention,
    inRange,
    missing,
    total: statuses.length,
    followUpCount: statuses.length - DAILY_PARAMETERS.length,
    tone,
    escalation: escalationFor(tone),
    headline,
  };
}
