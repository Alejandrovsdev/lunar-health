"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLocale } from "@/shared/i18n";

/** La voz elegida se guarda por idioma: en español y en inglés se recuerdan por separado. */
const voiceKey = () => `lunar-health.tts.voice.${getLocale()}`;
/** Prefijo de idioma de las voces (es-AR, es-ES, es-US… / en-US, en-GB…). */
const langPrefix = () => getLocale();
const RATE_KEY = "lunar-health.tts.rate";

export interface SpeechApi {
  /** El navegador soporta speechSynthesis. */
  supported: boolean;
  /** Voces disponibles, con las del español primero. */
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  setVoiceURI: (uri: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  /** Lee `text` en voz alta; cancela cualquier lectura previa. `onEnd` no se invoca si fue cancelada. */
  speak: (text: string, onEnd?: () => void) => void;
  /** Detiene la lectura actual. */
  stop: () => void;
  speaking: boolean;
}

/**
 * Wrapper de la Web Speech API (speechSynthesis) para leer las preguntas de los tests en voz alta.
 * Usa por defecto una voz del idioma activo de la app (español o inglés) y pone esas voces primero.
 * La elección de voz (por idioma) y la velocidad quedan guardadas en localStorage.
 */
export function useSpeech(): SpeechApi {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURIState] = useState("");
  const [rate, setRateState] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  // Cada lectura recibe un token: si se cancela, su onEnd no debe disparar callbacks viejos.
  const tokenRef = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return;
      const lang = langPrefix();
      const matches = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith(lang);
      const sorted = [...list].sort((a, b) => Number(matches(b)) - Number(matches(a)) || a.name.localeCompare(b.name));
      setVoices(sorted);
      setVoiceURIState((prev) => {
        // Solo se respeta una voz elegida si es del idioma activo: en EN nunca queda una voz en español.
        const ok = (uri: string | null) => !!uri && sorted.some((v) => v.voiceURI === uri && matches(v));
        if (ok(prev)) return prev;
        const saved = localStorage.getItem(voiceKey());
        if (ok(saved)) return saved!;
        // Preferencia: voz local del idioma (funciona sin conexión) y después cualquiera del idioma.
        return (sorted.find((v) => matches(v) && v.localService) ?? sorted.find(matches) ?? sorted[0])?.voiceURI ?? "";
      });
    };

    const savedRate = Number(localStorage.getItem(RATE_KEY));
    if (savedRate >= 0.7 && savedRate <= 1.3) setRateState(savedRate);

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const setVoiceURI = useCallback((uri: string) => {
    setVoiceURIState(uri);
    localStorage.setItem(voiceKey(), uri);
  }, []);

  const setRate = useCallback((value: number) => {
    setRateState(value);
    localStorage.setItem(RATE_KEY, String(value));
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!("speechSynthesis" in window) || !text) {
        onEnd?.();
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const token = ++tokenRef.current;
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Sin voz cargada todavía: al menos que el navegador lea con el idioma correcto.
        utterance.lang = getLocale() === "en" ? "en-US" : "es-AR";
      }
      utterance.rate = rate;
      utterance.onend = () => {
        if (token !== tokenRef.current) return;
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        if (token !== tokenRef.current) return;
        setSpeaking(false);
      };
      setSpeaking(true);
      synth.speak(utterance);
    },
    [voices, voiceURI, rate],
  );

  const stop = useCallback(() => {
    tokenRef.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, voices, voiceURI, setVoiceURI, rate, setRate, speak, stop, speaking };
}
