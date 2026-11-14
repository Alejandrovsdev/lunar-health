"use client";

import Link from "next/link";
import { PageHeader } from "@/shared/components/page-header";
import { CrewBoard, useAstronauts } from "@/modules/monitoring";

export default function CrewPage() {
  const astronauts = useAstronauts();
  const inside = astronauts.filter((a) => a.location === "interior").length;
  const outside = astronauts.filter((a) => a.location === "exterior");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tripulación"
        right={
          <>
            <span className="rounded-full border bg-card px-4 py-2 text-sm">{inside} en la base</span>
            {outside.length > 0 && (
              <Link href={`/astronautas/${outside[0].id}/mapa`} className="rounded-full border border-primary bg-card px-4 py-2 text-sm font-semibold text-primary">
                {outside.length} afuera · ver mapa
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
