"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  /** El paso tiene todo lo obligatorio completo. */
  valid: boolean;
  content: ReactNode;
}

/** Formulario por pasos de la esclusa: lista de pasos a la izquierda, paso actual a la derecha. */
export function Wizard({ steps, finish }: { steps: WizardStep[]; finish: ReactNode }) {
  const [i, setI] = useState(0);
  const step = steps[i];
  const isLast = i === steps.length - 1;
  const firstInvalid = steps.findIndex((s) => !s.valid);
  const canReach = (k: number) => firstInvalid === -1 || k <= firstInvalid;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <nav aria-label="Pasos" className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
        {steps.map((s, k) => {
          const done = k < i && s.valid;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!canReach(k)}
              aria-current={k === i ? "step" : undefined}
              onClick={() => setI(k)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 text-left disabled:opacity-50",
                k === i ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  k === i ? "bg-primary text-primary-foreground" : done ? "bg-foreground text-background" : "bg-border",
                )}
              >
                {done ? "✓" : k + 1}
              </span>
              <span className="font-semibold">{s.title}</span>
            </button>
          );
        })}
      </nav>

      <section aria-live="polite" className="flex min-h-[560px] flex-col gap-5 rounded-2xl border bg-card p-6 lg:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Paso {i + 1} de {steps.length}
          </span>
          <h2 className="text-3xl font-bold">{step.title}</h2>
          <p className="text-base text-muted-foreground">{step.subtitle}</p>
        </div>
        <div className="flex flex-col gap-4">{step.content}</div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Button variant="outline" size="lg" disabled={i === 0} onClick={() => setI(i - 1)}>
            Anterior
          </Button>
          {isLast ? (
            finish
          ) : (
            <Button size="lg" disabled={!step.valid} onClick={() => setI(i + 1)}>
              {step.valid ? "Siguiente" : "Completá este paso"}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
