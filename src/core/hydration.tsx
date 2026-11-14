"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "./store";

/** Espera a que el estado guardado en el navegador esté cargado antes de mostrar datos. */
export function StoreHydration({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setReady(true));
    void useAppStore.persist.rehydrate();
    if (useAppStore.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  if (!ready) {
    return <div className="p-10 text-muted-foreground">Cargando datos de la tripulación…</div>;
  }
  return <>{children}</>;
}
