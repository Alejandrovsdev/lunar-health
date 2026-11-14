"use client";

import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES } from "@/shared/domain/status";
import { StatusDot } from "@/shared/components/status";
import { EscalationLadder } from "@/shared/components/escalation-ladder";
import { NumberField } from "@/shared/ui/form";
import type { AirlockVerdict, VitalsInput } from "../domain/types";

export function VitalsFields<T extends VitalsInput>({ form, onChange }: { form: T; onChange: (patch: Partial<VitalsInput>) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <NumberField id="spo2" label="Oxígeno en sangre" unit="%" value={form.spo2} onChange={(v) => onChange({ spo2: v })} hint="Normal: 95 % o más" />
      <NumberField id="hr" label="Pulso" unit="lpm" value={form.restingHr} onChange={(v) => onChange({ restingHr: v })} hint="Normal en reposo: 60 a 100" />
      <NumberField id="sys" label="Presión: número de arriba" unit="mmHg" value={form.systolic} onChange={(v) => onChange({ systolic: v })} />
      <NumberField id="dia" label="Presión: número de abajo" unit="mmHg" value={form.diastolic} onChange={(v) => onChange({ diastolic: v })} hint="Normal: menos de 120/80" />
      <NumberField id="temp" label="Temperatura" unit="°C" step={0.1} value={form.temperature} onChange={(v) => onChange({ temperature: v })} hint="Normal: 36,1 a 37,2 °C" />
    </div>
  );
}

export function VerdictPanel({ verdict }: { verdict: AirlockVerdict }) {
  const c = TONE_CLASSES[verdict.tone];
  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex flex-col gap-2 rounded-2xl p-6", c.soft)}>
        <span className={cn("font-display text-4xl font-bold", verdict.tone === "ok" ? "text-ok-strong" : c.strong)}>{verdict.title}</span>
        <span className="text-lg">{verdict.text}</span>
        <EscalationLadder level={verdict.escalation} />
      </div>
      {verdict.findings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {verdict.findings.map((f) => (
            <li key={f.text} className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
              <StatusDot tone={f.tone} className="size-3" />
              <span className="text-base">{f.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
