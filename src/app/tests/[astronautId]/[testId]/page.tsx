"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { CrewAvatar } from "@/shared/components/avatar";
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
        back={{ href: `/tests/${astronautId}`, label: "Tests" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <CrewAvatar name={astronaut.name} photo={astronaut.photo} tone="info" className="size-12 ring-2 ring-offset-1 ring-offset-background" />
            {t(test.title)} · {astronaut.name}
          </span>
        }
        subtitle={`${test.minutes} min · ${t(test.frequencyLabel)} · ${t("Referencia: {ref}", { ref: t(test.nasaReference) })}`}
      />
      <TestRunner astronautId={astronautId} testId={test.id} />
    </div>
  );
}
