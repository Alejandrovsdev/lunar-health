"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/core/store";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { t } from "@/shared/i18n";
import type { AssessmentResult } from "../../domain/types";
import { useSpeech } from "../use-speech";

const SECONDS = 30;

const STEPS = [
  "Parate cerca de una pared, por si necesitás apoyarte.",
  "Levantá un pie del piso.",
  "Cuando escuches «ya», cerrá los ojos y aguantá sin apoyar el pie.",
  "La cuenta dura 30 segundos. Te aviso cuando termine.",
];

type Phase = "idle" | "intro" | "ready" | "run" | "ask";

/**
 * Equilibrio: 30 s en un pie con los ojos cerrados (Standard Measures: sensoriomotor).
 * Con los ojos cerrados no se puede mirar la pantalla: la voz guía todo y va siempre
 * coordinada con lo que se muestra. Cada frase espera a que termine la anterior.
 */
export function BalanceTest({ astronautId, onDone }: { astronautId: string; onDone: (r: AssessmentResult) => void }) {
  const submit = useAppStore((s) => s.submitBalance);
  const speech = useSpeech();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const [ready, setReady] = useState<string | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [voiceOn, setVoiceOn] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const useVoice = voiceOn && speech.supported;

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  };
  useEffect(() => clearAll, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  /**
   * Dice `text` y sigue con `next` cuando la voz termina, pero nunca antes de `minMs`.
   * Si la voz falla o está apagada, espera un tiempo estimado de lectura: el ritmo no cambia.
   */
  const say = (text: string, next: () => void, minMs = 0) => {
    const started = performance.now();
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      later(next, Math.max(0, minMs - (performance.now() - started)));
    };
    if (useVoice) {
      speech.speak(text, finish);
      // Red de seguridad por si el navegador no avisa el final de la lectura.
      later(finish, Math.max(minMs, 1200 + (text.length * 85) / speech.rate));
    } else {
      later(finish, minMs);
    }
  };

  const start = () => {
    clearAll();
    setLeft(SECONDS);
    if (useVoice) {
      setPhase("intro");
      readStep(0);
    } else {
      countIn();
    }
  };

  const readStep = (i: number) => {
    if (i >= STEPS.length) return countIn();
    setStep(i);
    say(t(STEPS[i]), () => readStep(i + 1), 600);
  };

  const skipIntro = () => {
    clearAll();
    speech.stop();
    countIn();
  };

  // "Preparate · 3 · 2 · 1 · ¡Ya!": cada palabra aparece cuando se dice y dura al menos 1 s.
  const countIn = () => {
    setPhase("ready");
    setStep(-1);
    const words = [t("Preparate"), "3", "2", "1", t("¡Ya!")];
    const next = (i: number) => {
      if (i >= words.length) return run();
      setReady(words[i]);
      say(i === words.length - 1 ? t("Ya. Ojos cerrados.") : words[i], () => next(i + 1), 1000);
    };
    next(0);
  };

  const run = () => {
    setPhase("run");
    setReady(null);
    const t0 = performance.now();
    let shown = SECONDS;
    ticker.current = setInterval(() => {
      const value = SECONDS - Math.floor((performance.now() - t0) / 1000);
      if (value === shown) return;
      shown = value;
      if (value <= 0) {
        if (ticker.current) clearInterval(ticker.current);
        setLeft(0);
        say(t("Tiempo. Abrí los ojos y apoyá el pie."), () => {
          setPhase("ask");
          if (useVoice) speech.speak(t("¿Pudiste mantener el equilibrio sin apoyar el pie?"));
        });
        return;
      }
      setLeft(value);
      // Cada 5 s y cada segundo en los últimos 10: el número que se dice es el que se ve.
      if (useVoice && (value % 5 === 0 || value <= 10)) speech.speak(String(value));
    }, 50);
  };

  const center =
    phase === "idle"
      ? { title: t("Equilibrio en un pie"), big: String(SECONDS), sub: t("segundos") }
      : phase === "intro"
        ? { title: t("Paso {n} de {total}", { n: step + 1, total: STEPS.length }), big: null, sub: t(STEPS[step]) }
        : phase === "ready"
          ? { title: t("Preparate"), big: ready === t("Preparate") ? "…" : ready, sub: t("Levantá el pie") }
          : phase === "run"
            ? { title: t("Ojos cerrados, aguantá"), big: String(left), sub: t("segundos") }
            : { title: t("¿Pudiste mantener el equilibrio?"), big: null, sub: t("Respondé con sinceridad: sirve para cuidarte afuera.") };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex min-h-96 flex-col items-center justify-center gap-5 rounded-2xl border bg-card p-8 text-center" aria-live="polite">
        <span className="font-display text-3xl font-bold">{center.title}</span>
        {center.big && <span className={cn("font-display text-8xl font-bold tabular-nums", phase === "run" && left <= 5 ? "text-warn-strong" : "text-primary")}>{center.big}</span>}
        <span className={cn("max-w-md", phase === "intro" ? "text-2xl font-semibold" : "text-muted-foreground")}>{center.sub}</span>

        {phase === "idle" && (
          <div className="flex flex-col items-center gap-3">
            <Button size="xl" onClick={start}>
              {t("Empezar")}
            </Button>
            {speech.supported && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} className="size-4 accent-primary" />
                {t("Guiarme con voz (instrucciones y cuenta)")}
              </label>
            )}
          </div>
        )}
        {phase === "intro" && (
          <Button variant="ghost" onClick={skipIntro}>
            {t("Ya lo sé, saltar instrucciones")}
          </Button>
        )}
        {phase === "ask" && (
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="xl" onClick={() => onDone(submit(astronautId, true))}>
              {t("Sí, sin apoyar el pie")}
            </Button>
            <Button size="xl" variant="outline" onClick={() => onDone(submit(astronautId, false))}>
              {t("Apoyé el pie")}
            </Button>
          </div>
        )}
      </div>
      <aside className="flex flex-col gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <span className="font-semibold text-muted-foreground">{t("Cómo hacerlo")}</span>
          <ol className="mt-2 flex flex-col gap-1">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={cn(
                  "flex gap-2 rounded-lg px-2 py-1.5 leading-snug transition-colors",
                  phase === "intro" && i === step ? "bg-accent font-semibold text-primary" : phase === "intro" && i > step && "text-muted-foreground",
                )}
              >
                <span className="font-semibold">{i + 1}.</span>
                {t(s)}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
          {t("El oído interno se altera con los cambios de gravedad. Si hoy te cuesta, afuera, con el traje, te va a costar más.")}
        </div>
      </aside>
    </div>
  );
}
