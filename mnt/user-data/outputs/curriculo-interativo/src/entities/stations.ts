import type { KaboomCtx, GameObj } from "kaboom";
import { STATIONS } from "../data/stations";
import type { Station } from "../types";

const STATION_SIZE = 40;

export interface StationEntity {
  data: Station;
  obj: GameObj;
}

/**
 * Instancia no mundo cada estação definida em src/data/stations.ts.
 * Usa um retângulo colorido como placeholder — troque por
 * `k.sprite(...)` quando tiver arte pronta.
 */
export function createStationEntities(k: KaboomCtx): StationEntity[] {
  return STATIONS.map((data) => {
    const obj = k.add([
      k.rect(STATION_SIZE, STATION_SIZE, { radius: 6 }),
      k.pos(data.pos.x, data.pos.y),
      k.anchor("center"),
      k.color(...data.color),
      k.outline(2, k.rgb(255, 255, 255)),
      k.area(),
      data.tag,
    ]);

    obj.add([
      k.text(data.label, { size: 12 }),
      k.anchor("center"),
      k.pos(0, STATION_SIZE / 2 + 12),
      k.color(255, 255, 255),
    ]);

    return { data, obj };
  });
}

/**
 * Retorna os dados da estação mais próxima do jogador,
 * ou null se nenhuma estiver dentro da distância de interação.
 */
export function findNearestStation(
  player: GameObj,
  stations: StationEntity[],
  maxDistance: number
): Station | null {
  let nearest: Station | null = null;
  let nearestDist = Infinity;

  for (const station of stations) {
    const dist = player.pos.dist(station.obj.pos);
    if (dist < maxDistance && dist < nearestDist) {
      nearest = station.data;
      nearestDist = dist;
    }
  }

  return nearest;
}
