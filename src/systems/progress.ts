import Phaser from "phaser";
import type { MapDef } from "../types";
import { VILLAGE } from "../maps/village";
import { INTERIORS } from "../maps/interiors";

/**
 * Progresso "descobertos X/Y". Conta só conteúdos não opcionais (as plantas
 * da horta ficam de fora). Fica salvo no navegador — se o localStorage
 * não estiver disponível, o jogo funciona igual, só não lembra.
 */
const STORAGE_KEY = "portgame:discovered";

const ALL_MAPS: MapDef[] = [VILLAGE, ...Object.values(INTERIORS)];
const COUNTED = new Set(
  ALL_MAPS.flatMap((m) => m.props.flatMap((p) => (p.content && !p.content.optional ? [p.content.id] : [])))
);

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

const seen = load();

export const events = new Phaser.Events.EventEmitter();

export const progress = {
  total: COUNTED.size,
  has: (id: string) => seen.has(id),
  count: () => [...seen].filter((id) => COUNTED.has(id)).length,
  mark(id: string): void {
    if (seen.has(id)) return;
    seen.add(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
    } catch {
      // sem persistência: ok
    }
    events.emit("progress");
  },
};
