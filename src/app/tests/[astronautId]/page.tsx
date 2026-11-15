"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useAstronaut } from "@/modules/monitoring";
import { TestsHub } from "@/modules/assessments";

export default function AstronautTestsPage({ params }: { params: Promise<{ astronautId: string }> }) {
  const { astronautId } = use(params);
  const astronaut = useAstronaut(astronautId);
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: `/astronautas/${astronautId}`, label: `Ficha de ${astronaut.name}` }} title={`Tests de hoy · ${astronaut.name}`} />
      <TestsHub astronautId={astronautId} />
    </div>
  );
}
