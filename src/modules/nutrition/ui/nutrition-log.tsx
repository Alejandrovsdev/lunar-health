"use client";

import { useMemo, useRef, useState } from "react";
import { Droplet, Minus, Plus, Trash2, Undo2 } from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn } from "@/shared/lib/cn";
import { formatNumber, formatTime } from "@/shared/lib/format";
import { t } from "@/shared/i18n";
import { useNow } from "@/shared/lib/use-now";
import { TONE_CLASSES, worstTone, type Tone } from "@/shared/domain/status";
import { dayKey, intakeDayProgress } from "@/shared/domain/intake-day";
import { PlainValue, StatusDot, StatusPill } from "@/shared/components/status";
import { SectionLabel } from "@/shared/components/page-header";
import { ChoiceGroup } from "@/shared/ui/form";
import { PARAMETERS, TrendChart, useAstronaut, useHealthSummary } from "@/modules/monitoring";
import { FOOD_BY_ID, FOOD_CATEGORIES, FOODS } from "../domain/foods";
import { MEALS, MEAL_LABEL, NUTRIENTS, dailyTargets, dayTotals, evaluateNutrient, mealForHour } from "../domain/targets";
import type { Food, FoodCategory, IntakeEntry, Meal } from "../domain/types";

const SERVINGS = [
  { value: 0.5, label: "½" },
  { value: 1, label: "1" },
  { value: 1.5, label: "1½" },
  { value: 2, label: "2" },
];

/** Paso del ajuste de porciones en el registro. */
const STEP = 0.5;

const fmtServings = (n: number) => formatNumber(n, Number.isInteger(n) ? 0 : 1);

/** Una bebida se elige por los mL, no por las calorías. */
const isDrink = (f: Food) => f.waterMl > 0 && f.nutrients.energy < 50;

/** Aviso de la última acción sobre el registro; las dos se pueden deshacer. */
type Notice = { kind: "added"; entryId: string; text: string } | { kind: "removed"; entry: IntakeEntry; text: string };

/**
 * Alimentación e hidratación.
 * Un solo lugar para cargar (el menú, con las bebidas como una categoría más) y un solo lugar para corregir
 * (el registro del día, al lado del menú). Hidratación y aportes son indicadores: muestran, no cargan.
 * Lo registrado alimenta los parámetros "Hidratación" y "Alimentación".
 */
export function NutritionLog({ astronautId }: { astronautId: string }) {
  const astronaut = useAstronaut(astronautId);
  const intakeLog = useAppStore((s) => s.intakeLog);
  const logIntake = useAppStore((s) => s.logIntake);
  const removeIntake = useAppStore((s) => s.removeIntake);
  const updateServings = useAppStore((s) => s.updateIntakeServings);
  const now = useNow(60_000);
  const today = dayKey(new Date(now));
  const progress = intakeDayProgress(new Date(now));

  const entries = useMemo(
    () => intakeLog.filter((e) => e.astronautId === astronautId && dayKey(e.at) === today).sort((a, b) => a.at.localeCompare(b.at)),
    [intakeLog, astronautId, today],
  );
  const totals = useMemo(() => dayTotals(entries), [entries]);
  const [meal, setMeal] = useState<Meal>(() => mealForHour(new Date().getHours()));
  const [servings, setServings] = useState(1);
  const [category, setCategory] = useState<FoodCategory>(() => (mealForHour(new Date().getHours()) === "desayuno" ? "Desayuno" : "Platos principales"));
  const [notice, setNotice] = useState<Notice | null>(null);
  const pickerRef = useRef<HTMLHeadingElement>(null);

  if (!astronaut) return null;
  const targets = dailyTargets(astronaut);

  const nutrientStates = NUTRIENTS.map((n) => {
    const value = totals.nutrients[n.id];
    const target = targets.nutrients[n.id];
    return { ...n, value, target, ...evaluateNutrient(n.kind, value, target, progress) };
  });
  const water = PARAMETERS.hydration.evaluate({ id: "live", astronautId, parameterId: "hydration", value: totals.waterMl, at: new Date(now).toISOString(), source: "registro-alimentos" });
  const waterTone: Tone = totals.waterMl === 0 && progress < 0.15 ? "pending" : water.tone;
  const dayTone = worstTone([waterTone, ...nutrientStates.map((n) => n.tone)].filter((x) => x !== "pending"));
  const missing = nutrientStates.filter((n) => n.tone === "warn" || n.tone === "bad");
  const drinkCount = entries.filter((e) => (FOOD_BY_ID.get(e.foodId)?.waterMl ?? 0) > 0).length;

  // Si el registro agregado ya no existe (se quitó desde la lista), su "Deshacer" no aplica.
  const activeNotice = notice?.kind === "added" && !entries.some((e) => e.id === notice.entryId) ? null : notice;
  const justAdded = activeNotice?.kind === "added" ? activeNotice.entryId : null;

  const add = (food: Food) => {
    const entryId = logIntake(astronautId, food.id, servings, meal);
    if (entryId) setNotice({ kind: "added", entryId, text: t("{food} · {n} porción(es) en {meal}", { food: t(food.name), n: fmtServings(servings), meal: t(MEAL_LABEL[meal]).toLowerCase() }) });
  };

  const remove = (e: IntakeEntry) => {
    const food = FOOD_BY_ID.get(e.foodId);
    removeIntake(e.id);
    setNotice({ kind: "removed", entry: e, text: t("{food} de las {time}", { food: t(food?.name ?? "Registro"), time: formatTime(e.at) }) });
  };

  const undo = () => {
    if (!activeNotice) return;
    if (activeNotice.kind === "added") removeIntake(activeNotice.entryId);
    else logIntake(activeNotice.entry.astronautId, activeNotice.entry.foodId, activeNotice.entry.servings, activeNotice.entry.meal, activeNotice.entry.at);
    setNotice(null);
  };

  /** Lleva al menú (único lugar de carga), opcionalmente en una categoría o comida. */
  const goToPicker = (opts: { category?: FoodCategory; meal?: Meal }) => {
    if (opts.category) setCategory(opts.category);
    if (opts.meal) setMeal(opts.meal);
    pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    pickerRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <section className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-2xl px-6 py-4", TONE_CLASSES[dayTone].soft)}>
        <span className={cn("font-display text-3xl font-bold", TONE_CLASSES[dayTone].strong)}>
          {t("Hoy: {kcal} de {target} kcal · {ml} mL de agua", { kcal: formatNumber(totals.nutrients.energy), target: formatNumber(targets.nutrients.energy), ml: formatNumber(totals.waterMl) })}
        </span>
        <span className="text-base">
          {entries.length === 0
            ? t("Todavía no registraste nada hoy. Anotá cada comida y bebida apenas la termines.")
            : missing.length
              ? t("Para revisar: {list}.", { list: missing.map((n) => `${t(n.label).toLowerCase()} (${t(n.plain).toLowerCase()})`).join(", ") })
              : t("Vas bien con lo que comiste y tomaste hasta ahora.")}
        </span>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <section aria-label={t("Hidratación de hoy")} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Droplet aria-hidden className="size-5 text-cyan-600" />
              {t("Hidratación")}
            </h2>
            <StatusPill tone={waterTone} label={waterTone === "pending" ? t("Sin registros") : t(water.plain)} />
          </div>
          <PlainValue
            tone={waterTone === "pending" ? "ok" : waterTone}
            size="lg"
            plain={`${formatNumber(totals.waterMl)} mL`}
            detail={t("Mínimo {min} mL · ideal {ideal} mL (1 mL por kcal)", { min: formatNumber(targets.waterMinMl), ideal: formatNumber(targets.waterIdealMl) })}
          />
          <WaterBar value={totals.waterMl} min={targets.waterMinMl} ideal={targets.waterIdealMl} />
          <p className="text-sm text-muted-foreground">
            {drinkCount === 0 ? t("Sin bebidas registradas hoy.") : t("{n} registro(s) con agua hoy.", { n: drinkCount })}{" "}
            {t("Cuenta las bebidas y el agua de las comidas rehidratables; después de una EVA, la esclusa suma lo que tomaste de la bolsa del traje.")}
          </p>
          <button
            type="button"
            onClick={() => goToPicker({ category: "Bebidas" })}
            className="self-start text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("Registrar una bebida en el menú ↓")}
          </button>
        </section>

        <section aria-label={t("Aportes nutricionales de hoy")} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{t("Aportes de hoy")}</h2>
            <span className="text-xs text-muted-foreground">{t("Metas NASA para misiones de exploración · {kg} kg", { kg: astronaut.massKg })}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nutrientStates.map((n) => (
              <div key={n.id} className="flex flex-col gap-1.5 rounded-xl bg-muted p-3">
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {t(n.label)}
                  <StatusPill tone={n.tone} label={t(n.plain)} />
                </span>
                <span className="font-display text-xl font-bold">
                  {formatNumber(n.value)} <span className="text-sm font-normal text-muted-foreground">{n.unit}</span>
                </span>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={cn("h-full rounded-full", n.tone === "pending" ? "bg-primary" : TONE_CLASSES[n.tone].dot)}
                    style={{ width: `${Math.min(100, (n.value / n.target) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {n.kind === "max" ? t("Máximo") : t("Meta")} {formatNumber(n.target)} {n.unit} · {t(n.why)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="intake-title" className="grid gap-5 rounded-2xl border bg-card p-5 lg:grid-cols-[1.25fr_1fr]">
        {/* Agregar: único lugar de carga. */}
        <div className="flex min-w-0 flex-col gap-4">
          <h2 id="intake-title" ref={pickerRef} tabIndex={-1} className="scroll-mt-4 text-lg font-bold focus-visible:outline-none">
            {t("Agregar comida o bebida")}
          </h2>
          <ChoiceGroup<Meal>
            name="meal"
            legend="¿En qué comida?"
            options={MEALS.filter((m) => m.id !== "eva").map((m) => ({ value: m.id, label: m.label }))}
            value={meal}
            onChange={setMeal}
          />
          <ChoiceGroup<number> name="servings" legend="Porciones" options={SERVINGS} value={servings} onChange={setServings} />
          <div role="tablist" aria-label={t("Categorías del menú")} className="flex flex-wrap gap-2">
            {FOOD_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={c === category}
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  c === category ? "border-primary bg-accent text-primary" : "bg-card hover:bg-muted",
                )}
              >
                {t(c)}
              </button>
            ))}
          </div>
          <div role="tabpanel" aria-label={t(category)} className="grid gap-2 sm:grid-cols-2">
            {FOODS.filter((f) => f.category === category && !f.hidden).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => add(f)}
                className="flex min-h-16 items-center gap-3 rounded-xl border-2 border-input bg-card px-3 py-2 text-left hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus aria-hidden className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{t(f.name)}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(f.serving)} · {t(f.origin)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end text-xs text-muted-foreground">
                  {isDrink(f) ? (
                    <>
                      <b className="text-sm text-foreground">{formatNumber(f.waterMl * servings)} mL</b>
                      {f.nutrients.energy > 0 && `${formatNumber(f.nutrients.energy * servings)} kcal`}
                    </>
                  ) : (
                    <>
                      <b className="text-sm text-foreground">{formatNumber(f.nutrients.energy * servings)} kcal</b>
                      {t("{g} g proteína", { g: formatNumber(f.nutrients.protein * servings) })}
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Registro: único lugar para corregir (porciones, quitar, deshacer). */}
        <div className="flex min-w-0 flex-col gap-3 lg:border-l lg:pl-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold">{t("Registro de hoy ({n})", { n: entries.length })}</h3>
            <span className="text-xs text-muted-foreground">
              {formatNumber(totals.nutrients.energy)} kcal · {formatNumber(totals.waterMl)} mL
            </span>
          </div>
          <Feedback notice={activeNotice} onUndo={undo} />
          {entries.length === 0 && <p className="text-muted-foreground">{t("Sin registros todavía.")}</p>}
          {MEALS.map((m) => {
            const items = entries.filter((e) => e.meal === m.id);
            if (items.length === 0) return null;
            const sub = dayTotals(items);
            return (
              <div key={m.id} className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between gap-2">
                  <SectionLabel>{t(m.label)}</SectionLabel>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    {formatNumber(sub.nutrients.energy)} kcal · {formatNumber(sub.waterMl)} mL
                    {m.id !== "eva" && (
                      <button
                        type="button"
                        onClick={() => goToPicker({ meal: m.id })}
                        className="min-h-9 rounded-lg px-2 font-semibold text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t("+ Agregar")}
                      </button>
                    )}
                  </span>
                </span>
                <ul className="flex flex-col gap-1.5">
                  {items.map((e) => (
                    <EntryRow
                      key={e.id}
                      entry={e}
                      highlighted={e.id === justAdded}
                      onChange={(n) => updateServings(e.id, n)}
                      onRemove={() => remove(e)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <IntakeTrends astronautId={astronautId} />
    </div>
  );
}

/** Fila del registro: qué, cuándo, cuánto aporta, y los controles para corregirla. */
function EntryRow({ entry: e, highlighted, onChange, onRemove }: { entry: IntakeEntry; highlighted: boolean; onChange: (servings: number) => void; onRemove: () => void }) {
  const f = FOOD_BY_ID.get(e.foodId);
  if (!f) return null;
  const name = t("{food} de las {time}", { food: t(f.name), time: formatTime(e.at) });
  const canLower = e.servings - STEP >= STEP - 1e-9;
  return (
    <li className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted px-3 py-1.5 text-sm", highlighted && "ring-2 ring-ok")}>
      <span className="w-11 shrink-0 text-muted-foreground">{formatTime(e.at)}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{t(f.name)}</span>
        <span className="text-xs text-muted-foreground">
          {f.nutrients.energy > 0 && `${formatNumber(f.nutrients.energy * e.servings)} kcal`}
          {f.nutrients.energy > 0 && f.waterMl > 0 && " · "}
          {f.waterMl > 0 && `${formatNumber(f.waterMl * e.servings)} mL`}
        </span>
      </span>
      <span className="ml-auto flex items-center gap-1">
        <span role="group" aria-label={t("Porciones de {name}", { name })} className="flex items-center rounded-lg border-2 border-input bg-card">
          <button
            type="button"
            onClick={() => onChange(e.servings - STEP)}
            disabled={!canLower}
            aria-label={t("Media porción menos de {name}", { name })}
            className="flex size-11 items-center justify-center rounded-l-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <span className="min-w-12 text-center font-semibold" aria-live="polite">
            {fmtServings(e.servings)} <span className="text-xs font-normal text-muted-foreground">{t("porc.")}</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(e.servings + STEP)}
            aria-label={t("Media porción más de {name}", { name })}
            className="flex size-11 items-center justify-center rounded-r-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("Quitar {name}", { name })}
          className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-bad-soft hover:text-bad-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 aria-hidden className="size-4" />
          {t("Quitar")}
        </button>
      </span>
    </li>
  );
}

/** Aviso de la última acción (agregar o quitar) con "Deshacer". Sin acción, recuerda cómo se usa. Se anuncia a lectores de pantalla. */
function Feedback({ notice, onUndo }: { notice: Notice | null; onUndo: () => void }) {
  return (
    <div aria-live="polite" className="min-h-11">
      {notice ? (
        <div className={cn("flex flex-wrap items-center gap-3 rounded-lg px-3 py-1.5 text-sm", notice.kind === "added" ? "bg-ok-soft" : "bg-secondary")}>
          <span className={cn("flex-1 font-semibold", notice.kind === "added" && "text-ok-strong")}>
            {notice.kind === "added" ? t("Agregado") : t("Se quitó")}: {notice.text}.
          </span>
          <button
            type="button"
            onClick={onUndo}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border-2 border-input bg-card px-3 font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Undo2 aria-hidden className="size-4" />
            {t("Deshacer")}
          </button>
        </div>
      ) : (
        <p className="py-2.5 text-sm text-muted-foreground">{t("Tocá un alimento o bebida del menú para sumarlo. Acá podés corregir las porciones o quitarlo.")}</p>
      )}
    </div>
  );
}

/** Barra de agua: se llena hasta el ideal y marca el mínimo de la NASA. */
function WaterBar({ value, min, ideal }: { value: number; min: number; ideal: number }) {
  const pct = Math.min(100, (value / ideal) * 100);
  const minPct = (min / ideal) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-5 rounded-full bg-border" role="img" aria-label={t("{pct} % del ideal de agua", { pct: Math.round(pct) })}>
        <div className="h-5 rounded-full bg-cyan-600" style={{ width: `${pct}%` }} />
        <div aria-hidden className="absolute -top-1 h-7 w-1 rounded bg-foreground/70" style={{ left: `${minPct}%` }} />
      </div>
      <div className="relative h-4 text-xs text-muted-foreground">
        <span className="absolute -translate-x-1/2" style={{ left: `${minPct}%` }}>
          {t("mínimo")}
        </span>
        <span className="absolute right-0">{t("ideal")}</span>
      </div>
    </div>
  );
}

/** Evolución de los últimos días (los mismos parámetros que ve "Mi estado"). */
function IntakeTrends({ astronautId }: { astronautId: string }) {
  const h = useHealthSummary(astronautId);
  const items = h.statuses.filter((s) => s.id === "hydration" || s.id === "nutrition");
  return (
    <section aria-label={t("Últimos días")} className="grid gap-4 md:grid-cols-2">
      {items.map((s) => (
        <article key={s.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
          <span className="flex items-center justify-between font-semibold text-muted-foreground">
            {s.label} · {t("últimos días")}
            <StatusDot tone={s.tone} />
          </span>
          <PlainValue tone={s.tone} plain={s.plain} detail={`${s.detail} · ${t("normal: {range}", { range: s.normalText })}`} />
          <TrendChart status={s} height={150} />
        </article>
      ))}
    </section>
  );
}
