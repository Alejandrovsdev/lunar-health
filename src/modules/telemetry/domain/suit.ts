import type { Tone } from "@/shared/domain/status";

/**
 * Telemetría simulada del traje (AxEMU: pulso, temperatura, respiración, presión, consumibles).
 * Es determinística según el tiempo transcurrido, así todas las pantallas muestran lo mismo.
 * Umbrales de EVA: valores de ejemplo, a validar por el equipo.
 */
export interface SuitChannel {
  id: "pressure" | "hr" | "temp" | "resp";
  label: string;
  unit: string;
  decimals: number;
  value: number;
  tone: Tone;
  plain: string;
  /** Últimos 10 minutos, una muestra cada 10 s. */
  history: { t: number; v: number }[];
  range: { min: number; max: number };
  warn: { value: number; direction: "above" | "below"; text: string };
  primary?: boolean;
}

export interface SuitSnapshot {
  elapsedS: number;
  channels: SuitChannel[];
  consumables: { id: string; label: string; percent: number; sub: string; color: string }[];
  returnAtS: number;
  limitS: number;
  alert: { tone: Tone; text: string } | null;
}

const H = 3600;

function wave(t: number, a: number, p: number, phase = 0) {
  return a * Math.sin((t / p) * Math.PI * 2 + phase);
}

const MODEL = {
  pressure: (t: number) => 4.3 + wave(t, 0.02, 47) + wave(t, 0.01, 13),
  hr: (t: number) => 138 + wave(t, 9, 420) + wave(t, 4, 37) + Math.min(10, t / 1200),
  temp: (t: number) => 36.95 + wave(t, 0.12, 900) + wave(t, 0.03, 61),
  resp: (t: number) => 21 + wave(t, 3, 300) + wave(t, 1, 29),
};

interface ChannelSpec {
  id: SuitChannel["id"];
  label: string;
  unit: string;
  decimals: number;
  range: { min: number; max: number };
  warn: SuitChannel["warn"];
  bad: number;
  words: [string, string, string];
  primary?: boolean;
}

const SPECS: ChannelSpec[] = [
  { id: "pressure", label: "Presión del traje", unit: "psi", decimals: 1, range: { min: 3.5, max: 5 }, warn: { value: 4.1, direction: "below", text: "menos de 4,1 psi" }, bad: 3.9, words: ["Estable", "Baja", "Muy baja"], primary: true },
  { id: "hr", label: "Pulso", unit: "lpm", decimals: 0, range: { min: 100, max: 180 }, warn: { value: 145, direction: "above", text: "más de 145 lpm" }, bad: 165, words: ["Normal", "Alto", "Muy alto"] },
  { id: "temp", label: "Temperatura corporal", unit: "°C", decimals: 1, range: { min: 36, max: 39 }, warn: { value: 37.3, direction: "above", text: "desde 37,3 °C" }, bad: 38, words: ["Normal", "Algo alta", "Alta"] },
  { id: "resp", label: "Respiración", unit: "rpm", decimals: 0, range: { min: 10, max: 40 }, warn: { value: 30, direction: "above", text: "más de 30 rpm" }, bad: 35, words: ["Normal", "Rápida", "Muy rápida"] },
];

function classify(spec: ChannelSpec, v: number): { tone: Tone; plain: string } {
  const past = (limit: number) => (spec.warn.direction === "above" ? v >= limit : v <= limit);
  if (past(spec.bad)) return { tone: "bad", plain: spec.words[2] };
  if (past(spec.warn.value)) return { tone: "warn", plain: spec.words[1] };
  return { tone: "ok", plain: spec.words[0] };
}

export function suitSnapshot(startedAt: string, now: number, plannedHours = 6): SuitSnapshot {
  const elapsedS = Math.max(0, (now - new Date(startedAt).getTime()) / 1000);
  const channels: SuitChannel[] = SPECS.map((spec) => {
    const f = MODEL[spec.id];
    const value = f(elapsedS);
    const history = Array.from({ length: 60 }, (_, i) => {
      const t = elapsedS - (59 - i) * 10;
      return { t: i, v: Number(f(Math.max(0, t)).toFixed(spec.decimals + 1)) };
    });
    return { id: spec.id, label: spec.label, unit: spec.unit, decimals: spec.decimals, value, history, range: spec.range, warn: spec.warn, primary: spec.primary, ...classify(spec, value) };
  });

  const limitS = 8 * H;
  const o2 = Math.max(0, 100 - (elapsedS / limitS) * 100);
  const water = Math.max(0, 100 - (elapsedS / (plannedHours * H)) * 100);
  const battery = Math.max(0, 100 - (elapsedS / limitS) * 95);
  const o2LeftMin = Math.round(((o2 / 100) * limitS) / 60);

  const pressure = channels[0];
  const hot = channels.find((c) => c.tone !== "ok" && c.id !== "pressure");
  const alert =
    pressure.tone !== "ok"
      ? { tone: pressure.tone, text: "Presión del traje baja. Revisá sellos y guantes y avisá a tu compañero de EVA." }
      : hot
        ? {
            tone: hot.tone,
            text:
              hot.id === "hr"
                ? "Pulso por encima de tu zona. Pausa de 5 minutos y tomá agua."
                : hot.id === "temp"
                  ? "Temperatura en subida. Bajá el ritmo y buscá sombra."
                  : "Respiración rápida. Bajá el ritmo y respirá lento.",
          }
        : null;

  return {
    elapsedS,
    channels,
    consumables: [
      { id: "o2", label: "Oxígeno", percent: o2, sub: `Alcanza ${Math.floor(o2LeftMin / 60)} h ${o2LeftMin % 60} min`, color: "#2563eb" },
      { id: "water", label: "Agua", percent: water, sub: "Bolsa de bebida", color: "#0891b2" },
      { id: "battery", label: "Batería", percent: battery, sub: "Soporte vital", color: "#7c3aed" },
      { id: "co2", label: "CO₂ en el casco", percent: 18, sub: "Normal", color: "#16a34a" },
    ],
    returnAtS: plannedHours * H - 55 * 60,
    limitS,
    alert,
  };
}
