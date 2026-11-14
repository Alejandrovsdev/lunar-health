"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useAstronaut } from "@/modules/monitoring";
import { CheckInWizard } from "@/modules/airlock";

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: "/esclusa", label: "Esclusa" }} title={`Check-in · ${astronaut.name}`} subtitle="Antes de entrar a la base" />
      {astronaut.location === "interior" ? <p>{astronaut.name} ya está en la base.</p> : <CheckInWizard astronautId={id} />}
    </div>
  );
}
