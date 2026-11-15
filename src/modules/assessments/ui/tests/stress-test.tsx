"use client";

import { useState } from "react";
import { useAppStore } from "@/core/store";
import { t, tx } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup } from "@/shared/ui/form";
import { Progress } from "@/shared/ui/progress";
import { PSS_ITEMS, PSS_SCALE, isStressComplete } from "../../domain/scoring";
import type { AssessmentResult, StressAnswers } from "../../domain/types";
import { GuidedFlow } from "../guided-flow";
import { useSpeech } from "../use-speech";
import { VoiceSetup } from "../voice-setup";

const STEPS = [
  { label: "Primeros 5 ítems", from: 0, to: 5 },
  { label: "Ítems 6 a 10", from: 5, to: 10 },
  { label: "Últimos 4 ítems", from: 10, to: 14 },
] as const;

const INTRO = "Pensá en el último mes. No hay respuestas correctas: elegí la opción que mejor refleje cómo te sentiste o pensaste.";

/** Escala de Estrés Percibido (PSS-14): 14 ítems sobre el último mes. Se repite una vez por mes. */
export function StressTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitStress);
  const speech = useSpeech();
  const [mode, setMode] = useState<"start" | "manual" | "guided">("start");
  const [step, setStep] = useState(0);
  const [a, setA] = useState<StressAnswers>({});
  const put = (id: string) => (v: number) => setA((p) => ({ ...p, [id]: v }));
  const items = PSS_ITEMS.slice(STEPS[step].from, STEPS[step].to);
  const stepDone = items.every((i) => a[i.id] != null);

  if (mode === "start") {
    return (
      <VoiceSetup
        title="Escala de Estrés Percibido (PSS-14)"
        description="14 preguntas sobre el último mes, con escala de frecuencia. Con voz, cada pregunta se lee sola y avanzás con un clic."
        meta="Se repite una vez por mes · orientativo, no reemplaza una evaluación médica"
        speech={speech}
        onStart={setMode}
      />
    );
  }

  if (mode === "guided") {
    return (
      <GuidedFlow
        sections={[
          {
            intro: INTRO,
            options: PSS_SCALE,
            questions: PSS_ITEMS.map((i) => ({ id: i.id, text: i.label })),
          },
        ]}
        getValue={(id) => a[id] ?? null}
        onAnswer={(id, v) => put(id)(v)}
        isComplete={() => isStressComplete(a)}
        onComplete={() => onDone(submit(astronautId, a))}
        submitLabel="Enviar test"
        speech={speech}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          {t("Paso {n} de {total}", { n: step + 1, total: STEPS.length })} · {t(STEPS[step].label)}
        </span>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        {step === 0 && (
          <p className="text-sm text-muted-foreground">
            {t(INTRO)}
          </p>
        )}
        <p className="text-lg font-semibold">{t("En el último mes, ¿con qué frecuencia…?")}</p>
        {items.map((i, idx) => {
          const short = tx(i.label).replace(/^(En el último mes, ¿con qué frecuencia |In the last month, how often )/, "");
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
            {t("Este test es orientativo y no reemplaza una evaluación médica. Se repite una vez por mes.")}
          </p>
        )}
      </section>

      <div className="flex justify-between gap-3">
        <Button variant="outline" size="lg" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          {t("Anterior")}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="lg" disabled={!stepDone} onClick={() => setStep((s) => s + 1)}>
            {t("Siguiente")}
          </Button>
        ) : (
          <Button size="lg" disabled={!isStressComplete(a)} onClick={() => onDone(submit(astronautId, a))}>
            {t("Enviar test")}
          </Button>
        )}
      </div>
    </div>
  );
}
