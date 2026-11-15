"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/i18n";
import type { Location } from "../domain/types";

/**
 * Pestañas de la ficha, debajo de la cabecera (dónde estoy / a dónde puedo ir).
 * Orden progresivo: resumen → detalle por sistema → historial.
 * En EVA solo hay dos vistas: el traje en vivo y el mapa.
 */
export function AstronautNav({ astronautId, location, pendingTests }: { astronautId: string; location: Location; pendingTests: number }) {
  const path = usePathname();
  const base = `/astronautas/${astronautId}`;
  const links =
    location === "exterior"
      ? [
          { href: base, label: "Traje en vivo" },
          { href: `${base}/mapa`, label: "Mapa" },
        ]
      : [
          { href: base, label: "Resumen" },
          { href: `${base}/cuerpo`, label: "Cuerpo" },
          { href: `${base}/signos`, label: "Signos vitales" },
          { href: `${base}/alimentacion`, label: "Alimentación" },
          { href: `${base}/resultados`, label: "Estudios" },
          { href: `${base}/evolucion`, label: "Evolución" },
        ];
  return (
    <nav aria-label={t("Secciones de la ficha")} className="flex flex-wrap items-center gap-3 border-b">
      <div className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 shrink-0 items-center border-b-[3px] px-4 text-sm font-semibold transition-colors",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-input hover:text-foreground",
              )}
            >
              {t(l.label)}
            </Link>
          );
        })}
      </div>
      {location === "interior" && (
        <Link
          href={`/tests/${astronautId}`}
          className="mb-2 flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("Tests de hoy")}
          {pendingTests > 0 && <span className="rounded-full bg-card px-2 py-0.5 text-xs text-primary">{t("{n} pendientes", { n: pendingTests })}</span>}
        </Link>
      )}
    </nav>
  );
}
