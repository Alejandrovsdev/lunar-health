import Link from "next/link";
import type { ReactNode } from "react";

export const MISSION_CONTEXT = "Base lunar Artemis · Gravedad 0,16 g · Tierra a 1,3 s";

export function PageHeader({
  back,
  title,
  subtitle,
  right,
}: {
  back?: { href: string; label: string };
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        {back && (
          <Link href={back.href} className="text-sm font-semibold text-primary hover:underline">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </header>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2>;
}
