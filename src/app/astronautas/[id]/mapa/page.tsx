"use client";

import { use } from "react";
import { formatNumber } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { PlainValue, StatusDot } from "@/shared/components/status";
import { useAstronaut } from "@/modules/monitoring";
import { EvaMap, SAFE_RADIUS_KM, useStops, useSuit } from "@/modules/telemetry";

export default function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  const live = useSuit(astronaut?.eva);
  const stops = useStops(live?.position.progress ?? 0);
  if (!astronaut || !live) return <p className="text-muted-foreground">{t("Este astronauta está en la base: no hay recorrido en curso.")}</p>;
  const { position } = live;
  const margin = SAFE_RADIUS_KM - position.distanceKm;
  const tight = margin < 0.4;
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="flex flex-col gap-3 rounded-2xl border bg-card p-3">
        <EvaMap progress={position.progress} name={astronaut.name} />
        <div className="flex flex-wrap gap-5 px-2 text-xs text-muted-foreground">
          <span>{t("━ azul: recorrido hecho")}</span>
          <span>{t("┅ blanco: ruta planificada")}</span>
          <span>{t("┅ naranja: hasta dónde puede alejarse y volver a tiempo")}</span>
          <span>{t("Pasá el mouse por una parada (o llegá con Tab) para ver su objetivo y una foto")}</span>
          <span>{t("Imagen real del orbitador LRO (NASA); la base, la ruta y las paradas son de la simulación")}</span>
        </div>
      </section>
      <aside className="flex flex-col gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <PlainValue tone="ok" size="xl" plain={`${formatNumber(position.distanceKm, 2)} km`} detail={t("Distancia a la base, en línea recta")} />
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <PlainValue tone="ok" size="lg" plain={`${position.walkBackMin} min`} detail={t("Volver caminando por el camino hecho ({km} km)", { km: formatNumber(position.pathKm, 2) })} />
        </div>
        <div className={tight ? "rounded-2xl bg-warn-soft p-4" : "rounded-2xl bg-ok-soft p-4"}>
          <PlainValue tone={tight ? "warn" : "ok"} size="lg" plain={tight ? t("Cerca del límite") : t("Con margen")} detail={t("{km} km dentro del radio de regreso seguro", { km: formatNumber(Math.max(0, margin), 2) })} />
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
          <span className="font-semibold text-muted-foreground">{t("Paradas · {done} de {total} hechas", { done: stops.filter((s) => s.reached).length, total: stops.length })}</span>
          {stops.map((s) => (
            <div key={s.k} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
              <StatusDot tone={s.reached ? "ok" : "pending"} />
              <span className="flex flex-1 flex-col">
                <span className="font-semibold">{t("Parada {n}", { n: s.k + 1 })}</span>
                <span className="text-xs text-muted-foreground">{t(s.task)}</span>
              </span>
              <span className="text-muted-foreground">{s.reached ? t("Hecha") : `~${s.etaMin} min`}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
