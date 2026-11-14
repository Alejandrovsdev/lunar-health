/**
 * API pública del módulo monitoring (tablero e información de los astronautas).
 * Otros módulos solo importan desde aquí.
 */
export type { Astronaut, EvaSession, FollowUp, ParameterId, ParameterStatus, Reading, ReadingSource } from "./domain/types";
export { PARAMETERS, DAILY_PARAMETERS, evaluateReading } from "./domain/parameters";
export { summarizeHealth, type HealthSummary } from "./domain/status";
export { useAstronaut, useAstronauts, useHealthSummary, useActiveFollowUp } from "./ui/hooks";
export { CrewBoard } from "./ui/crew-board";
export { InteriorProfile } from "./ui/interior-profile";
export { ExteriorProfile } from "./ui/exterior-profile";
export { BodyMap } from "./ui/body-map";
export { VitalsGrid, EvolutionList } from "./ui/vitals-and-evolution";
export { AstronautNav } from "./ui/astronaut-nav";
export { TrendChart } from "./ui/trend-chart";
export type { NewReading } from "./data/slice";
