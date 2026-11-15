import type { Tone } from "@/shared/domain/status";
import type { Sex } from "./types";

/**
 * Datos básicos del legajo médico: no cambian durante la misión (salvo el peso, que vive en Astronaut.massKg).
 * NASA Standard Measures incluye la masa corporal; en vuelo se compara siempre contra el valor previo al vuelo.
 */
export interface BasicProfile {
  heightCm: number;
  birthYear: number;
  /** Peso medido antes del vuelo: la referencia para ver si bajó o subió en la misión. */
  preflightMassKg: number;
  bloodType: string;
  /** Vacío = sin alergias conocidas. */
  allergies: string[];
}

export const SEX_LABEL: Record<Sex, string> = { female: "Femenino", male: "Masculino" };

export function ageIn(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function bmi(massKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return massKg / (m * m);
}

/** Categorías de la OMS. En personas muy entrenadas el IMC sobreestima la grasa: es orientativo. */
export function bmiStatus(value: number): { tone: Tone; plain: string } {
  if (value < 18.5) return { tone: "warn", plain: "Bajo" };
  if (value < 25) return { tone: "ok", plain: "Normal" };
  if (value < 30) return { tone: "warn", plain: "Alto" };
  return { tone: "bad", plain: "Muy alto" };
}

/**
 * Cambio de peso respecto del pre-vuelo. Perder masa en misión es frecuente (come menos de lo que gasta).
 * Umbrales de ejemplo, a validar con el equipo médico: 5 % atención, 10 % alerta.
 */
export function massChange(currentKg: number, preflightKg: number): { pct: number; tone: Tone; plain: string } {
  const pct = ((currentKg - preflightKg) / preflightKg) * 100;
  if (pct <= -10) return { pct, tone: "bad", plain: "Bajó mucho de peso" };
  if (pct <= -5) return { pct, tone: "warn", plain: "Bajó de peso" };
  if (pct >= 5) return { pct, tone: "warn", plain: "Subió de peso" };
  return { pct, tone: "ok", plain: "Peso estable" };
}
