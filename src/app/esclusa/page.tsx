"use client";

import { PageHeader } from "@/shared/components/page-header";
import { t } from "@/shared/i18n";
import { AirlockHome } from "@/modules/airlock";

export default function AirlockPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        back={{ href: "/", label: "Tripulación" }}
        title="Esclusa · Check-out y check-in"
        right={
          <>
            <span className="rounded-full bg-ok-soft px-4 py-2 text-sm font-semibold text-ok-strong">{t("Esclusa lista")}</span>
            <span className="rounded-full border bg-card px-4 py-2 text-sm">{t("Hábitat 8,2 psi · O₂ 34 %")}</span>
            <span className="rounded-full border bg-card px-4 py-2 text-sm">{t("Sin alerta solar")}</span>
          </>
        }
      />
      <AirlockHome />
    </div>
  );
}
