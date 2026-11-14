import type { StateCreator } from "zustand";
import type { AppState } from "@/core/store-types";
import { newId, type NewReading } from "@/modules/monitoring/data/slice";
import type { AirlockRecord, AirlockVerdict, CheckInForm, CheckOutForm, VitalsInput } from "../domain/types";
import { decompressionCount, dustLevel } from "../domain/rules";

export interface AirlockSlice {
  airlockLog: AirlockRecord[];
  completeCheckOut: (astronautId: string, form: CheckOutForm, verdict: AirlockVerdict) => void;
  completeCheckIn: (astronautId: string, form: CheckInForm, verdict: AirlockVerdict) => void;
}

export function airlockInitialState() {
  return { airlockLog: [] as AirlockRecord[] };
}

function vitalsReadings(astronautId: string, v: VitalsInput, at: string): NewReading[] {
  const base = { astronautId, at, source: "esclusa" as const };
  const out: NewReading[] = [];
  if (v.spo2 !== "") out.push({ ...base, parameterId: "spo2", value: Number(v.spo2) });
  if (v.restingHr !== "") out.push({ ...base, parameterId: "restingHr", value: Number(v.restingHr) });
  if (v.temperature !== "") out.push({ ...base, parameterId: "temperature", value: Number(v.temperature) });
  if (v.systolic !== "" && v.diastolic !== "") out.push({ ...base, parameterId: "bloodPressure", value: Number(v.systolic), value2: Number(v.diastolic) });
  return out;
}

export const createAirlockSlice: StateCreator<AppState, [], [], AirlockSlice> = (set, get) => ({
  ...airlockInitialState(),

  completeCheckOut: (astronautId, form, verdict) => {
    const at = new Date().toISOString();
    get().addReadings(vitalsReadings(astronautId, form, at));
    if (verdict.allowed) {
      const ids = [astronautId, form.partnerId].filter(Boolean);
      get().startEva(ids, {
        startedAt: at,
        destination: form.destination,
        plannedHours: verdict.tone === "warn" ? Math.min(form.plannedHours, 4) : form.plannedHours,
        partnerId: form.partnerId || undefined,
      });
    }
    set((s) => ({
      airlockLog: [...s.airlockLog, { id: newId("out"), kind: "check-out", astronautId, at, verdict: { tone: verdict.tone, title: verdict.title, escalation: verdict.escalation } }],
    }));
  },

  completeCheckIn: (astronautId, form, verdict) => {
    const at = new Date().toISOString();
    const followUpReadings: NewReading[] = [
      { astronautId, at, source: "esclusa", parameterId: "decompression", value: decompressionCount(form) },
      { astronautId, at, source: "esclusa", parameterId: "dustIrritation", value: dustLevel(form) },
    ];
    get().addReadings([...vitalsReadings(astronautId, form, at), ...followUpReadings]);
    get().openFollowUp(astronautId, ["decompression", "dustIrritation"], at);
    get().endEva(astronautId);
    set((s) => ({
      airlockLog: [...s.airlockLog, { id: newId("in"), kind: "check-in", astronautId, at, verdict: { tone: verdict.tone, title: verdict.title, escalation: verdict.escalation } }],
    }));
  },
});
