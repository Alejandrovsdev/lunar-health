"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/core/store";
import { Button } from "@/shared/ui/button";
import type { AssessmentResult } from "../../domain/types";
import { useSpeech } from "../use-speech";

const SECONDS = 30;

/** Equilibrio: 30 s en un pie con los ojos cerrados (Standard Measures: sensoriomotor). */
export function BalanceTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitBalance);
  const speech = useSpeech();
  const [phase, setPhase] = useState<"idle" | "run" | "ask">("idle");
  const [left, setLeft] = useState(SECONDS);
  const [voiceOn, setVoiceOn] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  // La cuenta se lee en voz alta con el mismo número que se muestra (ojos cerrados: no se puede mirar).
  useEffect(() => {
    if (!voiceOn) return;
    if (phase === "run") speech.speak(left === SECONDS ? `Ojos cerrados, aguantá. ${left}` : String(left));
    if (phase === "ask") speech.speak("Tiempo. ¿Pudiste mantener el equilibrio? Opciones: Sí, sin apoyar el pie. Apoyé el pie.");
  }, [phase, left]);

  const start = () => {
    setPhase("run");
    setLeft(SECONDS);
    timer.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          if (timer.current) clearInterval(timer.current);
          setPhase("ask");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border bg-card p-8 text-center" aria-live="polite">
        <span className="font-display text-3xl font-bold">
          {phase === "idle" ? "Equilibrio en un pie" : phase === "run" ? "Ojos cerrados, aguantá" : "¿Pudiste mantener el equilibrio?"}
        </span>
        <span className="font-display text-8xl font-bold text-primary">{left}</span>
        {phase === "idle" && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" onClick={start}>
              Empezar
            </Button>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} className="size-4 accent-primary" />
              Leer la cuenta en voz alta
            </label>
          </div>
        )}
        {phase === "ask" && (
          <div className="flex gap-3">
            <Button size="xl" onClick={() => onDone(submit(astronautId, true))}>Sí, sin apoyar el pie</Button>
            <Button size="xl" variant="outline" onClick={() => onDone(submit(astronautId, false))}>Apoyé el pie</Button>
          </div>
        )}
      </div>
      <aside className="flex flex-col gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <span className="font-semibold text-muted-foreground">Cómo hacerlo</span>
          <ol className="mt-2 list-decimal pl-5 leading-relaxed">
            <li>Parate cerca de una pared.</li>
            <li>Levantá un pie y cerrá los ojos.</li>
            <li>Aguantá hasta que termine la cuenta.</li>
          </ol>
        </div>
        <div className="rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
          El oído interno se altera con los cambios de gravedad. Si hoy te cuesta, afuera, con el traje, te va a costar más.
        </div>
      </aside>
    </div>
  );
}
