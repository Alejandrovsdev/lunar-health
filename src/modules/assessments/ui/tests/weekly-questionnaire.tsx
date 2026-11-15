"use client";

import { useState } from "react";
import { useAppStore } from "@/core/store";
import { t, tx } from "@/shared/i18n";
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
import { GuidedFlow, type GuidedSection } from "../guided-flow";
import { useSpeech } from "../use-speech";
import { VoiceSetup } from "../voice-setup";

const STEPS = ["PANAS: emociones 1 a 10", "PANAS: emociones 11 a 20", "Salud general", "Convivencia y equipo"] as const;

/** A qué grupo de respuestas pertenece cada ítem (ids únicos entre grupos). */
const GROUP_OF: Record<string, keyof WeeklyAnswers> = {
  ...Object.fromEntries(PANAS_ITEMS.map((i) => [i.id, "panas"])),
  ...Object.fromEntries(GENERAL_HEALTH_ITEMS.map((i) => [i.id, "ghq"])),
  ...Object.fromEntries(TEAM_ITEMS.map((i) => [i.id, "team"])),
};

/** Se arma al usarse (no al importar) para que las preguntas salgan en el idioma activo. */
const guidedSections = (): GuidedSection<number>[] => [
  {
    options: PANAS_SCALE,
    questions: PANAS_ITEMS.map((i) => {
      const feeling = tx(i.label);
      return { id: i.id, text: t("Durante la última semana, ¿en qué medida te sentiste {feeling}?", { feeling: feeling.charAt(0).toLowerCase() + feeling.slice(1) }) };
    }),
  },
  {
    intro: "En los últimos 7 días…",
    options: FREQUENCY_SCALE,
    questions: GENERAL_HEALTH_ITEMS.map((i) => ({ id: i.id, text: i.label })),
  },
  {
    intro: "¿Qué tan de acuerdo estás con estas afirmaciones sobre la convivencia en la base? Tus respuestas son privadas: solo vos y el oficial médico ven el detalle.",
    options: AGREEMENT_SCALE,
    questions: TEAM_ITEMS.map((i) => ({ id: i.id, text: i.label })),
  },
];

/** Cuestionario semanal (psicológico): PANAS completo, salud general y convivencia. */
export function WeeklyQuestionnaire({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitWeekly);
  const speech = useSpeech();
  const [mode, setMode] = useState<"start" | "manual" | "guided">("start");
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

  if (mode === "start") {
    return (
      <VoiceSetup
        title="Cuestionario semanal"
        description="PANAS (20 emociones), salud general y convivencia: 29 preguntas en total. Con voz, cada pregunta se lee sola y avanzás con un clic."
        meta="Se repite una vez por semana · tus respuestas son privadas"
        speech={speech}
        onStart={setMode}
      />
    );
  }

  if (mode === "guided") {
    return (
      <GuidedFlow
        sections={guidedSections()}
        getValue={(id) => a[GROUP_OF[id]][id] ?? null}
        onAnswer={(id, v) => put(GROUP_OF[id], id)(v)}
        isComplete={() => isWeeklyComplete(a)}
        onComplete={() => onDone(submit(astronautId, a))}
        submitLabel="Enviar cuestionario"
        speech={speech}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          {t("Paso {n} de {total}", { n: step + 1, total: STEPS.length })} · {t(STEPS[step])}
        </span>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        {step <= 1 && (
          <>
            <p className="text-lg font-semibold">{t("Durante la última semana, ¿en qué medida te sentiste…?")}</p>
            {panasItems.map((i, idx) => (
              <ChoiceGroup
                key={i.id}
                name={`panas-${i.id}`}
                legend={`${step * 10 + idx + 1}. ${tx(i.label)}`}
                options={PANAS_SCALE}
                value={a.panas[i.id] ?? null}
                onChange={put("panas", i.id)}
              />
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-lg font-semibold">{t("En los últimos 7 días…")}</p>
            {GENERAL_HEALTH_ITEMS.map((i) => (
              <ChoiceGroup key={i.id} name={`ghq-${i.id}`} legend={i.label} options={FREQUENCY_SCALE} value={a.ghq[i.id] ?? null} onChange={put("ghq", i.id)} />
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-lg font-semibold">{t("¿Qué tan de acuerdo estás?")}</p>
            {TEAM_ITEMS.map((i) => (
              <ChoiceGroup key={i.id} name={`team-${i.id}`} legend={i.label} options={AGREEMENT_SCALE} value={a.team[i.id] ?? null} onChange={put("team", i.id)} />
            ))}
            <p className="text-sm text-muted-foreground">{t("Tus respuestas son privadas: solo vos y el oficial médico ven el detalle.")}</p>
          </>
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
          <Button size="lg" disabled={!isWeeklyComplete(a)} onClick={() => onDone(submit(astronautId, a))}>
            {t("Enviar cuestionario")}
          </Button>
        )}
      </div>
    </div>
  );
}
