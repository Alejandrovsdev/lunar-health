"use client";

import Link from "next/link";
import { formatNumber } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES } from "@/shared/domain/status";
import { ConsumableRings, EvaTimeline, RadiationCard, SuitChartCard, useSuit } from "@/modules/telemetry";
import type { Astronaut } from "../domain/types";

/** Ficha de un astronauta en EVA: telemetría del traje en tiempo real (signos, radiación y consumibles). */
export function ExteriorProfile({ astronaut }: { astronaut: Astronaut }) {
  const live = useSuit(astronaut.eva);
  if (!live) return null;
  const { snapshot, position } = live;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/astronautas/${astronaut.id}/mapa`}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("A {km} km de la base · Ver mapa →", { km: formatNumber(position.distanceKm, 2) })}
        </Link>
        <span className="rounded-full border bg-card px-4 py-2 text-sm">{t("Destino: {place}", { place: t(astronaut.eva?.destination ?? "") })}</span>
      </div>

      {snapshot.alert && (
        <section role="status" className={cn("flex items-center gap-3 rounded-xl px-4 py-3", TONE_CLASSES[snapshot.alert.tone].soft)}>
          <span className="rounded-full bg-warn px-2.5 py-1 text-xs font-bold text-white">{snapshot.alert.tone === "bad" ? t("ALERTA") : t("ATENCIÓN")}</span>
          <span className={cn("text-base", TONE_CLASSES[snapshot.alert.tone].strong)}>{t(snapshot.alert.text)}</span>
        </section>
      )}

      <section aria-label={t("Presión del traje y signos vitales en tiempo real")} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.channels.map((c) => (
          <SuitChartCard key={c.id} channel={c} />
        ))}
      </section>

      <RadiationCard radiation={snapshot.radiation} priorMissionMSv={astronaut.radiationMSv} />

      <section aria-label={t("Recursos del traje")}>
        <ConsumableRings items={snapshot.consumables} />
      </section>

      <EvaTimeline elapsedS={snapshot.elapsedS} returnAtS={snapshot.returnAtS} limitS={snapshot.limitS} />
    </div>
  );
}
