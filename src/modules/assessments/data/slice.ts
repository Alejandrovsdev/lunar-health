import type { StateCreator } from "zustand";
import type { AppState } from "@/core/store-types";
import { worstTone, TONE_LABEL } from "@/shared/domain/status";
import { evaluateReading } from "@/modules/monitoring/domain";
import { newId, type NewReading } from "@/modules/monitoring/data/slice";
import type { AssessmentResult, DailyCheckInForm, WeeklyAnswers } from "../domain/types";
import { scorePvt, scoreWeekly } from "../domain/scoring";

export interface AssessmentsSlice {
  assessmentResults: AssessmentResult[];
  submitDailyCheckIn: (astronautId: string, form: DailyCheckInForm) => AssessmentResult;
  submitPvt: (astronautId: string, times: number[], falseStarts: number) => AssessmentResult;
  submitBalance: (astronautId: string, stable: boolean) => AssessmentResult;
  submitWeekly: (astronautId: string, answers: WeeklyAnswers) => AssessmentResult;
}

export function assessmentsInitialState() {
  return { assessmentResults: [] as AssessmentResult[] };
}

const num = (v: number | "" | null) => (v === "" || v === null ? null : Number(v));

export const createAssessmentsSlice: StateCreator<AppState, [], [], AssessmentsSlice> = (set, get) => {
  const save = (r: Omit<AssessmentResult, "id">) => {
    const result = { ...r, id: newId(r.testId) };
    set((s) => ({ assessmentResults: [...s.assessmentResults, result] }));
    return result;
  };

  return {
    ...assessmentsInitialState(),

    submitDailyCheckIn: (astronautId, f) => {
      const at = new Date().toISOString();
      const base = { astronautId, at, source: "check-in-diario" as const };
      const candidates: (NewReading | null)[] = [
        f.mood ? { ...base, parameterId: "mood", value: f.mood } : null,
        num(f.sleepHours) !== null ? { ...base, parameterId: "sleep", value: Number(f.sleepHours) } : null,
        num(f.systolic) !== null && num(f.diastolic) !== null
          ? { ...base, parameterId: "bloodPressure", value: Number(f.systolic), value2: Number(f.diastolic) }
          : null,
        num(f.glucose) !== null ? { ...base, parameterId: "glucose", value: Number(f.glucose) } : null,
        num(f.temperature) !== null ? { ...base, parameterId: "temperature", value: Number(f.temperature) } : null,
        num(f.spo2) !== null ? { ...base, parameterId: "spo2", value: Number(f.spo2) } : null,
        num(f.restingHr) !== null ? { ...base, parameterId: "restingHr", value: Number(f.restingHr) } : null,
        num(f.exerciseMin) !== null ? { ...base, parameterId: "exercise", value: Number(f.exerciseMin) } : null,
      ];
      const readings = candidates.filter((r): r is NewReading => r !== null);
      get().addReadings(readings);
      const tones = readings.map((r) => evaluateReading({ ...r, id: "tmp" }).tone);
      const tone = worstTone(tones);
      const attention = tones.filter((t) => t === "warn" || t === "bad").length;
      return save({
        astronautId,
        testId: "daily",
        at,
        tone,
        plain: attention ? `${attention} valor(es) para atender` : "Todo en rango",
        detail: `${readings.length} mediciones registradas`,
      });
    },

    submitPvt: (astronautId, times, falseStarts) => {
      const at = new Date().toISOString();
      const s = scorePvt(times, falseStarts);
      get().addReadings([{ astronautId, at, source: "test-cognitivo", parameterId: "pvt", value: s.avg, value2: s.lapses }]);
      return save({ astronautId, testId: "pvt", at, tone: s.tone, plain: s.plain, detail: `${s.avg} ms · ${s.lapses} lapsos · ${falseStarts} falsos inicios` });
    },

    submitBalance: (astronautId, stable) =>
      save({
        astronautId,
        testId: "balance",
        at: new Date().toISOString(),
        tone: stable ? "ok" : "warn",
        plain: stable ? "Estable" : "Inestable",
        detail: stable ? "30 s sin apoyar el pie" : "Apoyó el pie antes de los 30 s",
      }),

    submitWeekly: (astronautId, answers) => {
      const at = new Date().toISOString();
      const s = scoreWeekly(answers);
      get().addReadings([{ astronautId, at, source: "cuestionario-semanal", parameterId: "cohesion", value: s.cohesion }]);
      return save({
        astronautId,
        testId: "weekly",
        at,
        tone: s.emotionalTone,
        plain: s.emotionalPlain,
        detail: `Afecto positivo ${s.positive}/25 · negativo ${s.negative}/25 · salud general ${s.generalHealth}/15 · convivencia ${s.cohesion}/5 (${TONE_LABEL[s.emotionalTone]})`,
      });
    },
  };
};
