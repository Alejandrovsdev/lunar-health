/** Ruta de EVA ilustrativa (no es un mapa real del polo sur lunar). Coordenadas en un lienzo de 800×560. */
export const ROUTE: [number, number][] = [
  [140, 430],
  [220, 405],
  [290, 335],
  [360, 300],
  [430, 255],
  [500, 222],
  [570, 170],
  [650, 135],
];

export const STOPS = [
  { index: 2, task: "Muestras de regolito", detail: "Tomar 3 muestras del suelo cerca de la base.", minutes: 18 },
  { index: 4, task: "Instalar sismómetro", detail: "Dejar un sensor para medir movimientos del suelo lunar.", minutes: 35 },
  { index: 6, task: "Fotos del borde del cráter", detail: "Fotografiar las capas de roca expuestas en el borde.", minutes: 22 },
  { index: 7, task: "Hielo en la zona de sombra", detail: "Buscar y tomar muestras de hielo cerca de la zona en sombra.", minutes: 40 },
];

const SEGMENTS = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
export const ROUTE_LENGTH_PX = SEGMENTS.reduce((a, b) => a + b, 0);
/** Escala elegida para que la ruta completa mida ~2 km. */
export const KM_PER_PX = 2.03 / ROUTE_LENGTH_PX;
export const SAFE_RADIUS_KM = 2.3;
export const WALK_KMH = 3;

export function pointAt(progress: number) {
  const target = Math.min(1, Math.max(0, progress)) * ROUTE_LENGTH_PX;
  let acc = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (acc + SEGMENTS[i] >= target) {
      const f = (target - acc) / SEGMENTS[i];
      const [ax, ay] = ROUTE[i];
      const [bx, by] = ROUTE[i + 1];
      return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, segment: i };
    }
    acc += SEGMENTS[i];
  }
  const [x, y] = ROUTE[ROUTE.length - 1];
  return { x, y, segment: SEGMENTS.length - 1 };
}

export function distanceAlong(index: number) {
  return SEGMENTS.slice(0, index).reduce((a, b) => a + b, 0);
}

/** Progreso de la ruta proporcional al tiempo de EVA planificado. */
export function routeProgress(elapsedS: number, plannedHours: number) {
  return Math.min(1, elapsedS / (plannedHours * 3600));
}

export function evaPosition(elapsedS: number, plannedHours: number) {
  const progress = routeProgress(elapsedS, plannedHours);
  const p = pointAt(progress);
  const [bx, by] = ROUTE[0];
  const distanceKm = Math.hypot(p.x - bx, p.y - by) * KM_PER_PX;
  const pathKm = progress * ROUTE_LENGTH_PX * KM_PER_PX;
  return { progress, point: p, distanceKm, pathKm, walkBackMin: Math.round((pathKm / WALK_KMH) * 60) };
}
