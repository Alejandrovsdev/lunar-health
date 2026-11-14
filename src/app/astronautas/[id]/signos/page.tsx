"use client";

import { use } from "react";
import { VitalsGrid } from "@/modules/monitoring";

export default function VitalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VitalsGrid astronautId={id} />;
}
