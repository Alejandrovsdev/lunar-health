"use client";

import { use } from "react";
import { EvolutionList } from "@/modules/monitoring";

export default function EvolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EvolutionList astronautId={id} />;
}
