"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatNumber } from "@/shared/lib/format";
import { TONE_CLASSES, TONE_LABEL } from "@/shared/domain/status";
import { LiveBadge, PlainValue, StatusDot, StatusPill } from "@/shared/components/status";
import { useSuit } from "@/modules/telemetry";
import type { Astronaut } from "../domain/types";
import { useAstronauts, useHealthSummary } from "./hooks";

/** Clase literal para que Tailwind la detecte. */
const LG_COLS = "lg:grid-cols-[minmax(180px,1.1fr)_120px_minmax(200px,1.2fr)_minmax(0,2.6fr)_minmax(160px,1fr)]";

export function CrewBoard() {
  const astronauts = useAstronauts();
  return (
    <section aria-label="Tripulación" className="flex flex-col gap-4">
      <div className={cn("hidden gap-6 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:grid", LG_COLS)}>
        <span>Astronauta</span>
        <span>Dónde está</span>
        <span>Estado</span>
        <span>Parámetros</span>
        <span>Qué hacer</span>
      </div>
      {astronauts.map((a) => (a.location === "exterior" ? <ExteriorRow key={a.id} astronaut={a} /> : <InteriorRow key={a.id} astronaut={a} />))}
    </section>
  );
}

function Who({ a }: { a: Astronaut }) {
  return (
    <span className="flex flex-col">
      <span className="font-display text-xl font-semibold">{a.name}</span>
      <span className="text-sm text-muted-foreground">{a.role}</span>
    </span>
  );
}

function Where({ a }: { a: Astronaut }) {
  return (
    <span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
      {a.location === "exterior" ? "Exterior" : "Interior"}
    </span>
  );
}

function InteriorRow({ astronaut: a }: { astronaut: Astronaut }) {
  const h = useHealthSummary(a.id);
  const n = h.attention.length;
  const countTone = n === 0 ? "ok" : h.tone;
  const action = h.attention[0] ? (h.tone === "bad" ? "Avisar a la tripulación" : "Seguir las indicaciones de su ficha") : "—";
  return (
    <Link
      href={`/astronautas/${a.id}`}
      className={cn("grid grid-cols-1 items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-primary lg:gap-6", LG_COLS)}
    >
      <Who a={a} />
      <Where a={a} />
      <span className="flex flex-col items-start gap-1.5">
        <StatusPill tone={h.tone} />
        <span className="text-sm">{h.headline}</span>
      </span>
      <span className="flex flex-wrap items-center gap-4">
        <span className={cn("flex min-w-28 flex-col items-center rounded-xl px-4 py-2", TONE_CLASSES[countTone].soft, TONE_CLASSES[countTone].strong)}>
          <span className="font-display text-4xl font-bold leading-none">
            {n}
            <span className="text-xl"> / {h.total}</span>
          </span>
          <span className="text-xs font-semibold">a atender</span>
        </span>
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap gap-1.5">
            {n === 0 ? (
              <span className="font-semibold text-ok-strong">Todo en rango</span>
            ) : (
              h.attention.map((s) => (
                <span key={s.id} className={cn("rounded-full px-2.5 py-1 text-sm font-semibold", TONE_CLASSES[s.tone].soft, TONE_CLASSES[s.tone].strong)}>
                  {s.label} · {s.plain.toLowerCase()}
                </span>
              ))
            )}
          </span>
          {h.total > 10 && <span className="text-xs text-muted-foreground">Incluye {h.total - 10} de seguimiento post-salida</span>}
          {a.nextEva && <span className="text-xs text-muted-foreground">Próxima salida: {new Date(a.nextEva.at).toLocaleString("es-AR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>}
        </span>
      </span>
      <span className="text-sm font-medium">{action}</span>
    </Link>
  );
}

function ExteriorRow({ astronaut: a }: { astronaut: Astronaut }) {
  const live = useSuit(a.eva);
  if (!live) return null;
  const { snapshot, position } = live;
  const tone = snapshot.alert?.tone ?? "ok";
  const [pressure, hr, temp] = snapshot.channels;
  return (
    <div className={cn("grid grid-cols-1 items-center gap-4 rounded-2xl border-2 border-primary bg-card p-5 lg:gap-6", LG_COLS)}>
      <span className="flex flex-col gap-1">
        <Link href={`/astronautas/${a.id}`} className="font-display text-xl font-semibold hover:underline">
          {a.name}
        </Link>
        <span className="text-sm text-muted-foreground">{a.role}</span>
        <LiveBadge label="EN VIVO · traje" />
      </span>
      <Where a={a} />
      <span className="flex flex-col items-start gap-1.5">
        <StatusPill tone={tone} />
        <span className="text-sm">{snapshot.alert ? snapshot.alert.text.split(".")[0] : "Todo en rango"}</span>
        <span className="text-xs text-muted-foreground">Volver en {formatDuration(snapshot.returnAtS - snapshot.elapsedS)}</span>
      </span>
      <span className="grid grid-cols-3 gap-2">
        {[pressure, hr, temp].map((c) => (
          <span key={c.id} className="flex flex-col gap-0.5 rounded-xl bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <span className="flex items-center gap-2">
              <StatusDot tone={c.tone} />
              <PlainValue tone={c.tone} size="sm" plain={c.plain} detail={`${formatNumber(c.value, c.decimals)} ${c.unit}`} />
            </span>
          </span>
        ))}
      </span>
      <span className="flex flex-col items-start gap-2">
        <Link
          href={`/astronautas/${a.id}/mapa`}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {formatNumber(position.distanceKm, 2)} km · Mapa →
        </Link>
        <span className="text-sm font-medium">{snapshot.alert ? snapshot.alert.text.split(".").slice(1).join(".").trim() || TONE_LABEL[tone] : "Seguir con el plan"}</span>
      </span>
    </div>
  );
}
