import type { TestId } from "./types";

/** Catálogo de tests. Para agregar uno: sumarlo acá, crear su componente en ui/tests y registrarlo en ui/registry. */
export interface TestDefinition {
  id: TestId;
  title: string;
  description: string;
  minutes: number;
  frequency: "daily" | "weekly" | "monthly" | "pre-eva";
  frequencyLabel: string;
  category: "fisiológico" | "cognitivo" | "psicológico" | "sensoriomotor";
  nasaReference: string;
}

export const TESTS: TestDefinition[] = [
  {
    id: "daily",
    title: "Check-in diario",
    description: "Ánimo, sueño, presión arterial, glucosa, temperatura, oxígeno, pulso y ejercicio.",
    minutes: 3,
    frequency: "daily",
    frequencyLabel: "Todas las mañanas",
    category: "fisiológico",
    nasaReference: "Referencias clínicas generales · Standard Measures: actigrafía y bioquímica",
  },
  {
    id: "pvt",
    title: "Test cognitivo",
    description: "Atención y reflejos: tocá el círculo cuando se ponga verde. 5 intentos.",
    minutes: 1,
    frequency: "daily",
    frequencyLabel: "Todos los días",
    category: "cognitivo",
    nasaReference: "Standard Measures · Cognition (PVT: lapsos de más de 335 ms y falsos inicios)",
  },
  {
    id: "weekly",
    title: "Cuestionario semanal",
    description: "PANAS completo (20 emociones), salud general y convivencia con la tripulación.",
    minutes: 7,
    frequency: "weekly",
    frequencyLabel: "Una vez por semana",
    category: "psicológico",
    nasaReference: "Standard Measures · PANAS de Watson, Clark & Tellegen (1988), GHQ y cuestionario de sueño y equipo",
  },
  {
    id: "stress",
    title: "Estrés percibido (PSS-14)",
    description: "14 preguntas sobre cómo te sentiste en el último mes: estrés percibido y capacidad de afrontamiento.",
    minutes: 3,
    frequency: "monthly",
    frequencyLabel: "Una vez por mes",
    category: "psicológico",
    nasaReference: "Cohen, Kamarck & Mermelstein (1983) · Perceived Stress Scale (PSS-14), adaptación española de E. Remor",
  },
  {
    id: "balance",
    title: "Equilibrio",
    description: "30 segundos en un pie con los ojos cerrados.",
    minutes: 1,
    frequency: "pre-eva",
    frequencyLabel: "Antes de cada salida (también en el check-out)",
    category: "sensoriomotor",
    nasaReference: "Standard Measures · Sensoriomotor y equilibrio postural",
  },
];

export function getTest(id: string) {
  return TESTS.find((t) => t.id === id);
}
