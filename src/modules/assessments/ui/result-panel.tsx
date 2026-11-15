import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES } from "@/shared/domain/status";
import { Button } from "@/shared/ui/button";
import { t, tx } from "@/shared/i18n";
import type { AssessmentResult } from "../domain/types";

/** Pantalla de cierre de cualquier test: resultado en palabras simples y volver a la lista. */
export function ResultPanel({ result, astronautId, extra }: { result: AssessmentResult; astronautId: string; extra?: React.ReactNode }) {
  const c = TONE_CLASSES[result.tone];
  return (
    <div className="flex flex-col gap-5">
      <div className={cn("flex flex-col gap-1 rounded-2xl p-6", c.soft)}>
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("Resultado")}</span>
        <span className={cn("font-display text-4xl font-bold", result.tone === "ok" ? "text-ok-strong" : c.strong)}>{tx(result.plain)}</span>
        <span className="text-base">{tx(result.detail)}</span>
      </div>
      {extra}
      <p className="text-sm text-muted-foreground">{t("El resultado ya actualizó tu ficha.")}</p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href={`/tests/${astronautId}`}>{t("Volver a mis tests")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`/astronautas/${astronautId}`}>{t("Ver mi ficha")}</Link>
        </Button>
      </div>
    </div>
  );
}
