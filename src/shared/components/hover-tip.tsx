import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Tooltip liviano para gráficos hechos a mano (SVG/div): aparece con el mouse
 * y también con el foco del teclado. El contenedor debe tener `group relative`.
 */
export function HoverTip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none invisible absolute z-20 flex w-56 flex-col gap-1 rounded-lg border bg-card p-3 text-sm opacity-0 shadow-lg transition-opacity",
        "group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
