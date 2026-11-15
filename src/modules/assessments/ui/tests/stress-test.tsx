"use client";

import { useState } from "react";
import { useAppStore } from "@/core/store";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup } from "@/shared/ui/form";
import { Progress } from "@/shared/ui/progress";
import { PSS_ITEMS, PSS_SCALE, isStressComplete } from "../../domain/scoring";
import type { AssessmentResult, StressAnswers } from "../../domain/types";

const STEPS = [
  { label: "Primeros 5 ítems", from: 0, to: 5 },
  { label: "Ítems 6 a 10", from: 5, to: 10 },
  { label: "Últimos 4 ítems", from: 10, to: 14 },
] as const;

/** Escala de Estrés Percibido (PSS-14): 14 ítems sobre el último mes. Se repite una vez por mes. */
export function StressTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitStress);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<StressAnswers>({});
  const put = (id: string) => (v: number) => setA((p) => ({ ...p, [id]: v }));
  const items = PSS_ITEMS.slice(STEPS[step].from, STEPS[step].to);
  const stepDone = items.every((i) => a[i.id] != null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Paso {step + 1} de {STEPS.length} · {STEPS[step].label}
        </span>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        {step === 0 && (
          <p className="text-sm text-muted-foreground">
            Pensá en el último mes. No hay respuestas correctas: elegí la opción que mejor refleje cómo te sentiste o pensaste.
          </p>
        )}
        <p className="text-lg font-semibold">En el último mes, ¿con qué frecuencia…?</p>
        {items.map((i, idx) => {
          const short = i.label.replace(/^En el último mes, ¿con qué frecuencia /, "");
          return (
            <ChoiceGroup
              key={i.id}
              name={`pss-${i.id}`}
              legend={`${STEPS[step].from + idx + 1}. ${short.charAt(0).toUpperCase()}${short.slice(1)}`}
              options={PSS_SCALE}
              value={a[i.id] ?? null}
              onChange={put(i.id)}
            />
          );
        })}
        {step === STEPS.length - 1 && (
          <p className="text-sm text-muted-foreground">
            Este test es orientativo y no reemplaza una evaluación médica. Se repite una vez por mes.
          </p>
        )}
      </section>

      <div className="flex justify-between gap-3">
        <Button variant="outline" size="lg" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="lg" disabled={!stepDone} onClick={() => setStep((s) => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button size="lg" disabled={!isStressComplete(a)} onClick={() => onDone(submit(astronautId, a))}>
            Enviar test
          </Button>
        )}
      </div>
    </div>
  );
}
