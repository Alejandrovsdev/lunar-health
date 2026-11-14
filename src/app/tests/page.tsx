"use client";

import Link from "next/link";
import { PageHeader } from "@/shared/components/page-header";
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
    <Link href={`/tests/${a.id}`} className="flex flex-col gap-1 rounded-2xl border bg-card p-5 hover:border-primary">
      <span className="font-display text-2xl font-semibold">{a.name}</span>
      <span className="text-sm text-muted-foreground">{a.role}</span>
      <span className={pending ? "mt-2 font-semibold text-warn-strong" : "mt-2 font-semibold text-ok-strong"}>
        {pending ? `${pending} pendientes` : "Todo hecho por hoy"}
      </span>
    </Link>
  );
}
