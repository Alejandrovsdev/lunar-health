"use client";

import Link from "next/link";
import { PageHeader } from "@/shared/components/page-header";
import { CrewBoard, LOCATION_LABEL, useAstronauts } from "@/modules/monitoring";

export default function CrewPage() {
  const astronauts = useAstronauts();
  const outside = astronauts.filter((a) => a.location === "exterior");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tripulación"
        subtitle="Estado de salud de cada astronauta. Lo más urgente aparece primero."
        right={
          <>
            {outside.length > 0 && (
              <Link href={`/astronautas/${outside[0].id}/mapa`} className="rounded-full border border-primary bg-card px-4 py-2 text-sm font-semibold text-primary">
                {LOCATION_LABEL.exterior.count(outside.length)} · ver mapa
              </Link>
            )}
            <Link href="/esclusa" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Esclusa: check-out / check-in →
            </Link>
          </>
        }
      />
      <CrewBoard />
    </div>
  );
}
