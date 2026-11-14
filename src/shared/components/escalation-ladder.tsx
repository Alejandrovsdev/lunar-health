import { cn } from "@/shared/lib/cn";
import { ESCALATION_LEVELS, type EscalationLevel } from "@/shared/domain/status";

export function EscalationLadder({ level }: { level: EscalationLevel }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs" aria-label={`Nivel de escalamiento: ${ESCALATION_LEVELS[level]}`}>
      <span className="mr-1 text-muted-foreground">Nivel:</span>
      {ESCALATION_LEVELS.map((name, i) => (
        <span key={name} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border-2 px-2.5 py-0.5 font-semibold",
              i === level ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground",
            )}
          >
            {i + 1}. {name}
          </span>
          {i < ESCALATION_LEVELS.length - 1 && <span aria-hidden className="text-muted-foreground">→</span>}
        </span>
      ))}
    </div>
  );
}
