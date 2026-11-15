import type { Astronaut } from "@/modules/monitoring/domain";

/**
 * Equipo de EVA de un astronauta: él/ella y su compañero/a si también está afuera.
 * Las salidas son siempre en pareja, así que vuelven y hacen el check-in juntos.
 */
export function evaTeam(astronauts: Astronaut[], astronautId: string): Astronaut[] {
  const me = astronauts.find((a) => a.id === astronautId);
  if (!me || me.location !== "exterior") return [];
  const partner = astronauts.find((a) => a.id === me.eva?.partnerId && a.location === "exterior");
  return partner ? [me, partner] : [me];
}

/** Equipos de EVA en curso, sin repetir (cada pareja una sola vez). */
export function evaTeams(astronauts: Astronaut[]): Astronaut[][] {
  const seen = new Set<string>();
  const teams: Astronaut[][] = [];
  for (const a of astronauts) {
    if (a.location !== "exterior" || seen.has(a.id)) continue;
    const team = evaTeam(astronauts, a.id);
    team.forEach((m) => seen.add(m.id));
    teams.push(team);
  }
  return teams;
}
