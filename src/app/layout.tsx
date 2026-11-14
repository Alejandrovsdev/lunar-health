import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import { AppShell } from "@/core/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitoreo de salud · Base lunar Artemis",
  description: "Demo para NASA Space Apps 2026: monitoreo de salud de la tripulación en una base lunar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
