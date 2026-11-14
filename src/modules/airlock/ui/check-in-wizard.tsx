"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/core/store";
import { formatDuration, formatNumber } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup, NumberField, YesNo } from "@/shared/ui/form";
import { PlainValue } from "@/shared/components/status";
import { evaPosition, suitSnapshot } from "@/modules/telemetry";
import { evaluateCheckIn } from "../domain/rules";
import type { CheckInForm } from "../domain/types";
import { VerdictPanel, VitalsFields } from "./parts";
import { Wizard } from "./wizard";

/** Check-in: pasos antes de entrar a la base. */
export function CheckInWizard({ astronautId }: { astronautId: string }) {
  const router = useRouter();
  const me = useAppStore((s) => s.astronauts.find((a) => a.id === astronautId))!;
  const complete = useAppStore((s) => s.completeCheckIn);
  const [now] = useState(() => Date.now());
  const snap = me.eva ? suitSnapshot(me.eva.startedAt, now, me.eva.plannedHours) : null;
  const pos = snap && me.eva ? evaPosition(snap.elapsedS, me.eva.plannedHours) : null;

  const [f, setF] = useState<CheckInForm>({
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
  });
  const patch = (p: Partial<CheckInForm>) => setF((x) => ({ ...x, ...p }));
  const verdict = evaluateCheckIn(f);

  const steps = [
    {
      id: "summary",
      title: "Resumen de la salida",
      subtitle: `${me.name} · ${me.eva?.destination ?? ""}`,
      valid: true,
      content: snap && pos && (
        <div className="grid gap-3 md:grid-cols-2">
          <PlainValue tone="ok" plain={formatDuration(snap.elapsedS)} detail="Duración de la salida" size="lg" />
          <PlainValue tone="ok" plain={`${formatNumber(pos.distanceKm, 2)} km`} detail="Distancia máxima a la base" size="lg" />
          <PlainValue tone="ok" plain="Normal" detail="Radiación recibida · sin evento solar" size="lg" />
          <PlainValue tone={snap.alert ? snap.alert.tone : "ok"} plain={snap.alert ? "Hubo alertas" : "Sin alertas"} detail={snap.alert?.text ?? "Durante la salida"} size="lg" />
        </div>
      ),
    },
    {
      id: "dcs",
      title: "Síntomas de descompresión",
      subtitle: "Aparecen al bajar de presión. Respondé sí o no con sinceridad.",
      valid: [f.dcsJoint, f.dcsSkin, f.dcsTingling, f.dcsDizzy, f.dcsBreath].every((v) => v !== null),
      content: (
        <>
          <YesNo name="joint" legend="¿Dolor en articulaciones (hombros, codos, rodillas)?" value={f.dcsJoint} onChange={(v) => patch({ dcsJoint: v })} />
          <YesNo name="skin" legend="¿Picazón o manchas en la piel?" value={f.dcsSkin} onChange={(v) => patch({ dcsSkin: v })} />
          <YesNo name="tingling" legend="¿Hormigueo o debilidad en brazos o piernas?" value={f.dcsTingling} onChange={(v) => patch({ dcsTingling: v })} />
          <YesNo name="dizzy" legend="¿Mareo o confusión?" value={f.dcsDizzy} onChange={(v) => patch({ dcsDizzy: v })} />
          <YesNo name="breath" legend="¿Falta de aire?" value={f.dcsBreath} onChange={(v) => patch({ dcsBreath: v })} />
        </>
      ),
    },
    {
      id: "dust",
      title: "Polvo lunar",
      subtitle: "El polvo es filoso y se pega al traje: revisá ojos, garganta y piel.",
      valid: f.eyes !== null && f.cough !== null && f.skinIrritation !== null,
      content: (
        <>
          <ChoiceGroup<0 | 1 | 2>
            name="eyes"
            legend="¿Tenés los ojos irritados?"
            value={f.eyes}
            onChange={(v) => patch({ eyes: v })}
            options={[
              { value: 0, label: "No" },
              { value: 1, label: "Un poco" },
              { value: 2, label: "Mucho" },
            ]}
          />
          <YesNo name="cough" legend="¿Tos o garganta irritada?" value={f.cough} onChange={(v) => patch({ cough: v })} />
          <YesNo name="skinirr" legend="¿Piel irritada?" value={f.skinIrritation} onChange={(v) => patch({ skinIrritation: v })} />
        </>
      ),
    },
    {
      id: "vitals",
      title: "Signos vitales ahora",
      subtitle: "Medilos en la esclusa al entrar.",
      valid: [f.spo2, f.systolic, f.diastolic, f.restingHr, f.temperature].every((v) => v !== ""),
      content: <VitalsFields form={f} onChange={patch} />,
    },
    {
      id: "body",
      title: "Manos e hidratación",
      subtitle: "Lo que más se resiente después de una salida larga.",
      valid: f.handInjury !== null && f.waterPercent !== "",
      content: (
        <>
          <YesNo name="hands" legend="¿Tenés lesiones en manos o uñas por los guantes?" value={f.handInjury} onChange={(v) => patch({ handInjury: v })} />
          <NumberField id="water" label="Agua que tomaste de la bolsa del traje" unit="%" value={f.waterPercent} onChange={(v) => patch({ waterPercent: v })} hint="El traje lo registra. Menos de 60 % es poco." />
        </>
      ),
    },
    {
      id: "result",
      title: "Resultado",
      subtitle: "Se programan controles a las 2 h y 24 h, que pasan a tu ficha en la base.",
      valid: true,
      content: <VerdictPanel verdict={verdict} />,
    },
  ];

  return (
    <Wizard
      steps={steps}
      finish={
        <Button
          size="lg"
          onClick={() => {
            complete(astronautId, f, verdict);
            router.push(`/astronautas/${astronautId}`);
          }}
        >
          Confirmar ingreso
        </Button>
      }
    />
  );
}
