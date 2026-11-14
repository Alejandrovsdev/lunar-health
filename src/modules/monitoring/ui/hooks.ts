"use client";

import { useMemo } from "react";
import { useAppStore } from "@/core/store";
import { summarizeHealth } from "../domain/status";

export function useAstronauts() {
  return useAppStore((s) => s.astronauts);
}

export function useAstronaut(id: string) {
  const astronauts = useAppStore((s) => s.astronauts);
  return astronauts.find((a) => a.id === id);
}

export function useHealthSummary(astronautId: string) {
  const readings = useAppStore((s) => s.readings);
  const followUps = useAppStore((s) => s.followUps);
  return useMemo(() => summarizeHealth(astronautId, readings, followUps), [astronautId, readings, followUps]);
}

export function useActiveFollowUp(astronautId: string) {
  const followUps = useAppStore((s) => s.followUps);
  return followUps.find((f) => f.active && f.astronautId === astronautId);
}
