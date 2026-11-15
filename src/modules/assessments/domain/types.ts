import type { Tone } from "@/shared/domain/status";

export type TestId = "daily" | "pvt" | "balance" | "weekly" | "stress";

export interface AssessmentResult {
  id: string;
  astronautId: string;
  testId: TestId;
  at: string;
  tone: Tone;
  plain: string;
  detail: string;
}

export interface DailyCheckInForm {
  mood: number | null;
  sleepHours: number | "";
  systolic: number | "";
  diastolic: number | "";
  glucose: number | "";
  temperature: number | "";
  spo2: number | "";
  restingHr: number | "";
  exerciseMin: number | "";
}

export interface WeeklyAnswers {
  panas: Record<string, number>;
  ghq: Record<string, number>;
  team: Record<string, number>;
}

export type StressAnswers = Record<string, number>;
