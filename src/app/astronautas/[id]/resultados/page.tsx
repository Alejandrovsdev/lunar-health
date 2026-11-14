"use client";

import { use } from "react";
import { LabResults } from "@/modules/labs";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <LabResults astronautId={id} />;
}
