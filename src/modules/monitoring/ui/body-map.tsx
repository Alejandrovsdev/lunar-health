"use client";

import { useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useAppStore } from "@/core/store";
import { cn } from "@/shared/lib/cn";
import { formatDay } from "@/shared/lib/format";
import { t, t as tr } from "@/shared/i18n";
import { TONE_CLASSES, TONE_HEX, TONE_LABEL, needsAttention, worstTone, type Tone } from "@/shared/domain/status";
import { PlainValue, StatusDot, StatusPill } from "@/shared/components/status";
import { SectionLabel } from "@/shared/components/page-header";
import { BODY_ZONES, type BodyLabPanel, type BodyZone } from "../domain/body-zones";
import { parameterStatus } from "../domain/status";
import type { ParameterStatus, Sex } from "../domain/types";
import { BODY_FIGURES } from "./body-figures";
import { useAstronaut, useHealthSummary } from "./hooks";
import { SOURCE_LABEL } from "./source-label";
import { TrendChart } from "./trend-chart";

interface ZoneState extends BodyZone {
  statuses: ParameterStatus[];
  labs: BodyLabPanel[];
  tone: Tone;
  /** Indicadores y estudios fuera de rango. */
  issues: number;
}

/**
 * Mapa corporal (M2): figura humana (femenina o masculina según el astronauta) con cada zona marcada
 * por su estado y una etiqueta con texto.
 * Muestra DÓNDE hay algo para atender; el detalle de cada parámetro vive en las pestañas "Resumen" y "Estudios".
 */
export function BodyMap({ astronautId, labPanels = [] }: { astronautId: string; labPanels?: BodyLabPanel[] }) {
  const h = useHealthSummary(astronautId);
  const sex = useAstronaut(astronautId)?.sex ?? "female";
  const readings = useAppStore((s) => s.readings);
  const mine = readings.filter((r) => r.astronautId === astronautId);
  const active = new Set(h.statuses.map((s) => s.id));
  const zones: ZoneState[] = BODY_ZONES.map((z) => {
    // Zona: parámetros activos del seguimiento + los que tengan lecturas propias
    // (p. ej. irritación por polvo de quien no está en un seguimiento post-salida).
    const statuses = z.parameters
      .filter((id) => active.has(id) || mine.some((r) => r.parameterId === id))
      .map((id) => parameterStatus(id, mine));
    const labs = labPanels.filter((p) => z.labPanels.includes(p.id));
    const tones = [...statuses.map((s) => s.tone), ...labs.flatMap((p) => p.rows.map((r) => r.tone))].filter((t) => t !== "pending");
    const issues = statuses.filter((s) => needsAttention(s.tone)).length + labs.flatMap((p) => p.rows).filter((r) => needsAttention(r.tone)).length;
    return { ...z, statuses, labs, tone: worstTone(tones), issues };
  });
  // Arranca en la zona más comprometida.
  const [sel, setSel] = useState(() => zones.reduce((best, z, i) => (rank(z) > rank(zones[best]) ? i : best), 0));
  const cur = zones[sel];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,560px)_1fr]">
      <section aria-label={t("Figura del cuerpo")} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <BodyFigure zones={zones} selected={sel} sex={sex} onSelect={setSel} />
        {/* En pantallas chicas las etiquetas de la figura quedan muy chicas: lista equivalente. */}
        <div role="group" aria-label={t("Zonas del cuerpo")} className="grid grid-cols-2 gap-2 lg:hidden">
          {zones.map((z, i) => (
            <button
              key={z.id}
              type="button"
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={cn(
                "flex min-h-12 flex-col items-start justify-center rounded-lg border-2 px-3 py-1.5 text-left",
                i === sel ? "border-primary bg-accent" : "border-border bg-card",
              )}
            >
              <span className="text-sm font-semibold">{t(z.short)}</span>
              <span className={cn("flex items-center gap-1.5 text-xs font-semibold", TONE_CLASSES[z.tone].strong)}>
                <StatusDot tone={z.tone} className="size-2" />
                {zoneStatusText(z)}
              </span>
            </button>
          ))}
        </div>
        <Legend />
      </section>

      <ZoneDetail zone={cur} astronautId={astronautId} />
    </div>
  );
}

function rank(z: ZoneState) {
  return ({ ok: 0, pending: 0, info: 1, warn: 2, bad: 3 } as const)[z.tone] * 100 + z.issues;
}

function zoneStatusText(z: ZoneState) {
  return z.issues > 0 ? `${t(TONE_LABEL[z.tone])} · ${z.issues}` : t(TONE_LABEL[z.tone]);
}

/* ───────────────────────── Figura ───────────────────────── */

/**
 * Lienzo: figura de 600 de alto centrada; a los costados, una columna de tarjetas por categoría.
 * Coordenadas de zona (BodySpot) relativas a la línea media y a la coronilla.
 */
const VIEW_W = 680;
const VIEW_H = 640;
const FIG_H = 600;
const FIG_TOP = 20;
const CX = VIEW_W / 2;

/** Tarjetas de categoría y tronco de las líneas guía (en x relativa a la línea media). */
const CARD_W = 160;
const CARD_H = 48;
const CARD_EDGE = 172;
const TRUNK = 158;
/** En pantallas chicas solo se ve la figura (sin tarjetas): recorte centrado. */
const MOBILE_HALF_W = 165;

const toCanvas = (s: { x: number; y: number }) => ({ x: CX + s.x, y: FIG_TOP + s.y });

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}

function BodyFigure({ zones, selected, sex, onSelect }: { zones: ZoneState[]; selected: number; sex: Sex; onSelect: (i: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const desktop = useIsDesktop();
  const fig = BODY_FIGURES[sex];
  const [bx, by, bw, bh] = fig.bbox;
  const s = FIG_H / bh;
  const figTransform = `translate(${CX - (bw * s) / 2} ${FIG_TOP}) scale(${s}) translate(${-bx} ${-by})`;
  const tones = Array.from(new Set(zones.map((z) => z.tone)));
  const viewBox = desktop ? `0 0 ${VIEW_W} ${VIEW_H}` : `${CX - MOBILE_HALF_W} 0 ${MOBILE_HALF_W * 2} ${VIEW_H}`;
  // Orden de pintado: la zona activa (seleccionada o bajo el mouse) va al final para quedar encima.
  const isActive = (i: number) => i === selected || i === hover;
  const order = zones.map((_, i) => i).sort((a, b) => Number(isActive(a)) - Number(isActive(b)));
  const link = (i: number) => ({ onSelect: () => onSelect(i), onHover: (on: boolean) => setHover(on ? i : null) });

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full"
      role="group"
      aria-label={sex === "female" ? t("Figura femenina: cada zona tiene el color y el texto de su estado") : t("Figura masculina: cada zona tiene el color y el texto de su estado")}
    >
      <defs>
        {/* Halo clínico por estado: intenso en el centro y se desvanece hacia afuera. */}
        {tones.map((t) => (
          <radialGradient key={t} id={`body-glow-${t}`}>
            <stop offset="0%" stopColor={TONE_HEX[t]} stopOpacity={0.6} />
            <stop offset="55%" stopColor={TONE_HEX[t]} stopOpacity={0.28} />
            <stop offset="100%" stopColor={TONE_HEX[t]} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>

      {/* Silueta anatómica (dominio público / CC0, ver body-figures.ts). */}
      <g transform={figTransform} aria-hidden>
        <path d={fig.d} fill="#eef2f6" stroke="#94a3b8" strokeWidth={1.2 / s} fillRule="evenodd" />
      </g>
      <line x1={CX} y1={FIG_TOP + 70} x2={CX} y2={FIG_TOP + 300} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 4" aria-hidden />

      {/* Halos debajo de las líneas, para que las líneas se lean enteras. */}
      {zones.map((z) =>
        needsAttention(z.tone)
          ? z.spots.map((spot) => {
              const p = toCanvas(spot);
              return <circle key={`${z.id}-glow-${spot.x}-${spot.y}`} cx={p.x} cy={p.y} r={spot.r * 1.35} fill={`url(#body-glow-${z.tone})`} aria-hidden />;
            })
          : null,
      )}

      {desktop && order.map((i) => <ZoneLeader key={zones[i].id} zone={zones[i]} active={isActive(i)} {...link(i)} />)}
      {order.map((i) => (
        <ZoneHotspot key={zones[i].id} zone={zones[i]} selected={i === selected} active={i === hover} {...link(i)} />
      ))}
    </svg>
  );
}

/** Color de la línea y del borde de la tarjeta: el del estado si hay que atender; gris si está normal. */
function zoneInk(z: ZoneState, active: boolean) {
  if (needsAttention(z.tone)) return TONE_HEX[z.tone];
  return active ? "#334155" : "#94a3b8";
}

/**
 * Tarjeta de la categoría + línea guía que la une a TODOS sus puntos:
 * tramo desde la tarjeta hasta un tronco vertical y, desde el tronco, un tramo horizontal por cada altura
 * (si la zona es par, como pulmones, ojos o rodillas, el tramo atraviesa ambos puntos).
 */
function ZoneLeader({ zone: z, active, onSelect, onHover }: { zone: ZoneState; active: boolean; onSelect: () => void; onHover: (on: boolean) => void }) {
  const left = z.label.side === "left";
  const dir = left ? -1 : 1;
  const cardY = z.label.y;
  const ink = zoneInk(z, active);
  const width = active ? 2.25 : 1.5;

  const trunkX = dir * TRUNK;
  const ys = Array.from(new Set(z.spots.map((p) => p.y)));
  const minY = Math.min(cardY, ...ys);
  const maxY = Math.max(cardY, ...ys);
  const rows = ys.map((y) => {
    const xs = z.spots.filter((p) => p.y === y).map((p) => p.x);
    // Hasta el punto más alejado del tronco: así una zona par queda unida con una sola línea.
    return { y, far: left ? Math.max(...xs) : Math.min(...xs) };
  });
  const c = (x: number, y: number) => toCanvas({ x, y });
  const edge = c(dir * CARD_EDGE, cardY);
  const trunkTop = c(trunkX, minY);
  const trunkBottom = c(trunkX, maxY);
  const card = c(left ? -CARD_EDGE - CARD_W : CARD_EDGE, cardY - CARD_H / 2);
  const textX = left ? card.x + CARD_W - 13 : card.x + 13;
  const anchor = left ? "end" : "start";

  return (
    <g aria-hidden onClick={onSelect} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} className="cursor-pointer">
      <g stroke={ink} strokeWidth={width} fill="none" strokeLinecap="round">
        <line x1={edge.x} y1={edge.y} x2={c(trunkX, cardY).x} y2={edge.y} />
        {maxY > minY && <line x1={trunkTop.x} y1={trunkTop.y} x2={trunkBottom.x} y2={trunkBottom.y} />}
        {rows.map((r) => {
          const a = c(trunkX, r.y);
          const b = c(r.far, r.y);
          return <line key={r.y} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
      </g>
      {/* Nudo donde la línea se une a la tarjeta. */}
      <circle cx={edge.x} cy={edge.y} r={3} fill={ink} />

      {/* Tarjeta de la categoría: barra del color del estado del lado de la figura. */}
      <rect
        x={card.x}
        y={card.y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill={active ? "#eef2ff" : "#ffffff"}
        stroke={active && !needsAttention(z.tone) ? "#1d4ed8" : ink}
        strokeWidth={active ? 2 : 1.25}
      />
      <rect x={left ? card.x + CARD_W - 9 : card.x + 4} y={card.y + 7} width={5} height={CARD_H - 14} rx={2.5} fill={TONE_HEX[z.tone]} />
      <text x={left ? textX - 4 : textX + 4} y={card.y + 20} textAnchor={anchor} className="fill-foreground font-sans text-[14.5px] font-semibold">
        {t(z.short)}
      </text>
      <text x={left ? textX - 4 : textX + 4} y={card.y + 37} textAnchor={anchor} className="font-sans text-[13px] font-semibold" fill={toneTextHex(z.tone)}>
        {zoneStatusText(z)}
      </text>
    </g>
  );
}

/**
 * Zona sobre la figura: marcador preciso en cada punto anatómico (el halo se pinta aparte),
 * anillo de selección y foco de teclado. Comparte el resaltado con su tarjeta.
 */
function ZoneHotspot({
  zone: z,
  selected,
  active,
  onSelect,
  onHover,
}: {
  zone: ZoneState;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
  onHover: (on: boolean) => void;
}) {
  const alert = needsAttention(z.tone);
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${t(z.name)}: ${zoneStatusText(z)}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="group cursor-pointer outline-none"
    >
      {z.spots.map((spot) => {
        const p = toCanvas(spot);
        const ring = Math.max(spot.r, 9);
        return (
          <g key={`${spot.x}-${spot.y}`}>
            <circle cx={p.x} cy={p.y} r={Math.max(spot.r, 14)} fill="transparent" />
            {(selected || active) && (
              <circle cx={p.x} cy={p.y} r={ring} fill="none" stroke={selected ? "#0f172a" : "#475569"} strokeWidth="1.5" strokeDasharray="3 3" />
            )}
            <circle cx={p.x} cy={p.y} r={alert || active ? 5.5 : 4} fill={TONE_HEX[z.tone]} stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r={ring + 3} fill="none" stroke="#1d4ed8" strokeWidth="2" className="opacity-0 group-focus-visible:opacity-100" />
          </g>
        );
      })}
    </g>
  );
}

/** Texto de estado sobre fondo claro: versión oscura del color, para contraste AA. */
function toneTextHex(tone: Tone) {
  return { ok: "#166534", warn: "#92400e", bad: "#991b1b", info: "#1e3a8a", pending: "#4b5563" }[tone];
}

function Legend() {
  const items: Tone[] = ["ok", "info", "warn", "bad"];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((t) => (
        <span key={t} className="flex items-center gap-1.5">
          <StatusDot tone={t} />
          {tr(TONE_LABEL[t])}
        </span>
      ))}
      <span className="basis-full">{tr("Tocá una zona o su tarjeta para ver el detalle. Cada línea une la categoría con todos sus puntos.")}</span>
    </div>
  );
}

/* ───────────────────────── Detalle de la zona ───────────────────────── */

function ZoneDetail({ zone: z, astronautId }: { zone: ZoneState; astronautId: string }) {
  const base = `/astronautas/${astronautId}`;
  // KPIs primero los que necesitan atención: rojos, luego amarillas y por último el resto.
  const sorted = [...z.statuses].sort((a, b) => toneRank(b.tone) - toneRank(a.tone));

  return (
    <section aria-live="polite" aria-label={t("Detalle: {zone}", { zone: t(z.name) })} className="flex flex-col gap-5 rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">{t(z.name)}</h2>
        <StatusPill tone={z.tone} label={zoneStatusText(z)} className="text-sm" />
      </div>

      {z.labs.length > 0 && (
        <Block title={t("Estudios periódicos")} link={{ href: `${base}/resultados`, label: t("Ver estudios completos") }}>
          <ul className={cn("grid gap-2", z.labs.length > 1 ? "sm:grid-cols-2" : "")}>
            {z.labs.map((p) => {
              const out = p.rows.filter((r) => r.tone !== "ok");
              const okCount = p.rows.length - out.length;
              return (
                <li key={p.id} className="flex flex-col gap-1.5 rounded-xl border px-4 py-3">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{t(p.name)}</span>
                    <span className="text-xs text-muted-foreground">{t("Último: {when}", { when: t(p.last) })}</span>
                  </span>
                  {out.map((r) => (
                    <span key={r.label} className="flex flex-wrap items-center gap-x-2 text-sm">
                      <StatusDot tone={r.tone} />
                      <span>{t(r.label)}:</span>
                      <strong className={TONE_CLASSES[r.tone].strong}>{t(r.plain)}</strong>
                      {r.detail && <span className="text-xs text-muted-foreground">{t(r.detail)}</span>}
                    </span>
                  ))}
                  {okCount > 0 && (
                    <span className="flex items-center gap-2 text-sm text-ok-strong">
                      <StatusDot tone="ok" />
                      {out.length === 0 ? t("Todo en rango") : t("{n} más en rango", { n: okCount })}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Block>
      )}

      {z.statuses.length > 0 && (
        <Block title={t("Indicadores diarios")} link={{ href: `${base}/evolucion`, label: t("Ver evolución") }}>
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((s) => (
              <IndicatorCard key={s.id} status={s} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Franja verde: normal · línea ámbar: atención · línea roja: alerta")}
          </p>
        </Block>
      )}

      {z.statuses.length === 0 && z.labs.length === 0 && <p className="text-muted-foreground">{t("Sin indicadores registrados para esta zona.")}</p>}
    </section>
  );
}

function toneRank(t: Tone) {
  return ({ ok: 0, pending: 0, info: 1, warn: 2, bad: 3 } as const)[t];
}

/**
 * Tarjeta KPI de un indicador: valor actual en palabra simple + gráfico de evolución
 * con la franja normal y los niveles de atención/alerta.
 */
function IndicatorCard({ status: s }: { status: ParameterStatus }) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-xl px-4 py-3", needsAttention(s.tone) ? TONE_CLASSES[s.tone].soft : "bg-muted")}>
      <span className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        {s.label}
        <StatusDot tone={s.tone} />
      </span>
      <PlainValue tone={s.tone} plain={s.plain} detail={s.detail ? `${s.detail} · ${t("normal: {range}", { range: s.normalText })}` : t("Normal: {range}", { range: s.normalText })} size="sm" />
      {s.history.length > 0 ? (
        <div className="rounded-lg bg-card">
          <TrendChart status={s} height={92} compact />
        </div>
      ) : (
        <div className="flex h-[92px] items-center justify-center rounded-lg bg-card text-xs text-muted-foreground">
          {t("Sin datos todavía")}
        </div>
      )}
      {s.latest && (
        <span className="text-xs text-muted-foreground">
          {t("Último: {time} · {source}", { time: formatDay(s.latest.at), source: t(SOURCE_LABEL[s.latest.source] ?? s.latest.source) })}
        </span>
      )}
    </div>
  );
}

function Block({ title, link, children }: { title: string; link: { href: string; label: string }; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>{title}</SectionLabel>
        <Link href={link.href} className="text-sm font-semibold text-primary hover:underline">
          {link.label} →
        </Link>
      </div>
      {children}
    </div>
  );
}
