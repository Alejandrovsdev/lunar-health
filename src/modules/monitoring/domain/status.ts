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
  attention: ParameterStatus[];
  inRange: ParameterStatus[];
  total: number;
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
  const inRange = statuses.filter((s) => !needsAttention(s.tone));
  const tone = worstTone(statuses.map((s) => s.tone));
  const headline =
    attention.length === 0
      ? "Todo en rango"
      : attention.length === 1
        ? `${attention[0].label}: ${attention[0].plain.toLowerCase()}`
        : `Lo más urgente: ${attention[0].label.toLowerCase()}`;
  return { statuses, attention, inRange, total: statuses.length, tone, escalation: escalationFor(tone), headline };
}
