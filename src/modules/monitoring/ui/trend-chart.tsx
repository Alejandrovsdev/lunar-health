"use client";

import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TONE_HEX } from "@/shared/domain/status";
import { formatDay } from "@/shared/lib/format";
import { PARAMETERS } from "../domain/parameters";
import type { ParameterStatus } from "../domain/types";

/** Evolución de un parámetro con la franja verde del rango normal. */
export function TrendChart({ status, height = 200, compact = false }: { status: ParameterStatus; height?: number; compact?: boolean }) {
  const def = PARAMETERS[status.id];
  const data = status.history.map((r) => ({ day: formatDay(r.at), v: r.value }));
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
          {!compact && <Tooltip formatter={(v) => [`${v} ${def.unit}`, status.label]} />}
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill={`url(#${gid})`} dot={compact ? false : { r: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
