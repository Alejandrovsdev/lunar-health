/**
 * Día de ingesta (comida y bebida): de 07:00 a 21:00, hora de la base.
 * Sirve para saber si un total diario está "en curso" y comparar lo consumido con lo esperable a esa hora.
 */
export const INTAKE_DAY_START_H = 7;
export const INTAKE_DAY_END_H = 21;

/** Fracción del día de ingesta transcurrida a esa hora (0 a las 07:00 o antes, 1 a las 21:00 o después). */
export function intakeDayProgress(at: string | Date): number {
  const d = new Date(at);
  const h = d.getHours() + d.getMinutes() / 60;
  return Math.min(1, Math.max(0, (h - INTAKE_DAY_START_H) / (INTAKE_DAY_END_H - INTAKE_DAY_START_H)));
}

/** Clave del día en hora local (AAAA-MM-DD). */
export function dayKey(at: string | Date): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
