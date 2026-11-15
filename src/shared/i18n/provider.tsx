"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_KEY, LOCALES, setCurrentLocale, type Locale } from "./index";

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

function readSaved(): Locale | null {
  try {
    // `?lang=en` en la URL tiene prioridad: sirve para compartir la demo directamente en un idioma.
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (LOCALES.includes(fromUrl as Locale)) {
      localStorage.setItem(LOCALE_KEY, fromUrl!);
      return fromUrl as Locale;
    }
    const saved = localStorage.getItem(LOCALE_KEY);
    return LOCALES.includes(saved as Locale) ? (saved as Locale) : null;
  } catch {
    return null;
  }
}

/**
 * Idioma de la app. Arranca en el idioma por defecto (igual que el HTML del servidor) y aplica el guardado al montar.
 * Al cambiar de idioma vuelve a montar todo con `key`: cada `t()` se recalcula sin suscripciones.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = readSaved();
    if (saved && saved !== DEFAULT_LOCALE) {
      setCurrentLocale(saved);
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setCurrentLocale(l);
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_KEY, l);
    } catch {
      /* sin almacenamiento: el idioma dura hasta recargar */
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <div key={locale} className="contents">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Selector ES / EN del encabezado. */
export function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div role="group" aria-label="Idioma / Language" className="flex rounded-lg border p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={
            locale === l
              ? "rounded-md bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground"
              : "rounded-md px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
