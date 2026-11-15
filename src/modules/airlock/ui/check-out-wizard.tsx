"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/core/store";
import { isSameDay } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { ChoiceGroup, YesNo } from "@/shared/ui/form";
import { PlainValue } from "@/shared/components/status";
import { CrewAvatar } from "@/shared/components/avatar";
import { BalanceTest, PvtTest, scorePvt } from "@/modules/assessments";
import { evaluateCheckOut } from "../domain/rules";
import type { CheckOutForm } from "../domain/types";
import { VerdictPanel, VitalsFields } from "./parts";
import { Wizard } from "./wizard";

const DESTINATIONS = ["Borde del cráter", "Zona en sombra", "Antena de comunicaciones", "Campo de paneles solares"];

/** Check-out: pasos antes de salir de la base. */
export function CheckOutWizard({ astronautId }: { astronautId: string }) {
  const router = useRouter();
  const astronauts = useAppStore((s) => s.astronauts);
  const readings = useAppStore((s) => s.readings);
  const results = useAppStore((s) => s.assessmentResults);
  const complete = useAppStore((s) => s.completeCheckOut);
  const me = astronauts.find((a) => a.id === astronautId)!;

  const latest = useMemo(() => {
    const mine = readings.filter((r) => r.astronautId === astronautId);
    const last = (id: string) => mine.filter((r) => r.parameterId === id).at(-1);
    const pvt = last("pvt");
    const balance = results.filter((r) => r.astronautId === astronautId && r.testId === "balance").at(-1);
    return {
      sleep: last("sleep")?.value,
      pvt: pvt && isSameDay(pvt.at, new Date()) ? pvt : undefined,
      balance: balance && isSameDay(balance.at, new Date()) ? balance : undefined,
    };
  }, [readings, results, astronautId]);

  const pvtFromReading = latest.pvt ? scorePvtFromReading(latest.pvt.value, latest.pvt.value2 ?? 0) : null;

  const [f, setF] = useState<CheckOutForm>({
    partnerId: me.nextEva?.partnerId ?? "",
    destination: me.nextEva?.destination ?? DESTINATIONS[0],
    plannedHours: 6,
    sleptEnough: latest.sleep === undefined ? null : latest.sleep >= 6,
    headache: null,
    jointPain: null,
    nausea: null,
    unusualFatigue: null,
    spo2: "",
    systolic: "",
    diastolic: "",
    restingHr: "",
    temperature: "",
    pvt: pvtFromReading,
    balanceStable: latest.balance ? latest.balance.tone === "ok" : null,
    prebreatheDone: false,
    leakTestOk: null,
    consumablesFull: null,
  });
  const patch = (p: Partial<CheckOutForm>) => setF((x) => ({ ...x, ...p }));
  const [runPvt, setRunPvt] = useState(false);
  const [runBalance, setRunBalance] = useState(false);

  const partners = astronauts.filter((a) => a.id !== astronautId && a.location === "interior");
  const verdict = evaluateCheckOut(f);
  const vitalsOk = [f.spo2, f.systolic, f.diastolic, f.restingHr, f.temperature].every((v) => v !== "");

  const steps = [
    {
      id: "plan",
      title: "Plan de la salida",
      // NASA: las EVA de Artemis se hacen en parejas ("buddy pairs") para responder juntos a contingencias.
      subtitle: "Confirmá con quién salís, a dónde y por cuánto tiempo. Las salidas son siempre en pareja: es la norma de NASA para EVA, para poder asistirse ante una emergencia.",
      valid: f.partnerId !== "" && f.destination !== "",
      content: (
        <>
          <ChoiceGroup
            name="partner"
            legend="Compañero/a de salida"
            value={f.partnerId || null}
            onChange={(v) => patch({ partnerId: v })}
            options={partners.map((p) => ({ value: p.id, label: p.name, sublabel: p.role, media: <CrewAvatar name={p.name} photo={p.photo} tone="info" className="size-12 ring-2 ring-offset-1" /> }))}
          />
          <ChoiceGroup name="dest" legend="Destino" value={f.destination} onChange={(v) => patch({ destination: v })} options={DESTINATIONS.map((d) => ({ value: d, label: d }))} columns={2} />
          <ChoiceGroup
            name="hours"
            legend="Duración planificada"
            value={f.plannedHours}
            onChange={(v) => patch({ plannedHours: v })}
            options={[2, 4, 6].map((h) => ({ value: h, label: `${h} h`, sublabel: "límite del traje: 8 h" }))}
          />
        </>
      ),
    },
    {
      id: "feel",
      title: "Cómo te sentís",
      subtitle: "Respondé sí o no. Cualquier «sí» se revisa antes de salir.",
      valid: [f.sleptEnough, f.headache, f.jointPain, f.nausea, f.unusualFatigue].every((v) => v !== null),
      content: (
        <>
          <YesNo name="slept" legend="¿Dormiste al menos 6 h?" value={f.sleptEnough} onChange={(v) => patch({ sleptEnough: v })} hint={latest.sleep !== undefined ? `Tu sensor registró ${latest.sleep.toLocaleString("es-AR")} h anoche.` : undefined} />
          <YesNo name="headache" legend="¿Tenés dolor de cabeza o mareo?" value={f.headache} onChange={(v) => patch({ headache: v })} />
          <YesNo name="joint" legend="¿Te duelen las articulaciones?" value={f.jointPain} onChange={(v) => patch({ jointPain: v })} />
          <YesNo name="nausea" legend="¿Tenés náuseas o visión borrosa?" value={f.nausea} onChange={(v) => patch({ nausea: v })} />
          <YesNo name="fatigue" legend="¿Sentís un cansancio fuera de lo normal?" value={f.unusualFatigue} onChange={(v) => patch({ unusualFatigue: v })} />
        </>
      ),
    },
    {
      id: "vitals",
      title: "Signos vitales ahora",
      subtitle: "Medilos en la esclusa con los equipos del panel.",
      valid: vitalsOk,
      content: <VitalsFields form={f} onChange={patch} />,
    },
    {
      id: "pvt",
      title: "Test cognitivo",
      subtitle: "Atención y reflejos. Si ya lo hiciste hoy, se usa ese resultado.",
      valid: f.pvt !== null,
      content: runPvt ? (
        <PvtTest
          astronautId={astronautId}
          onDone={(r) => {
            patch({ pvt: { tone: r.tone, plain: r.plain, detail: r.detail } });
            setRunPvt(false);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-6 rounded-xl bg-muted p-5">
          {f.pvt ? <PlainValue tone={f.pvt.tone} plain={f.pvt.plain} detail={f.pvt.detail} size="lg" /> : <span className="text-lg">Todavía no lo hiciste hoy.</span>}
          <Button size="lg" variant={f.pvt ? "outline" : "default"} onClick={() => setRunPvt(true)}>
            {f.pvt ? "Repetir el test" : "Hacer el test ahora"}
          </Button>
        </div>
      ),
    },
    {
      id: "balance",
      title: "Equilibrio",
      subtitle: "30 segundos en un pie, con los ojos cerrados.",
      valid: f.balanceStable !== null,
      content: runBalance ? (
        <BalanceTest
          astronautId={astronautId}
          onDone={(r) => {
            patch({ balanceStable: r.tone === "ok" });
            setRunBalance(false);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-6 rounded-xl bg-muted p-5">
          {f.balanceStable !== null ? (
            <PlainValue tone={f.balanceStable ? "ok" : "warn"} plain={f.balanceStable ? "Estable" : "Inestable"} detail="Resultado de hoy" size="lg" />
          ) : (
            <span className="text-lg">Todavía no lo hiciste hoy.</span>
          )}
          <Button size="lg" variant={f.balanceStable !== null ? "outline" : "default"} onClick={() => setRunBalance(true)}>
            {f.balanceStable !== null ? "Repetir el test" : "Hacer el test ahora"}
          </Button>
        </div>
      ),
    },
    {
      id: "suit",
      title: "Traje y pre-respirado",
      subtitle: "El traje se revisa antes de despresurizar. Hábitat 8,2 psi → traje 4,3 psi.",
      valid: f.prebreatheDone && f.leakTestOk !== null && f.consumablesFull !== null,
      content: (
        <>
          <YesNo name="leak" legend="¿El traje pasó la prueba de fuga? (presión estable 5 min)" value={f.leakTestOk} onChange={(v) => patch({ leakTestOk: v })} />
          <YesNo name="consumables" legend="¿Oxígeno, batería y agua están completos?" value={f.consumablesFull} onChange={(v) => patch({ consumablesFull: v })} />
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg bg-muted p-3 text-base font-semibold">
            <input type="checkbox" className="size-5" checked={f.prebreatheDone} onChange={(e) => patch({ prebreatheDone: e.target.checked })} />
            Terminé el pre-respirado de oxígeno
          </label>
        </>
      ),
    },
    {
      id: "result",
      title: "Resultado",
      subtitle: "Resumen de los pasos anteriores.",
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
            router.push(verdict.allowed ? `/astronautas/${astronautId}` : "/esclusa");
          }}
        >
          {verdict.allowed ? "Confirmar salida" : "Registrar y volver"}
        </Button>
      }
    />
  );
}

function scorePvtFromReading(avg: number, lapses: number) {
  const s = scorePvt(Array(5).fill(avg), 0);
  const tone = lapses >= 3 ? "bad" : lapses >= 2 && s.tone === "ok" ? "warn" : s.tone;
  const plain = tone === "ok" ? "Normal" : tone === "warn" ? "Más lento" : "Muy lento";
  return { tone, plain, detail: `${avg} ms de promedio · ${lapses} lapsos · hoy` } as CheckOutForm["pvt"];
}
