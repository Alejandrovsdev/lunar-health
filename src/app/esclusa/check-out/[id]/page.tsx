"use client";

import { use } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useAstronaut } from "@/modules/monitoring";
import { CheckOutWizard } from "@/modules/airlock";

export default function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: "/esclusa", label: "Esclusa" }} title={`Check-out · ${astronaut.name}`} subtitle="Antes de salir de la base" />
      {astronaut.location === "exterior" ? <p>{astronaut.name} ya está afuera.</p> : <CheckOutWizard astronautId={id} />}
    </div>
  );
}
