"use client";

import { useState } from "react";
import { useAppStore } from "@/core/store";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup } from "@/shared/ui/form";
import { Progress } from "@/shared/ui/progress";
import {
  AGREEMENT_SCALE,
  FREQUENCY_SCALE,
  GENERAL_HEALTH_ITEMS,
  PANAS_ITEMS,
  PANAS_SCALE,
  TEAM_ITEMS,
  isWeeklyComplete,
} from "../../domain/scoring";
import type { AssessmentResult, WeeklyAnswers } from "../../domain/types";

const STEPS = ["PANAS: emociones 1 a 10", "PANAS: emociones 11 a 20", "Salud general", "Convivencia y equipo"] as const;

/** Cuestionario semanal (psicológico): PANAS completo, salud general y convivencia. */
export function WeeklyQuestionnaire({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitWeekly);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<WeeklyAnswers>({ panas: {}, ghq: {}, team: {} });
  const put = (group: keyof WeeklyAnswers, id: string) => (v: number) => setA((p) => ({ ...p, [group]: { ...p[group], [id]: v } }));

  const panasItems = step === 0 ? PANAS_ITEMS.slice(0, 10) : step === 1 ? PANAS_ITEMS.slice(10, 20) : [];
  const stepDone =
    step <= 1
      ? panasItems.every((i) => a.panas[i.id] != null)
      : step === 2
        ? GENERAL_HEALTH_ITEMS.every((i) => a.ghq[i.id] != null)
        : TEAM_ITEMS.every((i) => a.team[i.id] != null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Paso {step + 1} de {STEPS.length} · {STEPS[step]}
        </span>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        {step <= 1 && (
          <>
            <p className="text-lg font-semibold">Durante la última semana, ¿en qué medida te sentiste…?</p>
            {panasItems.map((i, idx) => (
              <ChoiceGroup
                key={i.id}
                name={`panas-${i.id}`}
                legend={`${step * 10 + idx + 1}. ${i.label}`}
                options={PANAS_SCALE}
                value={a.panas[i.id] ?? null}
                onChange={put("panas", i.id)}
              />
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-lg font-semibold">En los últimos 7 días…</p>
            {GENERAL_HEALTH_ITEMS.map((i) => (
              <ChoiceGroup key={i.id} name={`ghq-${i.id}`} legend={i.label} options={FREQUENCY_SCALE} value={a.ghq[i.id] ?? null} onChange={put("ghq", i.id)} />
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-lg font-semibold">¿Qué tan de acuerdo estás?</p>
            {TEAM_ITEMS.map((i) => (
              <ChoiceGroup key={i.id} name={`team-${i.id}`} legend={i.label} options={AGREEMENT_SCALE} value={a.team[i.id] ?? null} onChange={put("team", i.id)} />
            ))}
            <p className="text-sm text-muted-foreground">Tus respuestas son privadas: solo vos y el oficial médico ven el detalle.</p>
          </>
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
          <Button size="lg" disabled={!isWeeklyComplete(a)} onClick={() => onDone(submit(astronautId, a))}>
            Enviar cuestionario
          </Button>
        )}
      </div>
    </div>
  );
}
