"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, HeartPulse, RefreshCw, Thermometer, Wind } from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { PlainValue } from "@/shared/components/status";
import { Button } from "@/shared/ui/button";
import { PARAMETERS } from "@/modules/monitoring";
import type { ParameterId } from "@/modules/monitoring";
import type { VitalsInput } from "../domain/types";
import { VitalsFields } from "./parts";

/**
 * Signos vitales tomados por los sensores biomédicos del traje (simulados).
 * Cada sensor mide en orden, como en un chequeo real. Los valores parten de las últimas
 * lecturas del astronauta con una variación chica, así cada caso de la demo es coherente.
 * Si un sensor falla, se pueden corregir a mano.
 */
const CHANNELS = [
  { key: "spo2", param: "spo2", label: "Oxígeno en sangre", sensor: "Oxímetro del guante", icon: Wind },
  { key: "restingHr", param: "restingHr", label: "Pulso", sensor: "Cinturón biomédico (ECG)", icon: HeartPulse },
  { key: "bloodPressure", param: "bloodPressure", label: "Presión arterial", sensor: "Manguito del brazo", icon: Activity },
  { key: "temperature", param: "temperature", label: "Temperatura", sensor: "Sensor de piel de la prenda térmica", icon: Thermometer },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];

const CONNECT_MS = 1200;
const MEASURE_MS = 1100;
const DEFAULTS = { spo2: 98, restingHr: 68, systolic: 118, diastolic: 76, temperature: 36.6 };

export function SuitVitalsReading({
  astronautId,
  form,
  onChange,
}: {
  astronautId: string;
  form: VitalsInput;
  onChange: (patch: Partial<VitalsInput>) => void;
}) {
  const readings = useAppStore((s) => s.readings);
  const filled = [form.spo2, form.restingHr, form.systolic, form.diastolic, form.temperature].every((v) => v !== "");
  // Al volver a este paso con valores ya tomados, no se mide de nuevo.
  const [attempt, setAttempt] = useState(filled ? -1 : 0);
  const [measured, setMeasured] = useState(filled ? CHANNELS.length : -1);
  const [manual, setManual] = useState(false);

  const baseline = useMemo(() => {
    const last = (id: ParameterId) => readings.filter((r) => r.astronautId === astronautId && r.parameterId === id).at(-1);
    const bp = last("bloodPressure");
    return {
      spo2: last("spo2")?.value ?? DEFAULTS.spo2,
      restingHr: last("restingHr")?.value ?? DEFAULTS.restingHr,
      systolic: bp?.value ?? DEFAULTS.systolic,
      diastolic: bp?.value2 ?? DEFAULTS.diastolic,
      temperature: last("temperature")?.value ?? DEFAULTS.temperature,
    };
  }, [readings, astronautId]);

  useEffect(() => {
    if (attempt < 0 || manual) return;
    const noise = (key: string) => jitter(`${astronautId}-${attempt}-${key}`);
    const values: Record<ChannelKey, Partial<VitalsInput>> = {
      spo2: { spo2: Math.min(100, Math.round(baseline.spo2 + noise("spo2"))) },
      restingHr: { restingHr: Math.round(baseline.restingHr + noise("hr") * 3) },
      bloodPressure: {
        systolic: Math.round(baseline.systolic + noise("sys") * 4),
        diastolic: Math.round(baseline.diastolic + noise("dia") * 3),
      },
      temperature: { temperature: Math.round((baseline.temperature + noise("temp") * 0.1) * 10) / 10 },
    };
    setMeasured(-1);
    onChange({ spo2: "", restingHr: "", systolic: "", diastolic: "", temperature: "" });
    const timers = [setTimeout(() => setMeasured(0), CONNECT_MS)];
    CHANNELS.forEach((c, i) => {
      timers.push(
        setTimeout(() => {
          onChange(values[c.key]);
          setMeasured(i + 1);
        }, CONNECT_MS + (i + 1) * MEASURE_MS),
      );
    });
    return () => timers.forEach(clearTimeout);
    // Se mide una vez por intento; baseline y onChange no deben reiniciar la medición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, manual]);

  const connecting = measured < 0;
  const done = measured >= CHANNELS.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted px-4 py-3" aria-live="polite">
        <span className={cn("size-2.5 rounded-full", done ? "bg-ok" : "animate-live bg-info")} aria-hidden />
        <span className="font-semibold">
          {manual
            ? t("Carga manual")
            : connecting
              ? t("Conectando con los sensores del traje…")
              : done
                ? t("Sensores del traje · medición completa")
                : t("Midiendo con los sensores del traje · {n} de {total}", { n: measured + 1, total: CHANNELS.length })}
        </span>
        {!manual && !done && <span className="text-sm text-muted-foreground">{t("Quedate quieto/a y respirá normal.")}</span>}
      </div>

      {manual ? (
        <VitalsFields form={form} onChange={onChange} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {CHANNELS.map((c, i) => {
            const state = connecting || i > measured ? "wait" : i === measured ? "measuring" : "done";
            return <Channel key={c.key} channel={c} state={state} form={form} />;
          })}
        </div>
      )}

      {(done || manual) && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setManual(false);
              setAttempt((n) => Math.max(0, n) + 1);
            }}
          >
            <RefreshCw aria-hidden className="size-4" />
            {t("Volver a medir")}
          </Button>
          {!manual && (
            <Button variant="ghost" onClick={() => setManual(true)}>
              {t("Corregir a mano")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Channel({
  channel: c,
  state,
  form,
}: {
  channel: (typeof CHANNELS)[number];
  state: "wait" | "measuring" | "done";
  form: VitalsInput;
}) {
  const Icon = c.icon;
  const value = state === "done" ? read(c.key, form) : null;
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors", state === "measuring" && "border-info bg-info-soft/40")}>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          state === "done" ? "bg-secondary text-secondary-foreground" : state === "measuring" ? "bg-info text-white" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon aria-hidden className={cn("size-5", state === "measuring" && "animate-live")} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-muted-foreground">{t(c.label)}</span>
        {value ? (
          <PlainValue tone={value.tone} plain={value.plain} detail={value.detail} size="sm" />
        ) : (
          <span className={cn("font-semibold", state === "measuring" ? "text-info-strong" : "text-muted-foreground")}>
            {state === "measuring" ? t("Midiendo…") : t("En espera")}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{t(c.sensor)}</span>
      </span>
    </div>
  );
}

function read(key: ChannelKey, f: VitalsInput) {
  const def = PARAMETERS[key];
  const value = key === "bloodPressure" ? f.systolic : f[key];
  if (value === "") return null;
  const ev = def.evaluate({ id: "", astronautId: "", parameterId: key, value: Number(value), value2: key === "bloodPressure" ? Number(f.diastolic) : undefined, at: "", source: "esclusa" });
  const text = key === "bloodPressure" ? `${f.systolic}/${f.diastolic} mmHg` : key === "temperature" ? `${formatNumber(Number(value), 1)} °C` : `${value} ${t(def.unit)}`;
  return { tone: ev.tone, plain: t(ev.plain), detail: `${text} · ${t("normal: {range}", { range: t(def.normalText) })}` };
}

/** Ruido determinístico en [-1, 1] para que la demo sea reproducible. */
function jitter(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) / 4294967295) * 2 - 1;
}
