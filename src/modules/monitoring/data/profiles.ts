import type { BasicProfile } from "../domain/anthropometrics";

/**
 * Legajo médico básico de cada astronauta (datos fijos, de ejemplo).
 * El peso actual NO está acá: es Astronaut.massKg, que también usa Alimentación para calcular las metas.
 * Sato bajó ~6 % desde el pre-vuelo: coincide con su ingesta por debajo de la meta.
 */
const PROFILES: Record<string, BasicProfile> = {
  ortega: { heightCm: 181, birthYear: 1981, preflightMassKg: 79.5, bloodType: "O+", allergies: [] },
  sato: { heightCm: 163, birthYear: 1990, preflightMassKg: 61.5, bloodType: "A+", allergies: ["Penicilina"] },
  okafor: { heightCm: 170, birthYear: 1987, preflightMassKg: 64.5, bloodType: "B+", allergies: [] },
  varga: { heightCm: 178, birthYear: 1984, preflightMassKg: 83, bloodType: "O−", allergies: ["Látex"] },
};

export function getBasicProfile(astronautId: string): BasicProfile | undefined {
  return PROFILES[astronautId];
}
