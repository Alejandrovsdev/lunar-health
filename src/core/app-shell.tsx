"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
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
            Salud · Base lunar Artemis
          </Link>
          <nav aria-label="Principal" className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={n.match(path) ? "page" : undefined}
                className={cn("rounded-lg px-4 py-2 text-sm font-semibold", n.match(path) ? "bg-secondary text-secondary-foreground" : "hover:bg-muted")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">Demo · datos simulados</span>
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
        if (window.confirm("¿Reiniciar la demo? Se borran los registros hechos en este navegador.")) reset();
      }}
    >
      Reiniciar demo
    </Button>
  );
}
