"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { CrewAvatar } from "@/shared/components/avatar";
import { useAstronaut } from "@/modules/monitoring";
import { TestsHub } from "@/modules/assessments";

export default function AstronautTestsPage({ params }: { params: Promise<{ astronautId: string }> }) {
  const { astronautId } = use(params);
  const astronaut = useAstronaut(astronautId);
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: `/astronautas/${astronautId}`, label: t("Ficha de {name}", { name: astronaut.name }) }} title={
          <span className="flex flex-wrap items-center gap-3">
            <CrewAvatar name={astronaut.name} photo={astronaut.photo} tone="info" className="size-12 ring-2 ring-offset-1 ring-offset-background" />
            Tests · {astronaut.name}
          </span>
        } />
      <TestsHub astronautId={astronautId} />
    </div>
  );
}
