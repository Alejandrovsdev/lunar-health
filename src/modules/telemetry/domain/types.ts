/** Sesión de EVA (salida al exterior). La define telemetría; monitoring la usa en la ficha del astronauta. */
export interface EvaSession {
  startedAt: string;
  destination: string;
  plannedHours: number;
  partnerId?: string;
}
