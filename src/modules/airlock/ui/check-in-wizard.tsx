"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/core/store";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatNumber } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup, NumberField, YesNo } from "@/shared/ui/form";
import { PlainValue, StatusPill } from "@/shared/components/status";
import { CrewAvatar } from "@/shared/components/avatar";
import { evaPosition, suitSnapshot, type SuitSnapshot } from "@/modules/telemetry";
import type { Astronaut } from "@/modules/monitoring/domain";
import { evaluateCheckIn } from "../domain/rules";
import { evaTeam } from "../domain/team";
import type { AirlockVerdict, CheckInForm } from "../domain/types";
import { VerdictPanel, VitalsFields } from "./parts";
import { Wizard } from "./wizard";

function emptyForm(snap: SuitSnapshot | null): CheckInForm {
  return {
    dcsJoint: null,
    dcsSkin: null,
    dcsTingling: null,
    dcsDizzy: null,
    dcsBreath: null,
    eyes: null,
    cough: null,
    skinIrritation: null,
    handInjury: null,
    waterPercent: snap ? Math.round(100 - snap.consumables[1].percent) : "",
    spo2: "",
    systolic: "",
    diastolic: "",
    restingHr: "",
    temperature: "",
  };
}

/**
 * Check-in del equipo de EVA: la pareja sale junta y entra junta por la esclusa.
 * Cada integrante responde sus propios síntomas y signos; el resultado es individual.
 */
export function CheckInWizard({ astronautId }: { astronautId: string }) {
  const router = useRouter();
  const astronauts = useAppStore((s) => s.astronauts);
  const complete = useAppStore((s) => s.completeCheckIn);
  // El equipo se fija al abrir el formulario: no cambia aunque el store se actualice al confirmar.
  const [team] = useState(() => evaTeam(astronauts, astronautId));
  const [now] = useState(() => Date.now());
  const snaps = Object.fromEntries(
    team.map((a) => [a.id, a.eva ? suitSnapshot(a.eva.startedAt, now, a.eva.plannedHours, a.eva.suitVariant) : null]),
  ) as Record<string, SuitSnapshot | null>;
  const lead = team[0];
  const leadSnap = lead ? snaps[lead.id] : null;
  const pos = leadSnap && lead?.eva ? evaPosition(leadSnap.elapsedS, lead.eva.plannedHours) : null;

  const [forms, setForms] = useState<Record<string, CheckInForm>>(() => Object.fromEntries(team.map((a) => [a.id, emptyForm(snaps[a.id])])));
  const patchFor = (id: string) => (p: Partial<CheckInForm>) => setForms((x) => ({ ...x, [id]: { ...x[id], ...p } }));
  const verdicts: Record<string, AirlockVerdict> = Object.fromEntries(team.map((a) => [a.id, evaluateCheckIn(forms[a.id])]));
  const all = (ok: (f: CheckInForm) => boolean) => team.every((a) => ok(forms[a.id]));

  if (!lead) return null;
  const names = team.map((a) => a.name).join(" y ");

  const steps = [
    {
      id: "summary",
      title: "Resumen de la salida",
      subtitle: `${names} · ${lead.eva?.destination ?? ""}`,
      valid: true,
      content: leadSnap && pos && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <PlainValue tone="ok" plain={formatDuration(leadSnap.elapsedS)} detail="Duración de la salida" size="lg" />
            <PlainValue tone="ok" plain={`${formatNumber(pos.distanceKm, 2)} km`} detail="Distancia máxima a la base" size="lg" />
            <PlainValue tone="ok" plain="Normal" detail="Radiación recibida · sin evento solar" size="lg" />
          </div>
          <MemberBlocks team={team}>
            {(a) => {
              const snap = snaps[a.id];
              return (
                <PlainValue
                  tone={snap?.alert ? snap.alert.tone : "ok"}
                  plain={snap?.alert ? "Hubo alertas" : "Sin alertas"}
                  detail={snap?.alert?.text ?? "Durante la salida"}
                  size="md"
                />
              );
            }}
          </MemberBlocks>
        </>
      ),
    },
    {
      id: "dcs",
      title: "Síntomas de descompresión",
      subtitle: "Aparecen al bajar de presión. Cada uno responde sí o no con sinceridad.",
      valid: all((f) => [f.dcsJoint, f.dcsSkin, f.dcsTingling, f.dcsDizzy, f.dcsBreath].every((v) => v !== null)),
      content: (
        <MemberBlocks team={team} columns>
          {(a) => {
            const f = forms[a.id];
            const patch = patchFor(a.id);
            return (
              <>
                <YesNo name={`${a.id}-joint`} legend="¿Dolor en articulaciones (hombros, codos, rodillas)?" value={f.dcsJoint} onChange={(v) => patch({ dcsJoint: v })} />
                <YesNo name={`${a.id}-skin`} legend="¿Picazón o manchas en la piel?" value={f.dcsSkin} onChange={(v) => patch({ dcsSkin: v })} />
                <YesNo name={`${a.id}-tingling`} legend="¿Hormigueo o debilidad en brazos o piernas?" value={f.dcsTingling} onChange={(v) => patch({ dcsTingling: v })} />
                <YesNo name={`${a.id}-dizzy`} legend="¿Mareo o confusión?" value={f.dcsDizzy} onChange={(v) => patch({ dcsDizzy: v })} />
                <YesNo name={`${a.id}-breath`} legend="¿Falta de aire?" value={f.dcsBreath} onChange={(v) => patch({ dcsBreath: v })} />
              </>
            );
          }}
        </MemberBlocks>
      ),
    },
    {
      id: "dust",
      title: "Polvo lunar",
      subtitle: "El polvo es filoso y se pega al traje: revisen ojos, garganta y piel. Revísense también entre ustedes.",
      valid: all((f) => f.eyes !== null && f.cough !== null && f.skinIrritation !== null),
      content: (
        <MemberBlocks team={team} columns>
          {(a) => {
            const f = forms[a.id];
            const patch = patchFor(a.id);
            return (
              <>
                <ChoiceGroup<0 | 1 | 2>
                  name={`${a.id}-eyes`}
                  legend="¿Ojos irritados?"
                  value={f.eyes}
                  onChange={(v) => patch({ eyes: v })}
                  options={[
                    { value: 0, label: "No" },
                    { value: 1, label: "Un poco" },
                    { value: 2, label: "Mucho" },
                  ]}
                />
                <YesNo name={`${a.id}-cough`} legend="¿Tos o garganta irritada?" value={f.cough} onChange={(v) => patch({ cough: v })} />
                <YesNo name={`${a.id}-skinirr`} legend="¿Piel irritada?" value={f.skinIrritation} onChange={(v) => patch({ skinIrritation: v })} />
              </>
            );
          }}
        </MemberBlocks>
      ),
    },
    {
      id: "vitals",
      title: "Signos vitales ahora",
      subtitle: "Mídanse en la esclusa al entrar, uno por vez.",
      valid: all((f) => [f.spo2, f.systolic, f.diastolic, f.restingHr, f.temperature].every((v) => v !== "")),
      content: (
        <MemberBlocks team={team}>
          {(a) => <VitalsFields idPrefix={`${a.id}-`} form={forms[a.id]} onChange={patchFor(a.id)} />}
        </MemberBlocks>
      ),
    },
    {
      id: "body",
      title: "Manos e hidratación",
      subtitle: "Lo que más se resiente después de una salida larga.",
      valid: all((f) => f.handInjury !== null && f.waterPercent !== ""),
      content: (
        <MemberBlocks team={team} columns>
          {(a) => {
            const f = forms[a.id];
            const patch = patchFor(a.id);
            return (
              <>
                <YesNo name={`${a.id}-hands`} legend="¿Lesiones en manos o uñas por los guantes?" value={f.handInjury} onChange={(v) => patch({ handInjury: v })} />
                <NumberField
                  id={`${a.id}-water`}
                  label="Agua que tomó de la bolsa del traje"
                  unit="%"
                  value={f.waterPercent}
                  onChange={(v) => patch({ waterPercent: v })}
                  hint="El traje lo registra. Menos de 60 % es poco."
                />
              </>
            );
          }}
        </MemberBlocks>
      ),
    },
    {
      id: "result",
      title: "Resultado",
      subtitle: "Resultado de cada integrante. Se programan controles a las 2 h y 24 h, que pasan a su ficha en la base.",
      valid: true,
      content: (
        <MemberBlocks team={team} badge={(a) => <StatusPill tone={verdicts[a.id].tone} label={verdicts[a.id].title} />}>
          {(a) => <VerdictPanel verdict={verdicts[a.id]} />}
        </MemberBlocks>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      finish={
        <Button
          size="lg"
          onClick={() => {
            complete(team.map((a) => ({ astronautId: a.id, form: forms[a.id], verdict: verdicts[a.id] })));
            router.push(team.length > 1 ? "/" : `/astronautas/${lead.id}`);
          }}
        >
          {team.length > 1 ? "Confirmar ingreso del equipo" : "Confirmar ingreso"}
        </Button>
      }
    />
  );
}

/**
 * Un bloque por integrante con su foto y nombre, para que quede claro de quién es cada respuesta.
 * `columns`: lado a lado en pantallas anchas (preguntas cortas); si no, uno debajo del otro.
 */
function MemberBlocks({
  team,
  columns,
  badge,
  children,
}: {
  team: Astronaut[];
  columns?: boolean;
  badge?: (a: Astronaut) => ReactNode;
  children: (a: Astronaut) => ReactNode;
}) {
  return (
    <div className={cn("grid gap-4", columns && team.length > 1 && "xl:grid-cols-2")}>
      {team.map((a) => (
        <section key={a.id} aria-label={a.name} className="flex flex-col gap-4 rounded-2xl border p-4">
          <header className="flex flex-wrap items-center gap-3">
            <CrewAvatar name={a.name} photo={a.photo} tone="info" className="size-12 ring-2 ring-offset-1" />
            <span className="flex flex-col">
              <span className="font-display text-lg font-semibold">{a.name}</span>
              <span className="text-sm text-muted-foreground">{a.role}</span>
            </span>
            {badge && <span className="ml-auto">{badge(a)}</span>}
          </header>
          {children(a)}
        </section>
      ))}
    </div>
  );
}
