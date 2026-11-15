"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { MISSION_CONTEXT } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { LocaleSwitch } from "@/shared/i18n/provider";
import { StoreHydration } from "./hydration";
import { useAppStore } from "./store";

const NAV = [
  { href: "/", label: "Tripulación", match: (p: string) => p === "/" || p.startsWith("/astronautas") },
  { href: "/esclusa", label: "Esclusa", match: (p: string) => p.startsWith("/esclusa") },
  { href: "/tests", label: "Tests", match: (p: string) => p.startsWith("/tests") },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-6 px-6 py-3">
          <Link href="/" className="font-display text-lg font-bold">
            {t("Salud · Base lunar Artemis")}
          </Link>
          <nav aria-label={t("Principal")} className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={n.match(path) ? "page" : undefined}
                className={cn("rounded-lg px-4 py-2 text-sm font-semibold", n.match(path) ? "bg-secondary text-secondary-foreground" : "hover:bg-muted")}
              >
                {t(n.label)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground xl:inline">{t(MISSION_CONTEXT)}</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{t("Demo · datos simulados")}</span>
            <LocaleSwitch />
            <ResetDemo />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1800px] flex-1 px-6 py-8">
        <StoreHydration>{children}</StoreHydration>
      </main>
    </div>
  );
}

function ResetDemo() {
  const reset = useAppStore((s) => s.resetDemo);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (window.confirm(t("¿Reiniciar la demo? Se borran los registros hechos en este navegador."))) reset();
      }}
    >
      {t("Reiniciar demo")}
    </Button>
  );
}
