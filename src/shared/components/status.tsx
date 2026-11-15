import { cn } from "@/shared/lib/cn";
import { TONE_CLASSES, TONE_LABEL, type Tone } from "@/shared/domain/status";
import { tx } from "@/shared/i18n";

export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full", TONE_CLASSES[tone].dot, className)} />;
}

export function StatusPill({ tone, label, className }: { tone: Tone; label?: string; className?: string }) {
  const c = TONE_CLASSES[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", c.soft, c.strong, className)}>
      <StatusDot tone={tone} className="size-2" />
      {tx(label ?? TONE_LABEL[tone])}
    </span>
  );
}

/**
 * Valor en lenguaje simple primero y el dato técnico después.
 * Premisa: no dar por sentado que el astronauta sabe interpretar números médicos.
 */
export function PlainValue({
  plain,
  detail,
  tone,
  size = "md",
  className,
}: {
  plain: string;
  detail?: string;
  tone: Tone;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl", xl: "text-5xl" };
  return (
    <span className={cn("flex flex-col", className)}>
      <span className={cn("font-display font-bold leading-tight", sizes[size], tone === "ok" ? "text-foreground" : TONE_CLASSES[tone].strong)}>
        {tx(plain)}
      </span>
      {detail && <span className="text-sm text-muted-foreground">{tx(detail)}</span>}
    </span>
  );
}

export function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bad-soft px-2.5 py-1 text-xs font-bold text-bad-strong">
      <span aria-hidden className="size-2 animate-live rounded-full bg-bad" />
      {tx(label)}
    </span>
  );
}
