import type { EscalationLevel, Tone } from "@/shared/domain/status";

type YesNo = boolean | null;
type Num = number | "";

export interface VitalsInput {
  spo2: Num;
  systolic: Num;
  diastolic: Num;
  restingHr: Num;
  temperature: Num;
}

export interface CheckOutForm extends VitalsInput {
  partnerId: string;
  destination: string;
  plannedHours: number;
  sleptEnough: YesNo;
  headache: YesNo;
  jointPain: YesNo;
  nausea: YesNo;
  unusualFatigue: YesNo;
  pvt: { tone: Tone; plain: string; detail: string } | null;
  balanceStable: YesNo;
  prebreatheDone: boolean;
  leakTestOk: YesNo;
  consumablesFull: YesNo;
}

export interface CheckInForm extends VitalsInput {
  dcsJoint: YesNo;
  dcsSkin: YesNo;
  dcsTingling: YesNo;
  dcsDizzy: YesNo;
  dcsBreath: YesNo;
  eyes: 0 | 1 | 2 | null;
  cough: YesNo;
  skinIrritation: YesNo;
  handInjury: YesNo;
  waterPercent: Num;
}

export interface Finding {
  tone: Tone;
  text: string;
}

export interface AirlockVerdict {
  tone: Tone;
  title: string;
  text: string;
  escalation: EscalationLevel;
  findings: Finding[];
  /** Solo check-out: false si no puede salir. */
  allowed: boolean;
}

export interface AirlockRecord {
  id: string;
  kind: "check-out" | "check-in";
  astronautId: string;
  at: string;
  verdict: Pick<AirlockVerdict, "tone" | "title" | "escalation">;
}
