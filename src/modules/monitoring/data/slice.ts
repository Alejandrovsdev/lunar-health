import type { StateCreator } from "zustand";
import type { AppState } from "@/core/store-types";
import type { Astronaut, EvaSession, FollowUp, FollowUpParameterId, Reading } from "../domain/types";
import { seedMonitoring } from "./seed";

export type NewReading = Omit<Reading, "id">;

export interface MonitoringSlice {
  astronauts: Astronaut[];
  readings: Reading[];
  followUps: FollowUp[];
  addReadings: (readings: NewReading[]) => void;
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

  startEva: (astronautIds, session) =>
    set((s) => ({
      astronauts: s.astronauts.map((a) =>
        astronautIds.includes(a.id) ? { ...a, location: "exterior", eva: session, nextEva: undefined } : a,
      ),
    })),

  endEva: (astronautId) =>
    set((s) => ({
      astronauts: s.astronauts.map((a) => (a.id === astronautId ? { ...a, location: "interior", eva: undefined } : a)),
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
