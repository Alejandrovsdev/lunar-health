import { intlLocale } from "@/shared/i18n";

/** Formateo según el idioma activo (es-AR: coma decimal · en-US: punto decimal). */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(intlLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(intlLocale(), { hour: "2-digit", minute: "2-digit" });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(intlLocale(), { day: "numeric", month: "short" });
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
}

/** Día de la semana y hora: "lun, 08:00" / "Mon, 08:00 AM". */
export function formatWeekdayTime(iso: string): string {
  return new Date(iso).toLocaleString(intlLocale(), { weekday: "short", hour: "2-digit", minute: "2-digit" });
}
