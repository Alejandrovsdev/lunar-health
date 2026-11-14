"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES, TONE_HEX, TONE_LABEL, worstTone, type Tone } from "@/shared/domain/status";
import { PlainValue, StatusDot } from "@/shared/components/status";
import { SectionLabel } from "@/shared/components/page-header";
import { BODY_ZONES } from "../domain/body-zones";
import { useHealthSummary } from "./hooks";

/** Mapa corporal interactivo (M2): la figura que propone la NASA en el desafío. */
export function BodyMap({ astronautId }: { astronautId: string }) {
  const h = useHealthSummary(astronautId);
  const [sel, setSel] = useState(0);
  const zones = BODY_ZONES.map((z) => {
    const statuses = h.statuses.filter((s) => z.parameters.includes(s.id));
    const tone: Tone = statuses.length ? worstTone(statuses.map((s) => s.tone)) : z.note ? (z.id === "bones" ? "info" : "ok") : "ok";
    return { ...z, statuses, tone };
  });
  const cur = zones[sel];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section aria-label="Figura del cuerpo" className="flex items-center justify-center rounded-2xl border bg-card p-4">
        <svg viewBox="0 0 300 600" className="h-[560px] w-auto" role="img" aria-label="Figura del cuerpo con zonas de color según su estado">
          <circle cx="150" cy="58" r="40" fill="#e5e7eb" />
          <rect x="134" y="94" width="32" height="22" fill="#e5e7eb" />
          <rect x="95" y="112" width="110" height="220" rx="40" fill="#e5e7eb" />
          <rect x="58" y="122" width="32" height="200" rx="16" fill="#e5e7eb" />
          <rect x="210" y="122" width="32" height="200" rx="16" fill="#e5e7eb" />
          <rect x="104" y="325" width="42" height="255" rx="20" fill="#e5e7eb" />
          <rect x="154" y="325" width="42" height="255" rx="20" fill="#e5e7eb" />
          {zones.map((z, i) => (
            <g key={z.id} onClick={() => setSel(i)} className="cursor-pointer">
              {i === sel && <circle cx={z.x} cy={z.y} r="26" fill={TONE_HEX[z.tone]} opacity="0.22" />}
              <circle cx={z.x} cy={z.y} r="14" fill={TONE_HEX[z.tone]} stroke={i === sel ? "#111827" : "#fff"} strokeWidth="4" />
            </g>
          ))}
        </svg>
      </section>

      <div className="flex flex-col gap-4">
        <div role="group" aria-label="Zonas del cuerpo" className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {zones.map((z, i) => (
            <button
              key={z.id}
              type="button"
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-lg border-2 px-3 text-left text-sm font-semibold",
                i === sel ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted",
              )}
            >
              <StatusDot tone={z.tone} />
              {z.name}
            </button>
          ))}
        </div>

        <section aria-live="polite" className="flex flex-1 flex-col gap-4 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl font-bold">{cur.name}</h2>
            <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", TONE_CLASSES[cur.tone].soft, TONE_CLASSES[cur.tone].strong)}>
              {TONE_LABEL[cur.tone]}
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <SectionLabel>Qué hace</SectionLabel>
              <p className="text-base">{cur.function}</p>
            </div>
            <div className="flex flex-col gap-1">
              <SectionLabel>Cómo lo afecta el espacio</SectionLabel>
              <p className="text-[15px] leading-relaxed">{cur.space}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <SectionLabel>Tus indicadores</SectionLabel>
            <div className="flex flex-wrap gap-3">
              {cur.statuses.map((s) => (
                <div key={s.id} className="flex min-w-44 flex-col gap-1 rounded-xl bg-muted px-4 py-3">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <PlainValue tone={s.tone} plain={s.plain} detail={s.detail} size="sm" />
                </div>
              ))}
              {cur.note && (
                <div className="flex min-w-44 flex-col gap-1 rounded-xl bg-muted px-4 py-3">
                  <span className="text-sm text-muted-foreground">Dato de laboratorio o test</span>
                  <PlainValue tone={cur.tone} plain={cur.note.plain} detail={cur.note.detail} size="sm" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-1 rounded-xl bg-secondary p-4">
            <SectionLabel>Qué hacer</SectionLabel>
            <p className="text-base">{cur.todo}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
