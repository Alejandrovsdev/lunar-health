"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Footprints, House } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatNumber } from "@/shared/lib/format";
import { useNow } from "@/shared/lib/use-now";
import { TONE_CLASSES, TONE_LABEL, TONE_RANK, type Tone } from "@/shared/domain/status";
import { LiveBadge, PlainValue, StatusDot, StatusPill } from "@/shared/components/status";
import { CrewAvatar } from "@/shared/components/avatar";
import { useAppStore } from "@/core/store";
import { evaPosition, suitSnapshot, type SuitSnapshot } from "@/modules/telemetry";
import type { Astronaut, Location } from "../domain/types";
import { summarizeHealth, type HealthSummary } from "../domain/status";
import { LOCATION_LABEL, LOCATION_ORDER } from "../domain/location";
import { useAstronauts } from "./hooks";
import { basicFactsLine } from "./astronaut-facts";

/** Clase literal para que Tailwind la detecte. */
const LG_COLS = "lg:grid-cols-[minmax(240px,1.25fr)_minmax(190px,1fr)_minmax(0,2.4fr)_minmax(170px,1fr)]";

type Triage =
  | { kind: "interior"; astronaut: Astronaut; tone: Tone; health: HealthSummary }
  | { kind: "exterior"; astronaut: Astronaut; tone: Tone; snapshot: SuitSnapshot; distanceKm: number; partner?: Astronaut };

/**
 * Estado de cada astronauta calculado a nivel del tablero, para poder agrupar y ordenar.
 * Hábitat: parámetros diarios + seguimiento post-salida. EVA: telemetría del traje en vivo (cada segundo).
 */
function useCrewTriage(): Triage[] {
  const astronauts = useAstronauts();
  const readings = useAppStore((s) => s.readings);
  const followUps = useAppStore((s) => s.followUps);
  const now = useNow(1000);

  const interior = useMemo(
    () => new Map(astronauts.filter((a) => a.location === "interior").map((a) => [a.id, summarizeHealth(a.id, readings, followUps)])),
    [astronauts, readings, followUps],
  );

  return astronauts.flatMap<Triage>((a) => {
    if (a.location === "exterior") {
      if (!a.eva) return [];
      const snapshot = suitSnapshot(a.eva.startedAt, now, a.eva.plannedHours, a.eva.suitVariant);
      const { distanceKm } = evaPosition(snapshot.elapsedS, a.eva.plannedHours);
      const partner = astronauts.find((p) => p.id === a.eva?.partnerId);
      return [{ kind: "exterior", astronaut: a, tone: snapshot.alert?.tone ?? "ok", snapshot, distanceKm, partner }];
    }
    const health = interior.get(a.id)!;
    return [{ kind: "interior", astronaut: a, tone: health.tone, health }];
  });
}

/** Agrupa por ubicación (EVA primero) y ordena por gravedad. Sort estable: con igual estado se respeta el orden original. */
function groupAndSort(items: Triage[]) {
  return LOCATION_ORDER.map((location) => ({
    location,
    items: items.filter((t) => t.astronaut.location === location).sort((x, y) => TONE_RANK[y.tone] - TONE_RANK[x.tone]),
  })).filter((g) => g.items.length > 0);
}

/** Motivo en una línea: lo que hay que saber de esta persona ahora. */
function reasonOf(t: Triage): string {
  if (t.kind === "interior") return t.health.headline;
  return t.snapshot.alert ? t.snapshot.alert.text.split(".")[0] : "Todo en rango";
}

/** Próximo paso concreto. Siempre hay uno, también cuando todo está bien. */
function actionOf(t: Triage): string {
  if (t.kind === "exterior") {
    if (!t.snapshot.alert) return "Seguir con el plan";
    const rest = t.snapshot.alert.text.split(".").slice(1).join(".").trim();
    return rest || TONE_LABEL[t.tone];
  }
  const h = t.health;
  if (h.attention.length > 0) return t.tone === "bad" ? "Avisar a la tripulación" : "Seguir las indicaciones de su ficha";
  if (h.missing.length > 0) return "Completar los registros de hoy";
  return "Seguir con la rutina";
}

export function CrewBoard() {
  const triage = useCrewTriage();
  const groups = groupAndSort(triage);
  return (
    <section aria-label="Tripulación" className="flex flex-col gap-8">
      <div className={cn("hidden gap-6 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:grid", LG_COLS)}>
        <span>Astronauta</span>
        <span>Estado</span>
        <span>Parámetros</span>
        <span>Qué hacer</span>
      </div>
      {groups.map((g) => (
        <CrewGroup key={g.location} location={g.location} items={g.items} />
      ))}
      <p className="text-xs text-muted-foreground">
        Fotos: NASA (dominio público). Nombres y datos de salud ficticios; no representan a las personas retratadas.
      </p>
    </section>
  );
}

function CrewGroup({ location, items }: { location: Location; items: Triage[] }) {
  const label = LOCATION_LABEL[location];
  const Icon = location === "exterior" ? Footprints : House;
  const bad = items.filter((t) => t.tone === "bad").length;
  const warn = items.filter((t) => t.tone === "warn").length;
  const headingId = `crew-group-${location}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center gap-3 border-b pb-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Icon aria-hidden className="size-5" />
        </span>
        <h2 id={headingId} className="text-xl font-semibold">
          {label.group}
        </h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "astronauta" : "astronautas"}
        </span>
        <span className="ml-auto flex gap-2">
          {bad > 0 && <StatusPill tone="bad" label={`${bad} en alerta`} />}
          {warn > 0 && <StatusPill tone="warn" label={`${warn} en atención`} />}
          {bad === 0 && warn === 0 && <StatusPill tone="ok" label="Todo normal" />}
        </span>
      </header>
      <div className="flex flex-col gap-3">
        {items.map((t) => (t.kind === "exterior" ? <ExteriorRow key={t.astronaut.id} t={t} /> : <InteriorRow key={t.astronaut.id} t={t} />))}
      </div>
    </section>
  );
}

/** Borde según gravedad: crítico = rojo grueso que late; atención = ámbar fijo; normal = sin énfasis. */
function rowFrame(tone: Tone) {
  if (tone === "bad") return "border-2 border-l-8 border-bad bg-bad-soft/40 motion-safe:animate-alert-pulse";
  if (tone === "warn") return "border-2 border-l-8 border-warn bg-warn-soft/30";
  // Sin franja: se compensa el padding izquierdo para que fotos y columnas queden alineadas con las filas con franja.
  return "border bg-card pl-[27px] lg:pl-[31px]";
}

const ROW = cn("grid min-h-28 grid-cols-1 items-center gap-4 rounded-2xl p-5 transition-colors lg:gap-6 lg:p-6", LG_COLS);

function Who({ a, tone, live, nameAsLink }: { a: Astronaut; tone: Tone; live?: boolean; nameAsLink?: boolean }) {
  return (
    <span className="flex items-center gap-4">
      <CrewAvatar name={a.name} photo={a.photo} tone={tone} />
      <span className="flex min-w-0 flex-col gap-1">
        {tone === "bad" && <span className="sr-only">Alerta crítica.</span>}
        {nameAsLink ? (
          // El enlace se estira a toda la tarjeta (after:inset-0): no se pueden anidar <a>, y la fila tiene el botón de Mapa.
          <Link
            href={`/astronautas/${a.id}`}
            className="font-display text-xl font-semibold after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {a.name}
          </Link>
        ) : (
          <span className="font-display text-xl font-semibold">{a.name}</span>
        )}
        <span className="text-sm text-muted-foreground">{a.role}</span>
        {basicFactsLine(a) && <span className="text-xs text-muted-foreground">{basicFactsLine(a)}</span>}
        {live && <LiveBadge label="EN VIVO · traje" />}
      </span>
    </span>
  );
}

function InteriorRow({ t }: { t: Extract<Triage, { kind: "interior" }> }) {
  const { astronaut: a, health: h, tone } = t;
  const n = h.attention.length;
  const measured = h.total - h.missing.length;
  const action = actionOf(t);
  return (
    <Link href={`/astronautas/${a.id}`} className={cn(ROW, rowFrame(tone), "hover:border-primary")}>
      <Who a={a} tone={tone} />
      <span className="flex flex-col items-start gap-1.5">
        <StatusPill tone={tone} />
        <span className="text-sm">{h.headline}</span>
      </span>
      <span className="flex flex-wrap items-center gap-4">
        {n === 0 ? (
          <span className="flex items-center gap-2 text-sm font-semibold text-ok-strong">
            <StatusDot tone="ok" />
            {measured}/{measured} en rango
          </span>
        ) : (
          // Solo el indicador: el detalle de cada parámetro está en la ficha (la fila entera es el enlace).
          <span className={cn("flex min-w-24 flex-col items-center rounded-xl px-3 py-2", TONE_CLASSES[tone].soft, TONE_CLASSES[tone].strong)}>
            <span className="font-display text-3xl font-bold leading-none">
              {n}
              <span className="text-lg"> / {h.total}</span>
            </span>
            <span className="text-xs font-semibold">a atender</span>
          </span>
        )}
        {(h.followUpCount > 0 || h.missing.length > 0 || a.nextEva) && (
          <span className="flex basis-full flex-col gap-0.5">
            {h.missing.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <StatusDot tone="pending" className="size-2" />
                Sin datos hoy: {h.missing.map((s) => s.label.toLowerCase()).join(", ")}
              </span>
            )}
            {h.followUpCount > 0 && <span className="text-xs text-muted-foreground">Incluye {h.followUpCount} de seguimiento post-salida</span>}
            {a.nextEva && (
              <span className="text-xs text-muted-foreground">
                Próxima EVA: {new Date(a.nextEva.at).toLocaleString("es-AR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </span>
        )}
      </span>
      <span className={cn("text-sm font-semibold", tone === "bad" && "text-bad-strong", tone === "ok" && "font-normal text-muted-foreground")}>{action}</span>
    </Link>
  );
}

function ExteriorRow({ t }: { t: Extract<Triage, { kind: "exterior" }> }) {
  const { astronaut: a, snapshot, distanceKm, tone, partner } = t;
  const [pressure, hr, temp] = snapshot.channels;
  const headline = reasonOf(t);
  const action = actionOf(t);
  const rad = snapshot.radiation;
  const tiles = [
    ...[pressure, hr, temp].map((c) => ({ id: c.id, label: c.label, tone: c.tone, plain: c.plain, detail: `${formatNumber(c.value, c.decimals)} ${c.unit}` })),
    ...(rad ? [{ id: "radiation", label: "Radiación", tone: rad.tone, plain: rad.plain, detail: `${formatNumber(rad.rateUSvH)} µSv/h` }] : []),
  ];
  return (
    <div className={cn(ROW, rowFrame(tone), "relative cursor-pointer hover:border-primary")}>
      <Who a={a} tone={tone} live nameAsLink />
      <span className="flex flex-col items-start gap-1.5">
        <StatusPill tone={tone} />
        <span className="text-sm">{headline}</span>
        <span className="text-xs text-muted-foreground">
          {partner && <>Con {partner.name} · </>}Volver en {formatDuration(snapshot.returnAtS - snapshot.elapsedS)}
        </span>
      </span>
      <span className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {tiles.map((c) => (
          <span key={c.id} className={cn("flex flex-col gap-0.5 rounded-xl px-3 py-2", c.tone === "ok" ? "bg-muted" : TONE_CLASSES[c.tone].soft)}>
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <span className="flex items-center gap-2">
              <StatusDot tone={c.tone} />
              <PlainValue tone={c.tone} size="sm" plain={c.plain} detail={c.detail} />
            </span>
          </span>
        ))}
      </span>
      <span className="flex flex-col items-start gap-2">
        <Link
          href={`/astronautas/${a.id}/mapa`}
          className="relative z-10 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {formatNumber(distanceKm, 2)} km · Mapa →
        </Link>
        <span className={cn("text-sm font-semibold", tone === "bad" && "text-bad-strong")}>{action}</span>
      </span>
    </div>
  );
}
