/** API pública del módulo de telemetría (traje y ubicación en EVA, simulados). */
export { suitSnapshot, type SuitSnapshot, type SuitChannel } from "./domain/suit";
export { evaPosition, SAFE_RADIUS_KM } from "./domain/route";
export { useSuit } from "./ui/use-suit";
export { SuitChartCard } from "./ui/suit-chart-card";
export { ConsumableRings, EvaTimeline } from "./ui/consumables";
export { EvaMap, useStops } from "./ui/eva-map";
export type { EvaSession } from "./domain/types";
