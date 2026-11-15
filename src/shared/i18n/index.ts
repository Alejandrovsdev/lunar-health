import { EN } from "./en";

/**
 * Traducción estilo gettext: el texto en español es la clave.
 *
 * - `t("Hola {name}", { name })` devuelve el texto en el idioma activo, con variables.
 * - Es una función común (no un hook): sirve en componentes y en el dominio puro.
 * - Al cambiar de idioma, `LocaleProvider` vuelve a montar la app, así todo se recalcula.
 * - Si falta una traducción, se muestra el español (y se avisa en desarrollo).
 * - También traduce textos guardados en el navegador (resultados, veredictos), porque se guardan en español.
 */
export type Locale = "es" | "en";
export const LOCALES: Locale[] = ["es", "en"];
export const LOCALE_KEY = "lunar-health.locale";
/** Idioma por defecto (servidor y primera visita). */
export const DEFAULT_LOCALE: Locale = "en";

/** Configuración regional para números y fechas. */
const INTL: Record<Locale, string> = { es: "es-AR", en: "en-US" };

let current: Locale = DEFAULT_LOCALE;

export function getLocale(): Locale {
  return current;
}

/** Solo para `LocaleProvider`. */
export function setCurrentLocale(locale: Locale) {
  current = locale;
}

export function intlLocale(): string {
  return INTL[current];
}

const missing = new Set<string>();

/**
 * Patrones con variables ("{ms} ms · {n} lapsos"): traducen textos armados con números,
 * incluso los guardados en el navegador. Las partes capturadas también se traducen.
 */
let patterns: { re: RegExp; names: string[]; en: string }[] | null = null;
function fromPattern(text: string): string | undefined {
  patterns ??= Object.entries(EN)
    .filter(([es]) => es.includes("{"))
    .map(([es, en]) => {
      const names: string[] = [];
      const src = es.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (_m, k: string) => {
        names.push(k);
        return "(.+?)";
      });
      return { re: new RegExp(`^${src}$`), names, en };
    });
  for (const p of patterns) {
    const m = p.re.exec(text);
    if (!m) continue;
    const vars = Object.fromEntries(p.names.map((k, i) => [k, m[i + 1]]));
    return p.en.replace(/\{(\w+)\}/g, (_m, k: string) => tx(vars[k] ?? ""));
  }
  return undefined;
}
let enValues: Set<string> | null = null;

/** En desarrollo, avisa una vez por texto sin traducir (salvo que ya sea un texto en inglés). */
function reportMissing(text: string) {
  if (process.env.NODE_ENV === "production" || missing.has(text) || !/[a-záéíóúñ]/i.test(text)) return;
  enValues ??= new Set(Object.values(EN));
  if (enValues.has(text)) return;
  missing.add(text);
  console.warn(`[i18n] Falta traducción EN: ${JSON.stringify(text)}`);
}

export function t(es: string, vars?: Record<string, string | number>): string {
  let text = es;
  if (current === "en") {
    const en = EN[es] ?? (vars ? undefined : fromPattern(es));
    if (en !== undefined) text = en;
    else reportMissing(es);
  }
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text;
}

/**
 * Traduce si hay traducción (exacta o por patrón). La usan los componentes compartidos
 * (pills, valores, opciones), que reciben tanto claves en español como textos ya traducidos:
 * si el texto ya está en inglés, no avisa.
 */
export function tx<T extends string | undefined>(text: T): T {
  if (current !== "en" || !text) return text;
  const en = EN[text] ?? fromPattern(text);
  if (en === undefined) reportMissing(text);
  return (en ?? text) as T;
}

/** Elige la forma singular o plural y la traduce: `tn(n, "{n} test", "{n} tests")`. */
export function tn(n: number, one: string, other: string, vars?: Record<string, string | number>): string {
  return t(n === 1 ? one : other, { n, ...vars });
}
