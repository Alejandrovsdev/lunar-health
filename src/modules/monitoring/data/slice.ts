import type { StateCreator } from "zustand";
import type { AppState } from "@/core/store-types";
import type { Astronaut, EvaSession, FollowUp, FollowUpParameterId, Reading } from "../domain/types";
import { evaDoseUSv } from "@/modules/telemetry/domain/radiation";
import { seedMonitoring } from "./seed";

export type NewReading = Omit<Reading, "id">;

export interface MonitoringSlice {
  astronauts: Astronaut[];
  readings: Reading[];
  followUps: FollowUp[];
  addReadings: (readings: NewReading[]) => void;
  /** Reemplaza lecturas por id (las que se recalculan, como los totales diarios de alimentación) y borra `removeIds`. */
  upsertReadings: (readings: Reading[], removeIds?: string[]) => void;
  startEva: (astronautIds: string[], session: EvaSession) => void;
  endEva: (astronautId: string) => void;
  openFollowUp: (astronautId: string, parameterIds: FollowUpParameterId[], at: string) => void;
}

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function monitoringInitialState() {
  return seedMonitoring();
}

export const createMonitoringSlice: StateCreator<AppState, [], [], MonitoringSlice> = (set) => ({
  ...monitoringInitialState(),

  addReadings: (incoming) =>
    set((s) => ({ readings: [...s.readings, ...incoming.map((r) => ({ ...r, id: newId(r.parameterId) }))] })),

  upsertReadings: (incoming, removeIds = []) =>
    set((s) => {
      const drop = new Set([...removeIds, ...incoming.map((r) => r.id)]);
      return { readings: [...s.readings.filter((r) => !drop.has(r.id)), ...incoming] };
    }),

  /** Las salidas son en pareja: cada integrante guarda como compañero/a al otro y tiene su propia variante de traje. */
  startEva: (astronautIds, session) =>
    set((s) => ({
      astronauts: s.astronauts.map((a) => {
        const i = astronautIds.indexOf(a.id);
        if (i === -1) return a;
        const partnerId = astronautIds.find((id) => id !== a.id);
        return { ...a, location: "exterior", eva: { ...session, partnerId, suitVariant: i }, nextEva: undefined };
      }),
    })),

  /** Al volver, la dosis de radiación de la salida se suma al acumulado de la misión. */
  endEva: (astronautId) =>
    set((s) => ({
      astronauts: s.astronauts.map((a) => {
        if (a.id !== astronautId) return a;
        const elapsedS = a.eva ? (Date.now() - new Date(a.eva.startedAt).getTime()) / 1000 : 0;
        const evaMSv = a.eva ? evaDoseUSv(elapsedS, a.eva.suitVariant) / 1000 : 0;
        return { ...a, location: "interior", eva: undefined, radiationMSv: a.radiationMSv + evaMSv };
      }),
    })),

  openFollowUp: (astronautId, parameterIds, at) =>
    set((s) => {
      const base = new Date(at).getTime();
      const followUp: FollowUp = {
        id: newId("fu"),
        astronautId,
        parameterIds,
        createdAt: at,
        checkpoints: [
          { label: "Control a las 2 h", at: new Date(base + 2 * 3600_000).toISOString() },
          { label: "Control a las 24 h", at: new Date(base + 24 * 3600_000).toISOString() },
        ],
        active: true,
      };
      return {
        followUps: [...s.followUps.map((f) => (f.astronautId === astronautId ? { ...f, active: false } : f)), followUp],
      };
    }),
});
