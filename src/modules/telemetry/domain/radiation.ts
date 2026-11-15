import type { Tone } from "@/shared/domain/status";

/**
 * Radiación durante la EVA (dosímetro del traje, simulado y determinístico como el resto de la telemetría).
 *
 * Referencias:
 * - Superficie lunar: ~1.369 µSv/día de dosis equivalente (Chang'e 4, detector LND, Zhang et al. 2020) ≈ 57 µSv/h.
 *   El traje casi no blinda: en EVA se recibe prácticamente todo el fondo de rayos cósmicos.
 * - Límite de carrera de la NASA: 600 mSv de dosis efectiva (NASA-STD-3001, 2022).
 * - Fondo natural en la Tierra: ~2,4 mSv/año ≈ 6,6 µSv/día (UNSCEAR), para comparar en palabras simples.
 * Umbrales de tasa (aviso de evento solar): valores de ejemplo, a validar por el equipo.
 */
export const LUNAR_SURFACE_USV_H = 57;
export const CAREER_LIMIT_MSV = 600;
export const EARTH_BACKGROUND_USV_DAY = 6.6;
export const RADIATION_WARN_USV_H = 150;
export const RADIATION_BAD_USV_H = 500;

export interface RadiationReading {
  /** Tasa de dosis ahora (µSv/h). */
  rateUSvH: number;
  tone: Tone;
  plain: string;
  /** Qué significa la tasa actual, en palabras simples. */
  context: string;
  /** Qué hacer con este nivel. */
  action: string;
  /** Dosis recibida en esta EVA (µSv). */
  evaDoseUSv: number;
  /** A cuántos días de radiación natural en la Tierra equivale la dosis de esta EVA. */
  earthDays: number;
}

/** Oscilación lenta (posición respecto al terreno, actividad solar de fondo). `v` desfasa a cada integrante de la pareja. */
const OSC = { amplitude: 3, periodS: 1800 };
const base = (variant: number) => LUNAR_SURFACE_USV_H + variant * 2;
const phase = (variant: number) => variant * 1.1;

function rateAt(t: number, variant: number) {
  return base(variant) + OSC.amplitude * Math.sin((t / OSC.periodS) * Math.PI * 2 + phase(variant));
}

/** Dosis integrada desde la salida (µSv): integral exacta de la tasa. */
export function evaDoseUSv(elapsedS: number, variant = 0): number {
  const t = Math.max(0, elapsedS);
  const w = (Math.PI * 2) / OSC.periodS;
  const oscillation = (OSC.amplitude / w) * (Math.cos(phase(variant)) - Math.cos(w * t + phase(variant)));
  return (base(variant) * t + oscillation) / 3600;
}

export function radiationReading(elapsedS: number, variant = 0): RadiationReading {
  const rateUSvH = rateAt(elapsedS, variant);
  const evaDose = evaDoseUSv(elapsedS, variant);
  const level =
    rateUSvH >= RADIATION_BAD_USV_H
      ? { tone: "bad" as const, plain: "Muy alta", context: "Tormenta solar en curso", action: "Tormenta solar: volvé ya al refugio de la base con tu compañero/a." }
      : rateUSvH >= RADIATION_WARN_USV_H
        ? { tone: "warn" as const, plain: "Elevada", context: "Posible inicio de un evento solar", action: "Prepará el regreso y esperá la indicación de la base. Evitá alejarte más." }
        : { tone: "ok" as const, plain: "Normal", context: "Fondo lunar, sin tormenta solar", action: "Sin acción: el dosímetro del traje registra toda la dosis." };
  return { rateUSvH, ...level, evaDoseUSv: evaDose, earthDays: evaDose / EARTH_BACKGROUND_USV_DAY };
}
