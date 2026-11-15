"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES, type Tone } from "@/shared/domain/status";

function initials(name: string) {
  return name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Foto de perfil con anillo del color del estado: se identifica a la persona y su estado de un vistazo.
 * Si no hay foto (o falla la carga), muestra las iniciales.
 */
export function CrewAvatar({ name, photo, tone, className }: { name: string; photo?: string; tone: Tone; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = photo && !failed;
  return (
    <span
      className={cn(
        "relative inline-flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary ring-4 ring-offset-2 ring-offset-card",
        TONE_CLASSES[tone].ring,
        className,
      )}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto local pequeña, no requiere optimización
        <img src={photo} alt={`Foto de ${name}`} className="size-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name} className="font-display text-2xl font-bold text-secondary-foreground">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
