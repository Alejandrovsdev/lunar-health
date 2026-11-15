"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useAstronaut } from "@/modules/monitoring";
import { CheckOutWizard } from "@/modules/airlock";
import { CrewAvatar } from "@/shared/components/avatar";
import { t } from "@/shared/i18n";

export default function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: "/esclusa", label: "Esclusa" }} title={
          <span className="flex flex-wrap items-center gap-3">
            <CrewAvatar name={astronaut.name} photo={astronaut.photo} tone="info" className="size-12 ring-2 ring-offset-1 ring-offset-background" />
            Check-out · {astronaut.name}
          </span>
        } subtitle="Antes de salir de la base" />
      {astronaut.location === "exterior" ? <p>{t("{name} ya está afuera.", { name: astronaut.name })}</p> : <CheckOutWizard astronautId={id} />}
    </div>
  );
}
