"use client";

import { use } from "react";
import { BodyMap } from "@/modules/monitoring";
import { getLabPanels } from "@/modules/labs";

/** Compone monitoring (indicadores diarios) con labs (estudios periódicos) en el mapa corporal. */
export default function BodyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BodyMap astronautId={id} labPanels={getLabPanels(id)} />;
}
