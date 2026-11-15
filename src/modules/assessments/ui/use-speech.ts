"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_KEY = "lunar-health.tts.voice";
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
 * La elección de voz y velocidad queda guardada en localStorage.
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
      const sorted = [...list].sort(
        (a, b) => Number(b.lang.toLowerCase().startsWith("es")) - Number(a.lang.toLowerCase().startsWith("es")) || a.name.localeCompare(b.name),
      );
      setVoices(sorted);
      setVoiceURIState((prev) => {
        if (prev && sorted.some((v) => v.voiceURI === prev)) return prev;
        const saved = localStorage.getItem(VOICE_KEY);
        if (saved && sorted.some((v) => v.voiceURI === saved)) return saved;
        return sorted.find((v) => v.lang.toLowerCase().startsWith("es"))?.voiceURI ?? sorted[0]?.voiceURI ?? "";
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
    localStorage.setItem(VOICE_KEY, uri);
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
