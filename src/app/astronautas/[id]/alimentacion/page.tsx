"use client";

import { use } from "react";
import { NutritionLog } from "@/modules/nutrition";

export default function NutritionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <NutritionLog astronautId={id} />;
}
