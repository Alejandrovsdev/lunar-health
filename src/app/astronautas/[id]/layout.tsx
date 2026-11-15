"use client";

import { use, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/components/page-header";
import { LiveBadge } from "@/shared/components/status";
import { AstronautFacts, AstronautNav, LOCATION_LABEL, useAstronaut } from "@/modules/monitoring";
import { usePendingTestsCount } from "@/modules/assessments";

/** Composición de la ficha: cabecera + navegación. Une monitoring (información) con assessments (tests). */
export default function AstronautLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  const pending = usePendingTestsCount(id);
  if (!astronaut) notFound();
  const outside = astronaut.location === "exterior";
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/", label: "Tripulación" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {astronaut.name}
            {outside && <LiveBadge label="EN VIVO · traje" />}
          </span>
        }
        right={
          <span className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
            {LOCATION_LABEL[astronaut.location].detail} · {astronaut.role}
          </span>
        }
      />
      <AstronautFacts astronaut={astronaut} />
      <AstronautNav astronautId={id} location={astronaut.location} pendingTests={pending} />
      {children}
    </div>
  );
}
