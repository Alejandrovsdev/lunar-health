"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/core/store";
import { Button } from "@/shared/ui/button";
import type { AssessmentResult } from "../../domain/types";

const SECONDS = 30;

/** Equilibrio: 30 s en un pie con los ojos cerrados (Standard Measures: sensoriomotor). */
export function BalanceTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitBalance);
  const [phase, setPhase] = useState<"idle" | "run" | "ask">("idle");
  const [left, setLeft] = useState(SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

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
        {phase === "idle" && <Button size="xl" onClick={start}>Empezar</Button>}
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
