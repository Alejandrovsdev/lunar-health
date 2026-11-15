import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import { AppShell } from "@/core/app-shell";
import { LocaleProvider } from "@/shared/i18n/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitoreo de salud · Base lunar Artemis / Crew health · Artemis lunar base",
  description: "Demo para NASA Space Apps 2026: monitoreo de salud de la tripulación en una base lunar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
