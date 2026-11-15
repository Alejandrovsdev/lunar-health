import type { Tone } from "@/shared/domain/status";

export type DailyParameterId =
  | "sleep"
  | "mood"
  | "cohesion"
  | "glucose"
  | "exercise"
  | "bloodPressure"
  | "restingHr"
  | "temperature"
  | "spo2"
  | "pvt"
  | "hydration"
  | "nutrition";

/** Parámetros que solo existen mientras hay un seguimiento post-salida activo. */
export type FollowUpParameterId = "decompression" | "dustIrritation";

export type ParameterId = DailyParameterId | FollowUpParameterId;

export type ReadingSource = "seed" | "check-in-diario" | "test-cognitivo" | "cuestionario-semanal" | "esclusa" | "registro-alimentos";

export interface Reading {
  id: string;
  astronautId: string;
  parameterId: ParameterId;
  /** Valor principal (p. ej. sistólica en presión arterial). */
  value: number;
  /** Valor secundario (p. ej. diastólica, lapsos en el PVT o kcal en alimentación). */
  value2?: number;
  at: string;
  source: ReadingSource;
}

export type Location = "interior" | "exterior";

/** Sexo biológico: define la figura del mapa corporal (y, a futuro, rangos de referencia que dependen de él). */
export type Sex = "female" | "male";

export type { EvaSession } from "@/modules/telemetry/domain/types";
import type { EvaSession } from "@/modules/telemetry/domain/types";

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  sex: Sex;
  /** Masa corporal: define la meta de calorías y proteína (ecuaciones de la OMS que usa la NASA). */
  massKg: number;
  /** Dosis de radiación acumulada en la misión hasta antes de la EVA en curso (mSv, dosis efectiva). */
  radiationMSv: number;
  /** Foto de perfil (ruta pública). */
  photo?: string;
  location: Location;
  eva?: EvaSession;
  nextEva?: { at: string; destination: string; partnerId?: string };
}

export interface FollowUp {
  id: string;
  astronautId: string;
  parameterIds: FollowUpParameterId[];
  createdAt: string;
  checkpoints: { label: string; at: string }[];
  active: boolean;
}

export interface Evaluation {
  tone: Tone;
  /** Nivel en palabras simples: "Normal", "Alta", "Muy poco"… */
  plain: string;
}

export interface ParameterStatus extends Evaluation {
  id: ParameterId;
  label: string;
  /** Valor técnico con unidad, mostrado en segundo plano. */
  detail: string;
  normalText: string;
  latest?: Reading;
  history: Reading[];
}
