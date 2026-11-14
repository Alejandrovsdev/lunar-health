"use client";

import { use } from "react";
import { BodyMap } from "@/modules/monitoring";

export default function BodyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BodyMap astronautId={id} />;
}
