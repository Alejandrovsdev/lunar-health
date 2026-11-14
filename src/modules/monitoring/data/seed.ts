import type { Astronaut, DailyParameterId, FollowUp, Reading } from "../domain/types";

/**
 * Datos de demo. Todos los nombres y valores son ficticios.
 * Se generan relativos a "ahora" para que la demo siempre esté vigente.
 */
type Series = Partial<Record<DailyParameterId, number[]>> & { bloodPressureDia?: number[]; pvtLapses?: number[] };

const DAYS = 14;

const SERIES: Record<string, Series> = {
  ortega: {
    sleep: [7.5, 7.3, 7.6, 7.2, 7.4, 7.8, 7.5, 7.3, 7.6, 7.4, 7.2, 7.5, 7.6, 7.4],
    mood: [4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 4],
    glucose: [86, 88, 85, 87, 89, 86, 88, 87, 85, 88, 86, 87, 89, 88],
    exercise: [95, 92, 98, 100, 94, 96, 92, 95, 99, 97, 93, 96, 94, 98],
    bloodPressure: [116, 118, 115, 117, 116, 118, 117, 116, 115, 117, 118, 116, 117, 116],
    bloodPressureDia: [74, 75, 73, 74, 76, 75, 74, 73, 74, 75, 76, 74, 75, 74],
    restingHr: [61, 62, 60, 61, 63, 62, 61, 60, 61, 62, 63, 61, 60, 61],
    temperature: [36.6, 36.7, 36.6, 36.8, 36.7, 36.6, 36.7, 36.8, 36.6, 36.7, 36.6, 36.7, 36.8, 36.7],
    spo2: [97, 98, 97, 97, 98, 97, 98, 97, 97, 98, 97, 98, 97, 97],
    pvt: [248, 252, 250, 247, 251, 249, 253, 250, 248, 251, 249, 250, 252, 249],
    pvtLapses: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  sato: {
    sleep: [7.4, 7.2, 7.0, 7.3, 7.1, 7.2, 7.5, 7.1, 6.9, 6.6, 6.2, 5.6, 5.3, 5.4],
    mood: [4, 4, 5, 4, 4, 4, 4, 4, 4, 3, 4, 3, 3, 3],
    glucose: [88, 90, 89, 92, 91, 94, 95, 96, 98, 99, 101, 103, 102, 104],
    exercise: [95, 92, 90, 88, 85, 80, 78, 75, 70, 68, 66, 64, 63, 62],
    bloodPressure: [117, 118, 116, 119, 118, 117, 116, 119, 118, 117, 116, 119, 118, 118],
    bloodPressureDia: [75, 76, 74, 77, 76, 75, 74, 77, 76, 75, 74, 77, 76, 76],
    restingHr: [62, 63, 61, 64, 62, 63, 65, 63, 64, 66, 65, 64, 63, 64],
    temperature: [36.7, 36.8, 36.6, 36.8, 36.9, 36.7, 36.8, 36.7, 36.8, 36.9, 36.8, 36.7, 36.8, 36.8],
    spo2: [97, 98, 97, 97, 96, 97, 98, 97, 97, 96, 97, 97, 98, 97],
    pvt: [252, 255, 250, 254, 256, 253, 258, 255, 259, 262, 260, 265, 266, 268],
    pvtLapses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1],
  },
  okafor: {
    sleep: [7.2, 7.4, 7.1, 7.6, 7.3, 7.2, 7.5, 7.4, 7.1, 7.3, 7.6, 7.2, 7.4, 7.5],
    mood: [4, 4, 4, 5, 4, 4, 4, 5, 4, 4, 4, 5, 4, 4],
    glucose: [84, 86, 85, 83, 87, 85, 86, 84, 85, 87, 86, 85, 84, 86],
    exercise: [100, 96, 98, 94, 102, 97, 95, 99, 101, 96, 98, 95, 100, 97],
    bloodPressure: [112, 114, 113, 112, 115, 113, 112, 114, 113, 112, 114, 113, 112, 113],
    bloodPressureDia: [72, 73, 72, 71, 74, 72, 73, 72, 71, 73, 72, 73, 72, 72],
    restingHr: [62, 63, 61, 62, 64, 62, 63, 61, 62, 63, 62, 61, 63, 62],
    temperature: [36.6, 36.7, 36.6, 36.7, 36.8, 36.6, 36.7, 36.6, 36.7, 36.8, 36.6, 36.7, 36.6, 36.7],
    spo2: [98, 97, 98, 98, 97, 98, 98, 97, 98, 98, 97, 98, 98, 98],
    pvt: [240, 243, 241, 238, 244, 240, 242, 239, 241, 243, 240, 242, 238, 241],
    pvtLapses: Array(14).fill(0),
  },
  varga: {
    sleep: [7.3, 7.5, 7.6, 7.2, 7.4, 7.7, 7.5, 7.3, 7.6, 7.4, 7.5, 7.6, 7.3, 7.6],
    mood: [4, 4, 4, 4, 5, 4, 4, 4, 5, 4, 4, 4, 4, 4],
    glucose: [90, 92, 91, 89, 93, 90, 92, 91, 90, 92, 89, 91, 92, 91],
    exercise: [92, 95, 90, 96, 93, 98, 94, 92, 97, 95, 91, 96, 94, 95],
    bloodPressure: [118, 119, 117, 118, 119, 118, 117, 119, 118, 117, 118, 119, 118, 118],
    bloodPressureDia: [76, 77, 75, 76, 77, 76, 75, 77, 76, 75, 76, 77, 76, 76],
    restingHr: [61, 62, 60, 61, 63, 62, 61, 60, 62, 61, 63, 62, 61, 61],
    temperature: [36.7, 36.8, 36.7, 36.8, 36.9, 36.7, 36.8, 36.7, 36.8, 36.7, 36.8, 36.7, 36.8, 36.8],
    spo2: [97, 97, 96, 97, 97, 96, 97, 97, 96, 97, 97, 96, 97, 96],
    pvt: [258, 255, 260, 257, 259, 256, 258, 261, 257, 259, 256, 258, 260, 257],
    pvtLapses: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  },
};

/** Convivencia se mide una vez por semana. */
const WEEKLY_COHESION: Record<string, [number, number]> = {
  ortega: [4.5, 4.25],
  sato: [4, 3.25],
  okafor: [4.25, 4.5],
  varga: [4.25, 4],
};

function atDay(now: Date, daysAgo: number, hour = 7, minute = 15): string {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function hoursFrom(now: Date, hours: number): string {
  return new Date(now.getTime() + hours * 3600_000).toISOString();
}

export function seedMonitoring(now = new Date()) {
  const astronauts: Astronaut[] = [
    { id: "ortega", name: "L. Ortega", role: "Comandante", location: "interior" },
    {
      id: "sato",
      name: "M. Sato",
      role: "Ingeniera de superficie",
      location: "interior",
      nextEva: { at: atDay(now, -1, 8, 0), destination: "Borde del cráter", partnerId: "varga" },
    },
    {
      id: "okafor",
      name: "A. Okafor",
      role: "Geóloga",
      location: "exterior",
      eva: { startedAt: hoursFrom(now, -(3 + 20 / 60)), destination: "Borde del cráter", plannedHours: 6 },
    },
    { id: "varga", name: "J. Varga", role: "Oficial médico", location: "interior" },
  ];

  const readings: Reading[] = [];
  for (const [astronautId, series] of Object.entries(SERIES)) {
    for (const [key, values] of Object.entries(series)) {
      if (key === "bloodPressureDia" || key === "pvtLapses" || !values) continue;
      const parameterId = key as DailyParameterId;
      values.forEach((value, i) => {
        const daysAgo = DAYS - 1 - i;
        readings.push({
          id: `${astronautId}-${parameterId}-${i}`,
          astronautId,
          parameterId,
          value,
          value2: parameterId === "bloodPressure" ? series.bloodPressureDia?.[i] : parameterId === "pvt" ? series.pvtLapses?.[i] : undefined,
          at: atDay(now, daysAgo),
          source: "seed",
        });
      });
    }
    const [prev, last] = WEEKLY_COHESION[astronautId];
    readings.push(
      { id: `${astronautId}-cohesion-0`, astronautId, parameterId: "cohesion", value: prev, at: atDay(now, 7, 20), source: "seed" },
      { id: `${astronautId}-cohesion-1`, astronautId, parameterId: "cohesion", value: last, at: atDay(now, 0, 7, 30), source: "seed" },
    );
  }

  // Varga volvió de una salida hace 3 h: seguimiento post-salida activo.
  const returnedAt = hoursFrom(now, -3);
  const followUps: FollowUp[] = [
    {
      id: "fu-varga-1",
      astronautId: "varga",
      parameterIds: ["decompression", "dustIrritation"],
      createdAt: returnedAt,
      checkpoints: [
        { label: "Control a las 2 h", at: hoursFrom(now, -1) },
        { label: "Control a las 24 h", at: hoursFrom(now, 21) },
      ],
      active: true,
    },
  ];
  readings.push(
    { id: "varga-dcs-0", astronautId: "varga", parameterId: "decompression", value: 0, at: returnedAt, source: "esclusa" },
    { id: "varga-dcs-1", astronautId: "varga", parameterId: "decompression", value: 0, at: hoursFrom(now, -1), source: "esclusa" },
    { id: "varga-dust-0", astronautId: "varga", parameterId: "dustIrritation", value: 2, at: returnedAt, source: "esclusa" },
    { id: "varga-dust-1", astronautId: "varga", parameterId: "dustIrritation", value: 1, at: hoursFrom(now, -1), source: "esclusa" },
  );

  return { astronauts, readings, followUps };
}
