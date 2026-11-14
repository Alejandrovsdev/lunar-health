"use client";

import { use } from "react";
import { ExteriorProfile, InteriorProfile, useAstronaut } from "@/modules/monitoring";

export default function AstronautPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const astronaut = useAstronaut(id);
  if (!astronaut) return null;
  return astronaut.location === "exterior" ? <ExteriorProfile astronaut={astronaut} /> : <InteriorProfile astronautId={id} />;
}
