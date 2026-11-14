"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/core/store";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup, NumberField } from "@/shared/ui/form";
import type { AssessmentResult, DailyCheckInForm } from "../../domain/types";

const MOOD = [
  { value: 1, label: "1", sublabel: "Muy mal" },
  { value: 2, label: "2", sublabel: "Mal" },
  { value: 3, label: "3", sublabel: "Normal" },
  { value: 4, label: "4", sublabel: "Bien" },
  { value: 5, label: "5", sublabel: "Muy bien" },
];

/** Check-in diario: los parámetros sugeridos por la NASA en el desafío + ejercicio. */
export function DailyCheckInTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitDailyCheckIn);
  const readings = useAppStore((s) => s.readings);
  const lastSleep = useMemo(
    () => readings.filter((r) => r.astronautId === astronautId && r.parameterId === "sleep").at(-1)?.value ?? "",
    [readings, astronautId],
  );
  const [f, setF] = useState<DailyCheckInForm>({
    mood: null,
    sleepHours: lastSleep,
    systolic: "",
    diastolic: "",
    glucose: "",
    temperature: "",
    spo2: "",
    restingHr: "",
    exerciseMin: "",
  });
  const set = <K extends keyof DailyCheckInForm>(k: K) => (v: DailyCheckInForm[K]) => setF((p) => ({ ...p, [k]: v }));
  const complete = f.mood !== null && f.sleepHours !== "";

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) onDone(submit(astronautId, f));
      }}
    >
      <section className="rounded-2xl border bg-card p-5">
        <ChoiceGroup name="mood" legend="1. ¿Cómo está tu ánimo hoy?" options={MOOD} value={f.mood} onChange={set("mood")} />
        <p className="mt-2 text-sm text-muted-foreground">Pensá en tu energía, tu estrés y tu humor de las últimas 24 h.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-2">
        <h2 className="font-sans text-base font-semibold md:col-span-2">2. Sueño y ejercicio</h2>
        <NumberField id="sleep" label="Horas que dormiste" unit="h" step={0.1} value={f.sleepHours} onChange={set("sleepHours")} hint="Lo trae tu sensor de muñeca. Corregilo si no es correcto." />
        <NumberField id="exercise" label="Minutos de ejercicio de ayer" unit="min" value={f.exerciseMin} onChange={set("exerciseMin")} hint="La meta de la NASA es 90 min por día." />
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-3">
        <h2 className="font-sans text-base font-semibold md:col-span-3">3. Mediciones (opcionales, recomendadas cada mañana)</h2>
        <NumberField id="sys" label="Presión: número de arriba" unit="mmHg" value={f.systolic} onChange={set("systolic")} hint="Sentado, 5 min de reposo." />
        <NumberField id="dia" label="Presión: número de abajo" unit="mmHg" value={f.diastolic} onChange={set("diastolic")} />
        <NumberField id="hr" label="Pulso en reposo" unit="lpm" value={f.restingHr} onChange={set("restingHr")} hint="Podés medirlo con la cámara." />
        <NumberField id="glu" label="Glucosa en ayunas" unit="mg/dL" value={f.glucose} onChange={set("glucose")} hint="Antes de desayunar." />
        <NumberField id="temp" label="Temperatura" unit="°C" step={0.1} value={f.temperature} onChange={set("temperature")} />
        <NumberField id="spo2" label="Oxígeno en sangre" unit="%" value={f.spo2} onChange={set("spo2")} hint="Con el oxímetro de dedo." />
      </section>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{complete ? "Listo para guardar." : "Completá al menos el ánimo y el sueño."}</span>
        <Button type="submit" size="lg" disabled={!complete}>
          Guardar check-in
        </Button>
      </div>
    </form>
  );
}
