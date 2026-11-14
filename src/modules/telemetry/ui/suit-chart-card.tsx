"use client";

import { Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { TONE_HEX } from "@/shared/domain/status";
import { PlainValue, StatusPill } from "@/shared/components/status";
import type { SuitChannel } from "../domain/suit";

export function SuitChartCard({ channel }: { channel: SuitChannel }) {
  const { range, warn } = channel;
  const zone = warn.direction === "above" ? { y1: warn.value, y2: range.max } : { y1: range.min, y2: warn.value };
  const stroke = channel.tone === "ok" ? "#1d4ed8" : TONE_HEX[channel.tone];
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
      <div className="h-28 rounded-lg bg-muted" role="img" aria-label={`${channel.label}: ${channel.plain} en los últimos 10 minutos`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={channel.history} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
            <YAxis hide domain={[range.min, range.max]} />
            <ReferenceArea y1={zone.y1} y2={zone.y2} fill="#fef3c7" fillOpacity={0.9} ifOverflow="hidden" />
            <ReferenceLine y={warn.value} stroke="#d97706" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Últimos 10 min</span>
        <span>Atención: {warn.text}</span>
      </div>
    </div>
  );
}
