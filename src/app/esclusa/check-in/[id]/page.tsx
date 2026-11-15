"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { useAstronaut, useAstronauts } from "@/modules/monitoring";
import { CheckInWizard, evaTeam } from "@/modules/airlock";

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  const team = evaTeam(useAstronauts(), id);
  if (!astronaut) return null;
  const title = team.length > 1 ? t("Check-in del equipo · {names}", { names: team.map((a) => a.name).join(t(" y ")) }) : `Check-in · ${astronaut.name}`;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: "/esclusa", label: "Esclusa" }} title={title} subtitle="Antes de entrar a la base · la pareja de EVA entra junta" />
      {astronaut.location === "interior" ? <p>{t("{name} ya está en la base.", { name: astronaut.name })}</p> : <CheckInWizard astronautId={id} />}
    </div>
  );
}
