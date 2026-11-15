"use client";

import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES, TONE_HEX } from "@/shared/domain/status";
import { StatusDot } from "@/shared/components/status";
import { formatDay, formatTime } from "@/shared/lib/format";
import { PARAMETERS, type ParameterDefinition } from "../domain/parameters";
import type { ParameterStatus, Reading } from "../domain/types";

type Point = { day: string; v: number; r: Reading };

/** Evolución de un parámetro con la franja verde del rango normal. */
export function TrendChart({ status, height = 200, compact = false }: { status: ParameterStatus; height?: number; compact?: boolean }) {
  const def = PARAMETERS[status.id];
  const data: Point[] = status.history.map((r) => ({ day: formatDay(r.at), v: r.value, r }));
  const color = status.tone === "ok" ? "#1d4ed8" : TONE_HEX[status.tone];
  const gid = `g-${status.id}-${compact ? "c" : "f"}`;
  return (
    <div style={{ height }} role="img" aria-label={`${status.label}: ${status.plain}. Evolución de los últimos días.`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: compact ? 8 : 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />}
          <XAxis dataKey="day" hide={compact} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis hide={compact} domain={[def.chart.min, def.chart.max]} tick={{ fontSize: 11 }} width={36} />
          <ReferenceArea y1={def.chart.bandLow} y2={def.chart.bandHigh} fill="#16a34a" fillOpacity={0.1} ifOverflow="hidden" />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
            allowEscapeViewBox={{ x: false, y: true }}
            wrapperStyle={{ zIndex: 20, outline: "none" }}
            isAnimationActive={false}
            content={(props) => <TrendTooltip {...(props as unknown as TooltipProps)} def={def} />}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gid})`}
            dot={compact ? false : { r: 2 }}
            activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
}

/** Muestra la medición bajo el mouse: cuándo, cuánto, qué significa y el rango normal. */
function TrendTooltip({ active, payload, def }: TooltipProps & { def: ParameterDefinition }) {
  const p = active ? payload?.[0]?.payload : undefined;
  if (!p) return null;
  const ev = def.evaluate(p.r);
  return (
    <div className="flex w-52 flex-col gap-1 rounded-lg border bg-card p-3 text-sm shadow-lg">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {p.day} · {formatTime(p.r.at)}
      </span>
      <span className="flex items-center gap-2">
        <StatusDot tone={ev.tone} />
        <span className={cn("font-display text-base font-bold", ev.tone === "ok" ? "text-foreground" : TONE_CLASSES[ev.tone].strong)}>{ev.plain}</span>
        <span className="text-muted-foreground">{def.format(p.r)}</span>
      </span>
      <span className="border-t pt-1 text-xs text-muted-foreground">
        <b className="text-ok-strong">Franja verde:</b> normal ({def.normalText})
      </span>
    </div>
  );
}
