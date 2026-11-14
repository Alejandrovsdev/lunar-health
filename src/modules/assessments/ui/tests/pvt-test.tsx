"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { useAppStore } from "@/core/store";
import { PVT_LAPSE_MS, PVT_TRIALS, scorePvt } from "../../domain/scoring";
import type { AssessmentResult } from "../../domain/types";

type Phase = "idle" | "wait" | "go" | "result";

/** Vigilancia psicomotora (PVT) breve: versión corta de uno de los 10 tests de NASA Cognition. */
export function PvtTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitPvt);
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [early, setEarly] = useState(false);
  const goAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const arm = () => {
    setEarly(false);
    setPhase("wait");
    timer.current = setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
    }, 1500 + Math.random() * 2000);
  };

  const press = () => {
    if (phase === "idle" || phase === "result") return arm();
    if (phase === "wait") {
      if (timer.current) clearTimeout(timer.current);
      setFalseStarts((n) => n + 1);
      setEarly(true);
      setPhase("result");
      return;
    }
    const ms = Math.round(performance.now() - goAt.current);
    const next = [...times, ms];
    setTimes(next);
    setPhase("result");
    if (next.length >= PVT_TRIALS) onDone(submit(astronautId, next, falseStarts));
  };

  const live = scorePvt(times, falseStarts);
  const last = times.at(-1);
  const pad =
    phase === "wait"
      ? { cls: "bg-gray-400 text-foreground", title: "Esperá…", sub: "Todavía no" }
      : phase === "go"
        ? { cls: "bg-ok text-white", title: "¡Ahora!", sub: "Tocá" }
        : phase === "result"
          ? early
            ? { cls: "bg-warn-soft text-warn-strong", title: "Muy pronto", sub: "Tocá para repetir" }
            : { cls: "bg-info-soft text-info-strong", title: `${last} ms`, sub: "Tocá para el siguiente" }
          : { cls: "bg-border text-foreground", title: "Empezar", sub: "Tocá para comenzar" };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-6" aria-live="polite">
        <span className="font-semibold text-muted-foreground">
          Intento {Math.min(times.length + (phase === "wait" || phase === "go" ? 1 : 0), PVT_TRIALS)} de {PVT_TRIALS}
        </span>
        <button
          type="button"
          onClick={press}
          className={cn("flex size-80 flex-col items-center justify-center gap-2 rounded-full font-display text-4xl font-bold transition-colors", pad.cls)}
        >
          {pad.title}
          <span className="font-sans text-lg font-medium">{pad.sub}</span>
        </button>
        <p className="text-muted-foreground">Cuando el círculo se ponga verde, tocalo lo más rápido que puedas.</p>
      </div>
      <aside className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border bg-card p-4">
          <span className="font-semibold text-muted-foreground">Hasta ahora</span>
          <span className="font-display text-3xl font-bold">{times.length ? live.plain : "—"}</span>
          <span className="text-sm text-muted-foreground">{times.length ? `${live.avg} ms de promedio` : "Sin intentos"}</span>
          <span className="text-sm">
            Lapsos (más de {PVT_LAPSE_MS} ms): {live.lapses} · Falsos inicios: {falseStarts}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Por qué lo hacemos</span>
          Es una versión corta del PVT, uno de los 10 tests de la batería Cognition de NASA Standard Measures. El sueño corto y el estrés te hacen más lento.
        </div>
      </aside>
    </div>
  );
}
