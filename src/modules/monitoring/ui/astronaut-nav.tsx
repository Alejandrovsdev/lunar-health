"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { SectionLabel } from "@/shared/components/page-header";

/** Barra de la ficha: información a la izquierda, tests a la derecha. */
export function AstronautNav({ astronautId, pendingTests }: { astronautId: string; pendingTests: number }) {
  const path = usePathname();
  const base = `/astronautas/${astronautId}`;
  const links = [
    { href: base, label: "Mi estado" },
    { href: `${base}/cuerpo`, label: "Mi cuerpo" },
    { href: `${base}/signos`, label: "Signos vitales" },
    { href: `${base}/resultados`, label: "Resultados" },
    { href: `${base}/evolucion`, label: "Mi evolución" },
  ];
  return (
    <nav aria-label="Secciones del astronauta" className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SectionLabel>Información</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-semibold",
                path === l.href ? "border-primary bg-accent text-primary" : "bg-card text-primary hover:bg-accent",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1.5 sm:w-64">
        <SectionLabel>Tests</SectionLabel>
        <Link
          href={`/tests/${astronautId}`}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Tests de hoy
          {pendingTests > 0 && <span className="rounded-full bg-card px-2 py-0.5 text-xs text-primary">{pendingTests} pendientes</span>}
        </Link>
      </div>
    </nav>
  );
}
