import { worstTone, type Tone } from "@/shared/domain/status";
import { PARAMETERS } from "@/modules/monitoring/domain";
import type { AirlockVerdict, CheckInForm, CheckOutForm, Finding, VitalsInput } from "./types";

/**
 * Reglas de la esclusa. Son propuestas para la demo y deben validarse con el equipo médico.
 * Fuentes: riesgos HRP (descompresión, EVA, hipoxia) y umbrales de la tabla 3.2.
 */

function vitalsFindings(v: VitalsInput): Finding[] {
  const out: Finding[] = [];
  const check = (id: "spo2" | "restingHr" | "temperature", value: number | "") => {
    if (value === "") return;
    const def = PARAMETERS[id];
    const ev = def.evaluate({ id: "", astronautId: "", parameterId: id, value: Number(value), at: "", source: "esclusa" });
    if (ev.tone !== "ok") out.push({ tone: ev.tone, text: `${def.label}: ${ev.plain.toLowerCase()}` });
  };
  check("spo2", v.spo2);
  check("restingHr", v.restingHr);
  check("temperature", v.temperature);
  if (v.systolic !== "" && v.diastolic !== "") {
    const ev = PARAMETERS.bloodPressure.evaluate({
      id: "",
      astronautId: "",
      parameterId: "bloodPressure",
      value: Number(v.systolic),
      value2: Number(v.diastolic),
      at: "",
      source: "esclusa",
    });
    if (ev.tone !== "ok") out.push({ tone: ev.tone, text: `Presión arterial: ${ev.plain.toLowerCase()}` });
  }
  return out;
}

export function evaluateCheckOut(f: CheckOutForm): AirlockVerdict {
  const findings: Finding[] = [];
  const add = (cond: boolean | null | undefined, tone: Tone, text: string) => cond && findings.push({ tone, text });

  add(f.sleptEnough === false, "warn", "Durmió menos de 6 h");
  add(f.unusualFatigue === true, "warn", "Cansancio fuera de lo normal");
  add(f.headache === true, "warn", "Dolor de cabeza o mareo");
  add(f.nausea === true, "warn", "Náuseas o visión borrosa");
  add(f.jointPain === true, "bad", "Dolor en articulaciones antes de salir");
  findings.push(...vitalsFindings(f));
  if (f.pvt && f.pvt.tone !== "ok") findings.push({ tone: f.pvt.tone, text: `Test cognitivo: ${f.pvt.plain.toLowerCase()}` });
  add(f.balanceStable === false, "warn", "Equilibrio inestable");
  add(f.leakTestOk === false, "bad", "El traje no pasó la prueba de fuga");
  add(f.consumablesFull === false, "bad", "Oxígeno, batería o agua incompletos");

  const tone = worstTone(findings.map((x) => x.tone));
  if (tone === "bad") {
    return {
      tone,
      allowed: false,
      title: "No puede salir",
      text: "Hay al menos un punto crítico. Resolvelo y repetí el check-out, o reprogramá la salida.",
      escalation: 1,
      findings,
    };
  }
  if (tone === "warn") {
    return {
      tone,
      allowed: true,
      title: "Puede salir con precaución",
      text: "Salida acortada, ritmo bajo y revisión del oficial médico antes de despresurizar.",
      escalation: 1,
      findings,
    };
  }
  return { tone: "ok", allowed: true, title: "Puede salir", text: "Todo en rango. Terminá el pre-respirado y buena salida.", escalation: 0, findings };
}

export function decompressionCount(f: CheckInForm) {
  return [f.dcsJoint, f.dcsSkin, f.dcsTingling, f.dcsDizzy, f.dcsBreath].filter((x) => x === true).length;
}

export function dustLevel(f: CheckInForm): number {
  return Math.max(f.eyes ?? 0, f.cough ? 1 : 0, f.skinIrritation ? 1 : 0);
}

export function evaluateCheckIn(f: CheckInForm): AirlockVerdict {
  const findings: Finding[] = [];
  const dcs = decompressionCount(f);
  if (dcs > 0) findings.push({ tone: "bad", text: `${dcs} síntoma(s) de descompresión` });
  if (f.eyes === 2) findings.push({ tone: "bad", text: "Ojos muy irritados por polvo" });
  if (f.eyes === 1) findings.push({ tone: "warn", text: "Ojos un poco irritados por polvo" });
  if (f.cough) findings.push({ tone: "warn", text: "Tos o garganta irritada" });
  if (f.skinIrritation) findings.push({ tone: "warn", text: "Piel irritada" });
  findings.push(...vitalsFindings(f));
  if (f.handInjury) findings.push({ tone: "warn", text: "Lesión en manos o uñas por los guantes" });
  if (f.waterPercent !== "" && Number(f.waterPercent) < 60) findings.push({ tone: "warn", text: "Tomó poca agua durante la salida" });

  const tone = worstTone(findings.map((x) => x.tone));
  if (dcs > 0) {
    return {
      tone: "bad",
      allowed: true,
      title: "Atención médica ahora",
      text: "Posible enfermedad por descompresión. Avisá ya al oficial médico; puede requerir volver a presión. Se consulta al flight surgeon.",
      escalation: 2,
      findings,
    };
  }
  if (tone !== "ok") {
    return {
      tone,
      allowed: true,
      title: "Puede ingresar · con seguimiento",
      text: "Quedan parámetros en seguimiento a las 2 h y 24 h. Pasan a tu ficha en la base.",
      escalation: tone === "bad" ? 1 : 0,
      findings,
    };
  }
  return { tone: "ok", allowed: true, title: "Puede ingresar", text: "Sin síntomas. Igual se hacen los controles de 2 h y 24 h.", escalation: 0, findings };
}
