"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { useAppStore } from "@/core/store";
import { t } from "@/shared/i18n";
import { PVT_ANTICIPATION_MS, PVT_LAPSE_MS, PVT_TIMEOUT_MS, PVT_TRIALS, scorePvt } from "../../domain/scoring";
import type { AssessmentResult } from "../../domain/types";

type Phase = "idle" | "wait" | "go" | "feedback" | "done";
type Feedback = { kind: "ok" | "slow"; ms: number } | { kind: "early" } | { kind: "timeout" };

/** Espera al azar antes de cada estímulo (PVT-B usa 1 a 4 s): no se puede anticipar. */
const ISI_MIN_MS = 2000;
const ISI_MAX_MS = 5000;
const FEEDBACK_MS = 900;

/**
 * Vigilancia psicomotora (PVT) breve: versión corta de uno de los 10 tests de NASA Cognition.
 *
 * Precisión:
 * - El tiempo empieza cuando el estímulo se pinta (cuadro de requestAnimationFrame), no cuando se programa.
 * - La respuesta se toma al apretar (pointerdown o tecla), con la marca de tiempo del evento, no al soltar.
 * - Los intentos se encadenan solos con esperas al azar: el astronauta no controla el ritmo.
 * - Respuestas antes del estímulo o en menos de 100 ms son falsos inicios y el intento se repite.
 */
export function PvtTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitPvt);
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Refs: los eventos llegan más rápido que los renders y necesitan el estado real al instante.
  const phaseRef = useRef<Phase>("idle");
  const onset = useRef<number | null>(null);
  const timesRef = useRef<number[]>([]);
  const falseRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const arm = () => {
    clear();
    onset.current = null;
    setFeedback(null);
    go("wait");
    timer.current = setTimeout(() => {
      go("go");
      // El estímulo se pinta en el próximo cuadro: ahí empieza a correr el tiempo.
      requestAnimationFrame((ts) => {
        if (phaseRef.current !== "go") return;
        onset.current = ts;
        timer.current = setTimeout(() => record({ kind: "timeout" }), PVT_TIMEOUT_MS);
      });
    }, ISI_MIN_MS + Math.random() * (ISI_MAX_MS - ISI_MIN_MS));
  };

  const finish = () => {
    go("done");
    onDone(submit(astronautId, timesRef.current, falseRef.current));
  };

  const record = (f: Feedback) => {
    clear();
    setFeedback(f);
    go("feedback");
    if (f.kind === "early") {
      falseRef.current += 1;
      setFalseStarts(falseRef.current);
    } else {
      const ms = f.kind === "timeout" ? PVT_TIMEOUT_MS : f.ms;
      timesRef.current = [...timesRef.current, ms];
      setTimes(timesRef.current);
    }
    timer.current = setTimeout(() => (timesRef.current.length >= PVT_TRIALS ? finish() : arm()), FEEDBACK_MS);
  };

  const respond = (ts: number) => {
    const p = phaseRef.current;
    if (p === "idle") return arm();
    if (p === "wait") return record({ kind: "early" });
    if (p !== "go" || onset.current === null) return;
    const ms = Math.round(ts - onset.current);
    if (ms < PVT_ANTICIPATION_MS) return record({ kind: "early" });
    record({ kind: ms > PVT_LAPSE_MS ? "slow" : "ok", ms });
  };

  // Barra espaciadora como alternativa al toque (más precisa en computadora).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      respond(e.timeStamp);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const live = scorePvt(times, falseStarts);
  const trial = Math.min(times.length + (phase === "wait" || phase === "go" ? 1 : 0), PVT_TRIALS);
  const pad =
    phase === "wait"
      ? { cls: "bg-gray-400 text-foreground", title: t("Esperá…"), sub: t("Mirá el círculo") }
      : phase === "go"
        ? { cls: "bg-ok text-white", title: t("¡Ahora!"), sub: t("Tocá") }
        : phase === "feedback" && feedback
          ? feedback.kind === "early"
            ? { cls: "bg-warn-soft text-warn-strong", title: t("Muy pronto"), sub: t("Esperá el verde · se repite") }
            : feedback.kind === "timeout"
              ? { cls: "bg-warn-soft text-warn-strong", title: t("Sin respuesta"), sub: t("Cuenta como lapso") }
              : { cls: feedback.kind === "slow" ? "bg-warn-soft text-warn-strong" : "bg-info-soft text-info-strong", title: `${feedback.ms} ms`, sub: feedback.kind === "slow" ? t("Lapso (lento)") : t("Bien") }
          : phase === "done"
            ? { cls: "bg-ok-soft text-ok-strong", title: t("Listo"), sub: t("Guardando resultado") }
            : { cls: "bg-border text-foreground", title: t("Empezar"), sub: t("Tocá o apretá espacio") };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-6" aria-live="polite">
        <span className="font-semibold text-muted-foreground">
          {phase === "idle" ? t("{n} intentos · menos de 1 minuto", { n: PVT_TRIALS }) : t("Intento {n} de {total}", { n: trial, total: PVT_TRIALS })}
        </span>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            respond(e.timeStamp);
          }}
          className={cn(
            "flex size-80 touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-full font-display text-4xl font-bold",
            pad.cls,
          )}
        >
          {pad.title}
          <span className="font-sans text-lg font-medium">{pad.sub}</span>
        </button>
        <p className="max-w-md text-center text-muted-foreground">
          {t("Cuando el círculo se ponga verde, tocalo (o apretá espacio) lo más rápido que puedas. No te adelantes: la espera cambia cada vez.")}
        </p>
      </div>
      <aside className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border bg-card p-4">
          <span className="font-semibold text-muted-foreground">{t("Hasta ahora")}</span>
          <span className="font-display text-3xl font-bold">{times.length ? t(live.plain) : "—"}</span>
          <span className="text-sm text-muted-foreground">{times.length ? t("{ms} ms de promedio", { ms: live.avg }) : t("Sin intentos")}</span>
          <span className="text-sm">
            {t("Lapsos (más de {ms} ms): {lapses} · Falsos inicios: {fs}", { ms: PVT_LAPSE_MS, lapses: live.lapses, fs: falseStarts })}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{t("Por qué lo hacemos")}</span>
          {t("Es una versión corta del PVT, uno de los 10 tests de la batería Cognition de NASA Standard Measures. El sueño corto y el estrés te hacen más lento.")}
        </div>
      </aside>
    </div>
  );
}
