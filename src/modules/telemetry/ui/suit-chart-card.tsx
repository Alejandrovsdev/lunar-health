"use client";

import { Line, LineChart, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { TONE_CLASSES, TONE_HEX } from "@/shared/domain/status";
import { PlainValue, StatusDot, StatusPill } from "@/shared/components/status";
import type { SuitChannel } from "../domain/suit";

type Point = SuitChannel["history"][number];

/** Índice de la muestra actual (60 muestras, una cada 10 s). */
const NOW_T = 59;
/** Espacio a la derecha de "ahora": la línea vertical queda antes del final y se ve que la curva avanza hacia ella. */
const X_DOMAIN: [number, number] = [0, NOW_T + 5];

function agoLabel(t: number) {
  const s = (NOW_T - t) * 10;
  if (s === 0) return "Ahora";
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `Hace ${m > 0 ? `${m} min ` : ""}${rest > 0 ? `${rest} s` : ""}`.trim();
}

export function SuitChartCard({ channel }: { channel: SuitChannel }) {
  const { range, warn } = channel;
  const zone = warn.direction === "above" ? { y1: warn.value, y2: range.max } : { y1: range.min, y2: warn.value };
  const stroke = channel.tone === "ok" ? "#1d4ed8" : TONE_HEX[channel.tone];
  const now = channel.history.at(-1);
  return (
    <div className={cn("flex flex-col gap-2 rounded-xl border bg-card p-4", channel.primary && "border-2 border-primary")}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{channel.label}</span>
        <StatusPill tone={channel.tone} />
      </div>
      <PlainValue
        tone={channel.tone}
        size="lg"
        plain={channel.plain}
        detail={`${formatNumber(channel.value, channel.decimals)} ${channel.unit}`}
      />
      <div className="h-32 rounded-lg bg-muted" role="img" aria-label={`${channel.label}: ${channel.plain} en los últimos 10 minutos`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={channel.history} margin={{ top: 18, right: 8, bottom: 6, left: 8 }}>
            <XAxis hide type="number" dataKey="t" domain={X_DOMAIN} />
            <YAxis hide domain={[range.min, range.max]} />
            <ReferenceArea y1={zone.y1} y2={zone.y2} fill="#fef3c7" fillOpacity={0.9} ifOverflow="hidden" />
            <ReferenceLine y={warn.value} stroke="#d97706" strokeDasharray="4 4" />
            {/* Línea vertical de "ahora": marca dónde llega la medición en vivo. */}
            <ReferenceLine
              x={NOW_T}
              stroke="#334155"
              strokeWidth={1.5}
              label={{ value: "ahora", position: "top", fontSize: 11, fontWeight: 600, fill: "#334155" }}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: stroke, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {now && <ReferenceDot x={NOW_T} y={now.v} ifOverflow="visible" shape={(p: { cx?: number; cy?: number }) => <NowDot cx={p.cx} cy={p.cy} color={stroke} />} />}
            <Tooltip
              cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
              allowEscapeViewBox={{ x: false, y: true }}
              wrapperStyle={{ zIndex: 20, outline: "none" }}
              content={(props) => <SuitTooltip {...(props as unknown as TooltipProps)} channel={channel} />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span title="Pasá el mouse por el gráfico para ver cada valor">Últimos 10 min → ahora</span>
        <span>Atención: {warn.text}</span>
      </div>
    </div>
  );
}

/** Punto en el valor actual, con un halo que late (se detiene con "reducir movimiento"). */
function NowDot({ cx, cy, color }: { cx?: number; cy?: number; color: string }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={color}
        opacity={0.3}
        className="motion-safe:animate-ping"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
}

/** Explica el punto bajo el mouse: cuándo fue, cuánto valía, qué significa y qué son las líneas del gráfico. */
function SuitTooltip({ active, payload, channel }: TooltipProps & { channel: SuitChannel }) {
  const p = active ? payload?.[0]?.payload : undefined;
  if (!p) return null;
  const isNow = p.t === NOW_T;
  return (
    <div className="flex w-60 flex-col gap-1.5 rounded-lg border bg-card p-3 text-sm shadow-lg">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{agoLabel(p.t)}</span>
      <span className="flex items-center gap-2">
        <StatusDot tone={p.tone} />
        <span className={cn("font-display text-lg font-bold", p.tone === "ok" ? "text-foreground" : TONE_CLASSES[p.tone].strong)}>{p.plain}</span>
        <span className="text-muted-foreground">
          {formatNumber(p.v, channel.decimals)} {channel.unit}
        </span>
      </span>
      <span className="border-t pt-1.5 text-xs text-muted-foreground">
        {isNow ? (
          <>
            <b className="text-foreground">Línea vertical:</b> la medición en vivo. La curva avanza hacia ella cada segundo.
          </>
        ) : (
          <>
            <b className="text-foreground">Línea vertical:</b> ahora. Este punto es de antes.
          </>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        <b className="text-warn-strong">Línea punteada:</b> límite de atención ({channel.warn.text}). La zona amarilla es fuera de rango.
      </span>
    </div>
  );
}
