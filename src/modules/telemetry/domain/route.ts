/**
 * Ruta de EVA sobre una imagen real: ortomosaico LROC NAC (NASA/GSFC/Arizona State University) de la cresta de
 * conexión Shackleton–de Gerlache, polo sur lunar, una de las zonas candidatas de Artemis. La base, la ruta y las
 * paradas son ficticias, pero están trazadas sobre el terreno de la foto (zona plana iluminada → borde del cráter
 * en sombra permanente). Coordenadas en un lienzo de 800×560 que cubre 5 × 3,5 km.
 */
export const MAP_IMAGE = {
  src: "/eva/mapa-cresta-shackleton.jpg",
  credit: "Imagen: LRO / NASA / GSFC / Arizona State University",
  place: "Cresta Shackleton–de Gerlache · polo sur lunar",
};

export const ROUTE: [number, number][] = [
  [440, 165],
  [420, 205],
  [395, 240],
  [380, 280],
  [360, 315],
  [330, 340],
  [275, 362],
  [300, 430],
];

export interface EvaStop {
  index: number;
  task: string;
  detail: string;
  minutes: number;
  image: { src: string; alt: string; credit: string };
}

export const STOPS: EvaStop[] = [
  {
    index: 2,
    task: "Muestras de regolito",
    detail: "Tomar 3 muestras del suelo de la cresta, lejos del polvo que levantan los aterrizajes.",
    minutes: 18,
    image: { src: "/eva/parada-regolito.jpg", alt: "Pala tomando una muestra de suelo lunar junto a una roca", credit: "NASA · Apollo 16" },
  },
  {
    index: 4,
    task: "Instalar sismómetro",
    detail: "Dejar un sensor en terreno firme para medir los sismos lunares.",
    minutes: 35,
    image: { src: "/eva/parada-sismometro.jpg", alt: "Astronauta instalando un sismómetro con paneles solares sobre la superficie lunar", credit: "NASA · Apollo 11" },
  },
  {
    index: 6,
    task: "Fotos del borde del cráter",
    detail: "Fotografiar las capas de roca expuestas en el borde del cráter en sombra permanente.",
    minutes: 22,
    image: { src: "/eva/parada-borde-crater.jpg", alt: "Borde iluminado del cráter Shackleton rodeado de sombra", credit: "LRO · NASA/GSFC/ASU" },
  },
  {
    index: 7,
    task: "Hielo en la zona de sombra",
    detail: "Buscar hielo en el borde de un cráter que nunca recibe luz del sol (trampa fría).",
    minutes: 40,
    image: { src: "/eva/parada-hielo-sombra.jpg", alt: "Interior oscuro de un cráter en sombra permanente visto desde órbita", credit: "ShadowCam · NASA/KARI/ASU" },
  },
];

const SEGMENTS = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
export const ROUTE_LENGTH_PX = SEGMENTS.reduce((a, b) => a + b, 0);
/** Escala real de la imagen: 2.500 px de 2 m recortados a 800 px de ancho → 6,25 m por unidad. La ruta mide ~2,1 km. */
export const KM_PER_PX = 0.00625;
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
