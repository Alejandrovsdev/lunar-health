import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { StatusPill } from "@/shared/components/status";
import { SEX_LABEL, ageIn, bmi, bmiStatus, massChange } from "../domain/anthropometrics";
import { getBasicProfile } from "../data/profiles";
import type { Astronaut } from "../domain/types";

/**
 * Datos básicos para revisar a alguien de un vistazo: quién es (sexo, edad, medidas)
 * y lo que importa ante una urgencia (grupo sanguíneo, alergias).
 * El peso se muestra contra el pre-vuelo: perder masa en misión es la señal a vigilar.
 */
export function AstronautFacts({ astronaut: a }: { astronaut: Astronaut }) {
  const p = getBasicProfile(a.id);
  if (!p) return null;
  const change = massChange(a.massKg, p.preflightMassKg);
  const imc = bmi(a.massKg, p.heightCm);
  const imcStatus = bmiStatus(imc);
  const sign = change.pct > 0 ? "+" : "";

  return (
    <dl aria-label="Datos básicos" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4 xl:grid-cols-[repeat(3,minmax(0,0.7fr))_minmax(0,1.6fr)_repeat(2,minmax(0,0.8fr))_minmax(0,1.2fr)]">
      <Fact label="Sexo">{SEX_LABEL[a.sex]}</Fact>
      <Fact label="Edad">{ageIn(p.birthYear)} años</Fact>
      <Fact label="Altura">{p.heightCm} cm</Fact>
      <Fact label="Peso actual" detail={`Pre-vuelo: ${formatNumber(p.preflightMassKg, 1)} kg · ${sign}${formatNumber(change.pct, 1)} %`}>
        <span className="flex flex-wrap items-center gap-2">
          {formatNumber(a.massKg, 1)} kg
          <StatusPill tone={change.tone} label={change.plain} />
        </span>
      </Fact>
      <Fact label="IMC" detail={imcStatus.plain} detailTone={imcStatus.tone}>
        {formatNumber(imc, 1)}
      </Fact>
      <Fact label="Grupo sanguíneo">{p.bloodType}</Fact>
      {/* 7 datos: en 2 y 4 columnas, Alergias completa la última fila (sin celdas vacías). */}
      <Fact label="Alergias" highlight={p.allergies.length > 0} className="col-span-2 xl:col-span-1">
        {p.allergies.length ? p.allergies.join(", ") : <span className="font-normal text-muted-foreground">Sin alergias conocidas</span>}
      </Fact>
    </dl>
  );
}

function Fact({
  label,
  detail,
  detailTone,
  highlight,
  className,
  children,
}: {
  label: string;
  detail?: string;
  detailTone?: "ok" | "warn" | "bad" | "info" | "pending";
  highlight?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 px-4 py-3", highlight ? "bg-bad-soft" : "bg-card", className)}>
      <dt className={cn("text-xs font-semibold uppercase tracking-wider", highlight ? "text-bad-strong" : "text-muted-foreground")}>{label}</dt>
      <dd className={cn("font-display text-lg font-semibold leading-tight", highlight && "text-bad-strong")}>{children}</dd>
      {detail && (
        <dd className={cn("text-xs", detailTone && detailTone !== "ok" ? "font-semibold text-warn-strong" : "text-muted-foreground")}>{detail}</dd>
      )}
    </div>
  );
}

/** Versión de una línea para el tablero: "Femenino · 36 años · 58 kg". */
export function basicFactsLine(a: Astronaut): string | null {
  const p = getBasicProfile(a.id);
  if (!p) return null;
  return `${SEX_LABEL[a.sex]} · ${ageIn(p.birthYear)} años · ${formatNumber(a.massKg, 0)} kg`;
}
