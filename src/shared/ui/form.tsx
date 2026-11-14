"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-base font-semibold", className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-lg border-2 border-input bg-card px-3 text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  hint?: string;
  unit?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  step?: number;
  min?: number;
  max?: number;
}

export function NumberField({ id, label, hint, unit, value, onChange, step = 1, min, max }: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
        {unit && <span className="shrink-0 text-sm text-muted-foreground">{unit}</span>}
      </div>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface ChoiceGroupProps<T extends string | number> {
  name: string;
  legend: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: number;
}

/** Grupo de opciones grandes y accesibles (radio nativo con estilo de botón). */
export function ChoiceGroup<T extends string | number>({ name, legend, options, value, onChange, columns }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-semibold">{legend}</legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = value === opt.value;
          return (
            <label
              key={String(opt.value)}
              htmlFor={id}
              className={cn(
                "flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg border-2 px-2 py-2 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                checked ? "border-primary bg-accent" : "border-input bg-card hover:bg-muted",
              )}
            >
              <input id={id} type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(opt.value)} />
              <span className="text-base font-semibold">{opt.label}</span>
              {opt.sublabel && <span className="text-xs text-muted-foreground">{opt.sublabel}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function YesNo({ name, legend, value, onChange, hint }: { name: string; legend: string; value: boolean | null; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
      <ChoiceGroup<"si" | "no">
        name={name}
        legend={legend}
        value={value === null ? null : value ? "si" : "no"}
        onChange={(v) => onChange(v === "si")}
        options={[
          { value: "no", label: "No" },
          { value: "si", label: "Sí" },
        ]}
      />
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}
