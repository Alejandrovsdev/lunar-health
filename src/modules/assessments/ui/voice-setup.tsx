"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/form";
import { SectionLabel } from "@/shared/components/page-header";
import { getLocale, t } from "@/shared/i18n";
import type { SpeechApi } from "./use-speech";

interface VoiceSetupProps {
  title: string;
  description: string;
  /** Detalles del test (frecuencia, duración). */
  meta?: string;
  speech: SpeechApi;
  onStart: (mode: "guided" | "manual") => void;
}

/**
 * Pantalla de inicio de un test con lectura por voz:
 * elegir modelo de voz y velocidad, y arrancar con "Comenzar test" (modo guiado
 * con una pregunta por pantalla) o pasar al modo manual.
 */
export function VoiceSetup({ title, description, meta, speech, onStart }: VoiceSetupProps) {
  const sample = t("Hola. Esta es la voz que se va a usar para leer las preguntas del test.");
  const current = speech.voices.find((v) => v.voiceURI === speech.voiceURI);
  // Solo las voces del idioma activo (si el sistema no tiene ninguna, todas).
  const sameLang = speech.voices.filter((v) => v.lang.toLowerCase().startsWith(getLocale()));
  const options = sameLang.length ? sameLang : speech.voices;

  return (
    <section aria-label={t("Inicio del test")} className="flex flex-col gap-5 rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-1">
        <SectionLabel>{t("Test con lectura por voz")}</SectionLabel>
        <h2 className="text-3xl font-bold">{t(title)}</h2>
        <p className="text-base text-muted-foreground">{t(description)}</p>
        {meta && <p className="text-sm text-muted-foreground">{t(meta)}</p>}
      </div>

      {speech.supported ? (
        <div className="flex flex-col gap-4 rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            {t("La voz leerá cada pregunta con sus opciones. Contestá con un clic y el test sigue solo con la siguiente.")}
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tts-voice">{t("Voz")}</Label>
            <div className="flex gap-2">
              <select
                id="tts-voice"
                value={speech.voiceURI}
                onChange={(e) => speech.setVoiceURI(e.target.value)}
                className="min-h-12 w-full rounded-lg border-2 border-input bg-card px-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {options.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" size="lg" className="shrink-0" onClick={() => speech.speak(sample)} aria-label={t("Escuchar muestra de la voz")}>
                <Volume2 className="size-5" />
              </Button>
            </div>
            {!current && <span className="text-sm text-muted-foreground">{t("Cargando voces del sistema…")}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tts-rate">{t("Velocidad: {rate}x", { rate: speech.rate.toFixed(1) })}</Label>
            <input
              id="tts-rate"
              type="range"
              min={0.7}
              max={1.3}
              step={0.1}
              value={speech.rate}
              onChange={(e) => speech.setRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {t("Tu navegador no soporta lectura en voz alta: el test se mostrará en modo manual.")}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => onStart(speech.supported ? "guided" : "manual")}>
          {t("Comenzar test")}
        </Button>
        {speech.supported && (
          <Button size="lg" variant="outline" onClick={() => onStart("manual")}>
            {t("Continuar sin voz")}
          </Button>
        )}
      </div>
    </section>
  );
}
