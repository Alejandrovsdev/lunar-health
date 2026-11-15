"use client";

import { useEffect, useRef, useState } from "react";
import { Repeat, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup, type ChoiceOption } from "@/shared/ui/form";
import { Progress } from "@/shared/ui/progress";
import type { SpeechApi } from "./use-speech";

export interface GuidedQuestion {
  id: string;
  /** Texto completo de la pregunta (se lee tal cual). */
  text: string;
}

export interface GuidedSection<T extends string | number> {
  /** Contexto de la sección, leído una vez al entrar (p. ej. "Durante la última semana…"). */
  intro?: string;
  options: ChoiceOption<T>[];
  questions: GuidedQuestion[];
}

interface GuidedFlowProps {
  sections: GuidedSection<number>[];
  getValue: (id: string) => number | null;
  onAnswer: (id: string, value: number) => void;
  isComplete: () => boolean;
  onComplete: () => void;
  submitLabel: string;
  speech: SpeechApi;
}

interface FlatItem {
  q: GuidedQuestion;
  section: GuidedSection<number>;
  sectionIndex: number;
}

/**
 * Modo guiado con lectura por voz: una pregunta por pantalla.
 * La voz lee "Pregunta N de M" + la pregunta + sus opciones; al responder con clic
 * avanza sola a la siguiente. El progreso y la navegación (Anterior/Repetir/Silenciar)
 * siguen disponibles.
 */
export function GuidedFlow({ sections, getValue, onAnswer, isComplete, onComplete, submitLabel, speech }: GuidedFlowProps) {
  const flat: FlatItem[] = sections.flatMap((section, sectionIndex) => section.questions.map((q) => ({ q, section, sectionIndex })));
  const total = flat.length;
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  const narrate = (i: number) => {
    const { q, section } = flat[i];
    const text = `Pregunta ${i + 1} de ${total}. ${q.text}. Opciones: ${section.options.map((o) => o.label).join(", ")}.`;
    const startsSection = i === 0 || flat[i - 1].sectionIndex !== flat[i].sectionIndex;
    if (section.intro && startsSection) speech.speak(section.intro, () => speech.speak(text));
    else speech.speak(text);
  };

  const goTo = (i: number) => {
    window.clearTimeout(timerRef.current);
    setIndex(Math.max(0, Math.min(i, total - 1)));
  };

  // Al entrar a una pregunta: lee su contexto de sección (si corresponde) y después la pregunta.
  useEffect(() => {
    narrate(index);
    return () => {
      window.clearTimeout(timerRef.current);
      speech.stop();
    };
  }, [index]);

  const answer = (id: string, value: number) => {
    const prev = getValue(id);
    onAnswer(id, value);
    if (index < total - 1) {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setIndex((i) => i + 1), 500);
    } else if (prev == null) {
      speech.speak("Terminaste todas las preguntas. Revisá tus respuestas y, cuando quieras, enviá el test.");
    }
  };

  const item = flat[index];
  const answered = getValue(item.q.id) != null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Pregunta {index + 1} de {total} · con lectura por voz
        </span>
        <Progress value={((index + 1) / total) * 100} />
      </div>

      <section aria-live="polite" className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <ChoiceGroup
          key={item.q.id}
          name={`guided-${item.q.id}`}
          legend={`${index + 1}. ${item.q.text}`}
          options={item.section.options}
          value={getValue(item.q.id)}
          onChange={(v) => answer(item.q.id, v)}
        />
        <p className="text-sm text-muted-foreground">
          {speech.speaking ? "Leyendo la pregunta…" : "Elegí una opción para pasar a la siguiente."}
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="lg" disabled={index === 0} onClick={() => goTo(index - 1)}>
            Anterior
          </Button>
          <Button variant="outline" size="lg" onClick={() => narrate(index)} aria-label="Repetir la pregunta">
            <Repeat className="size-4" />
            Repetir
          </Button>
          <Button variant="outline" size="lg" onClick={speech.stop} disabled={!speech.speaking} aria-label="Silenciar la voz">
            {speech.speaking ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            Silenciar
          </Button>
        </div>
        {index < total - 1 ? (
          <Button size="lg" disabled={!answered} onClick={() => goTo(index + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button size="lg" disabled={!isComplete()} onClick={onComplete}>
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
