import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { TONE_CLASSES } from "@/shared/domain/status";
import { PlainValue, StatusPill } from "@/shared/components/status";
import { HoverTip } from "@/shared/components/hover-tip";
import { CAREER_LIMIT_MSV, RADIATION_WARN_USV_H, type RadiationReading } from "../domain/radiation";

/**
 * Exposición a la radiación durante la EVA: tasa ahora, dosis de la salida y acumulado de la misión.
 * `priorMissionMSv` es lo acumulado antes de esta EVA (viaje, hábitat y salidas anteriores).
 */
export function RadiationCard({ radiation: r, priorMissionMSv: prior }: { radiation: RadiationReading; priorMissionMSv?: number }) {
  // Estado guardado antes de la v6 del store (o recargado en caliente) puede no traer el acumulado todavía.
  const priorMissionMSv = prior ?? 0;
  const missionMSv = priorMissionMSv + r.evaDoseUSv / 1000;
  const careerPct = (missionMSv / CAREER_LIMIT_MSV) * 100;
  const days = r.earthDays;
  return (
    <section aria-label={t("Exposición a la radiación")} className={cn("flex flex-col gap-4 rounded-xl border bg-card p-4", r.tone !== "ok" && cn("border-2", TONE_CLASSES[r.tone].border))}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{t("Radiación · dosímetro del traje")}</span>
        <StatusPill tone={r.tone} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Ahora")}</span>
          <PlainValue tone={r.tone} size="lg" plain={t(r.plain)} detail={`${formatNumber(r.rateUSvH)} µSv/h · ${t(r.context)}`} />
          <span className="text-xs text-muted-foreground">{t("Atención desde {v} µSv/h (posible evento solar)", { v: RADIATION_WARN_USV_H })}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("En esta EVA")}</span>
          <PlainValue tone="ok" size="lg" plain={`${formatNumber(r.evaDoseUSv)} µSv`} detail={t("Igual a {n} días de radiación natural en la Tierra", { n: formatNumber(days, days < 10 ? 1 : 0) })} />
        </div>
        <div tabIndex={0} className="group relative flex cursor-help flex-col gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Acumulada en la misión")}</span>
          <span className="font-display text-3xl font-bold leading-tight">{formatNumber(missionMSv, 1)} mSv</span>
          <div className="h-3 w-full overflow-hidden rounded-full bg-border" role="img" aria-label={t("{pct} % del límite de carrera", { pct: formatNumber(careerPct, 1) })}>
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min(100, Math.max(1, careerPct))}%` }} />
          </div>
          <span className="text-sm text-muted-foreground">
            {t("{pct} % del límite de carrera de la NASA ({limit} mSv)", { pct: formatNumber(careerPct, 1), limit: CAREER_LIMIT_MSV })}
          </span>
          <HoverTip className="bottom-full left-0 mb-2 w-72">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Dosis acumulada")}</span>
            <span>
              {t("Antes de esta salida:")} <b>{formatNumber(priorMissionMSv, 1)} mSv</b> {t("(viaje, hábitat y EVA anteriores).")}
            </span>
            <span>
              {t("Esta EVA suma:")} <b>{formatNumber(r.evaDoseUSv / 1000, 2)} mSv</b>.
            </span>
            <span className="border-t pt-1 text-xs text-muted-foreground">
              {t("El límite de carrera (NASA-STD-3001) se fijó para mantener bajo (cerca del 3 %) el riesgo de muerte por cáncer causado por la radiación.")}
            </span>
          </HoverTip>
        </div>
      </div>
      <p className={cn("rounded-lg px-3 py-2 text-sm", r.tone === "ok" ? "bg-muted" : cn(TONE_CLASSES[r.tone].soft, TONE_CLASSES[r.tone].strong))}>{t(r.action)}</p>
    </section>
  );
}
