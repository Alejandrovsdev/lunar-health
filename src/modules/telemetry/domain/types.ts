/** Sesión de EVA (salida al exterior). La define telemetría; monitoring la usa en la ficha del astronauta. */
export interface EvaSession {
  startedAt: string;
  destination: string;
  plannedHours: number;
  /** Compañero/a de EVA: las salidas son siempre en pareja. */
  partnerId?: string;
  /** Variante de la simulación del traje, para que cada integrante de la pareja tenga sus propios signos. */
  suitVariant?: number;
}
