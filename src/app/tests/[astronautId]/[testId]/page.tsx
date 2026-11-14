"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/components/page-header";
import { useAstronaut } from "@/modules/monitoring";
import { TestRunner, getTest } from "@/modules/assessments";

export default function TestPage({ params }: { params: Promise<{ astronautId: string; testId: string }> }) {
  const { astronautId, testId } = use(params);
  const astronaut = useAstronaut(astronautId);
  const test = getTest(testId);
  if (!test) notFound();
  if (!astronaut) return null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: `/tests/${astronautId}`, label: "Tests de hoy" }}
        title={`${test.title} · ${astronaut.name}`}
        subtitle={`${test.minutes} min · ${test.frequencyLabel} · Referencia: ${test.nasaReference}`}
      />
      <TestRunner astronautId={astronautId} testId={test.id} />
    </div>
  );
}
