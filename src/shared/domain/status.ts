/**
 * Escala de estado compartida por todos los módulos.
 * Regla de diseño: el estado siempre se muestra con una palabra simple + color.
 */
export type Tone = "ok" | "warn" | "bad" | "info" | "pending";

export const TONE_RANK: Record<Tone, number> = { ok: 0, pending: 1, info: 2, warn: 3, bad: 4 };

export const TONE_LABEL: Record<Tone, string> = {
  ok: "Normal",
  warn: "Atención",
  bad: "Alerta",
  info: "En seguimiento",
  pending: "Pendiente",
};

export function worstTone(tones: Tone[]): Tone {
  return tones.reduce<Tone>((acc, t) => (TONE_RANK[t] > TONE_RANK[acc] ? t : acc), "ok");
}

export function needsAttention(tone: Tone): boolean {
  return tone === "warn" || tone === "bad";
}

/** Clases de Tailwind por estado (definidas en globals.css). */
export const TONE_CLASSES: Record<Tone, { soft: string; strong: string; dot: string; border: string; ring: string }> = {
  ok: { soft: "bg-ok-soft", strong: "text-ok-strong", dot: "bg-ok", border: "border-ok", ring: "ring-ok" },
  warn: { soft: "bg-warn-soft", strong: "text-warn-strong", dot: "bg-warn", border: "border-warn", ring: "ring-warn" },
  bad: { soft: "bg-bad-soft", strong: "text-bad-strong", dot: "bg-bad", border: "border-bad", ring: "ring-bad" },
  info: { soft: "bg-info-soft", strong: "text-info-strong", dot: "bg-info", border: "border-info", ring: "ring-info" },
  pending: { soft: "bg-muted", strong: "text-muted-foreground", dot: "bg-gray-400", border: "border-gray-400", ring: "ring-gray-400" },
};

/** Colores hex para gráficos (Recharts no lee clases). */
export const TONE_HEX: Record<Tone, string> = {
  ok: "#16a34a",
  warn: "#d97706",
  bad: "#dc2626",
  info: "#2563eb",
  pending: "#6b7280",
};

/** Niveles de escalamiento (M11 del documento del equipo). */
export const ESCALATION_LEVELS = ["Autocuidado", "Avisar a la tripulación", "Flight surgeon en Tierra"] as const;
export type EscalationLevel = 0 | 1 | 2;

export function escalationFor(tone: Tone): EscalationLevel {
  if (tone === "bad") return 1;
  return 0;
}
