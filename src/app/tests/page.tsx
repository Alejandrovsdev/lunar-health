"use client";

import Link from "next/link";
import { PageHeader } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { CrewAvatar } from "@/shared/components/avatar";
import { useAstronauts } from "@/modules/monitoring";
import { usePendingTestsCount } from "@/modules/assessments";
import type { Astronaut } from "@/modules/monitoring/domain";

export default function TestsIndexPage() {
  const astronauts = useAstronauts().filter((a) => a.location === "interior");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Tests" subtitle="Elegí quién va a hacer sus tests" />
      <div className="grid gap-4 md:grid-cols-3">
        {astronauts.map((a) => (
          <Who key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

function Who({ a }: { a: Astronaut }) {
  const pending = usePendingTestsCount(a.id);
  return (
    <Link href={`/tests/${a.id}`} className="flex items-center gap-4 rounded-2xl border bg-card p-5 hover:border-primary">
      <CrewAvatar name={a.name} photo={a.photo} tone="info" className="size-16 ring-2 ring-offset-1" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-2xl font-semibold">{a.name}</span>
        <span className="text-sm text-muted-foreground">{t(a.role)}</span>
        <span className={pending ? "mt-1 font-semibold text-warn-strong" : "mt-1 font-semibold text-ok-strong"}>
          {pending ? t("{n} pendientes", { n: pending }) : t("Todo hecho por hoy")}
        </span>
      </span>
    </Link>
  );
}
