import type { InteriorId, MapDef, PropDef } from "../types";
import type { SpriteKey } from "../assets/sprites.gen";
import { TerrainGrid, bake, type Terrain, type WallStyle } from "./terrain";
import * as catsuc from "../data/catsuc";
import * as nk from "../data/neurokids";
import * as edu from "../data/education";

/**
 * Interiores: parede de 3 tiles no topo, piso, tapete de saída embaixo
 * no centro e "vazio" em volta. Objetos de parede usam y ≈ 2.9 (base
 * logo acima do piso); objetos de chão ficam da linha 4 em diante.
 */

interface RoomSpec {
  id: InteriorId;
  name: string;
  width: number;
  height: number;
  floor: Terrain;
  wall: WallStyle;
  props: PropDef[];
}

const WALL_ROWS = 3;

function room(spec: RoomSpec): MapDef {
  const { width: W, height: H } = spec;
  const grid = new TerrainGrid(W, H, "void");
  grid.rect("wall", 1, 0, W - 2, WALL_ROWS);
  grid.rect(spec.floor, 1, WALL_ROWS, W - 2, H - WALL_ROWS - 1);
  const exitX = Math.floor(W / 2) - 1;
  grid.rect("exit", exitX, H - 2, 2, 1);

  return {
    key: spec.id,
    name: spec.name,
    width: W,
    height: H,
    ...bake(grid, spec.wall),
    props: spec.props,
    doors: [],
    exits: [{ x: exitX, y: H - 2, w: 2 }],
    spawns: { entry: { x: exitX + 1, y: H - 2.1, facing: "up" } },
  };
}

const at = (sprite: SpriteKey, x: number, y: number, extra: Partial<PropDef> = {}): PropDef => ({
  sprite,
  x,
  y,
  ...extra,
});
/** objeto pendurado na parede: sem colisor (a parede já bloqueia) */
const onWall = (sprite: SpriteKey, x: number, extra: Partial<PropDef> = {}) =>
  at(sprite, x, 2.9, { body: false, ...extra });

const CATSUC = room({
  id: "catsuc",
  name: "Catsuc",
  width: 26,
  height: 12,
  floor: "floor-wood",
  wall: "office",
  props: [
    // logo da empresa no alto da parede, acima das placas
    at("f-catsuc-logo", 8, 2, { body: false }),
    // Suporte (colunas 1–8)
    onWall("f-plaque-suporte", 5, { content: catsuc.SUPPORT_PLAQUE }),
    at("f-terminal", 3, 5, { content: catsuc.CLI_TERMINAL }),
    at("f-server-rack", 5.5, 5, { anim: { frames: [0, 1], fps: 2 }, content: catsuc.SERVER_RACKS }),
    at("f-server-rack", 6.5, 5, { anim: { frames: [1, 0], fps: 2 }, content: catsuc.SERVER_RACKS }),
    at("f-backup", 7.5, 5, { content: catsuc.BACKUPS }),
    at("f-water-cooler", 1.5, 8),
    at("f-coffee", 1.5, 10),
    at("f-plant", 8.5, 10),
    // Júnior (colunas 9–16)
    onWall("f-plaque-junior", 11, { content: catsuc.JUNIOR_PLAQUE }),
    onWall("f-test-board", 15, { content: catsuc.TEST_BOARD }),
    at("f-components-shelf", 13, 5, { content: catsuc.COMPONENTS_SHELF }),
    at("f-redis-fridge", 15.5, 5, { content: catsuc.REDIS_FRIDGE }),
    at("f-dev-desk", 11, 7.5, { content: catsuc.ENDPOINTS_DESK }),
    at("f-chair", 11, 8.6, { body: { w: 10, h: 4 } }),
    // Pleno (colunas 17–24)
    onWall("f-plaque-pleno", 19, { content: catsuc.PLENO_PLAQUE }),
    onWall("f-grafana-tv", 22.5, { anim: { frames: [0, 1], fps: 1 }, content: catsuc.GRAFANA_TV }),
    at("f-s3-conveyor", 19.5, 6, { content: catsuc.S3_STREAMING }),
    at("f-queue-machine", 23, 6, { content: catsuc.QUEUES }),
    at("f-vault", 19, 9.3, { content: catsuc.AUTH_VAULT }),
    at("f-rocket", 23.5, 9.3, { content: catsuc.DEPLOY_ROCKET }),
    at("f-plant", 17.5, 5),
    at("f-plant", 24.5, 10.5),
  ],
});

const NEUROKIDS = room({
  id: "neurokids",
  name: "NeuroKids",
  width: 18,
  height: 11,
  floor: "floor-clinic",
  wall: "clinic",
  props: [
    onWall("f-screens-wall", 4.5, { content: nk.SCREENS_WALL }),
    at("f-reception", 9, 5.5, { content: nk.RECEPTION }),
    at("f-logbook", 12.5, 5, { content: nk.AUDIT_LOG }),
    at("f-file-cabinet", 15.5, 5, { content: nk.RBAC_CABINET }),
    at("f-file-cabinet", 16.5, 5),
    at("f-ai-machine", 4, 8.5, { anim: { frames: [0, 1], fps: 1.5 }, content: nk.RAG_MACHINE }),
    at("f-robot-desk", 14.5, 8.5, { content: nk.AI_ASSISTED }),
    at("f-kids-rug", 9, 9.4, { body: false, layer: "floor" }),
    at("f-toy-blocks", 11, 8.3, { body: { w: 12, h: 5 } }),
    at("f-plant", 1.5, 5),
    at("f-exam-bed", 2.2, 10.2),
  ],
});

const SCHOOL = room({
  id: "school",
  name: "UNIFAVIP WYDEN",
  width: 16,
  height: 11,
  floor: "floor-school",
  wall: "school",
  props: [
    onWall("f-certificate", 3, { content: edu.ROCKETSEAT }),
    onWall("f-chalkboard", 8, { content: edu.DEGREE }),
    onWall("f-corkboard", 12.5, { content: edu.SCHOLARSHIP }),
    at("f-bookshelf", 2, 5.2, { content: edu.FOCUS }),
    at("f-teacher-desk", 8, 5.5),
    at("f-globe", 14.5, 5),
    ...[4.5, 6.5, 10, 12]
      .flatMap((x) => [at("f-student-desk", x, 7.3), at("f-student-desk", x, 9)])
      .map((p) => ({ ...p, body: { w: 12, h: 8 } })),
    at("f-plant", 14.5, 9.8),
  ],
});

export const INTERIORS: Record<InteriorId, MapDef> = {
  catsuc: CATSUC,
  neurokids: NEUROKIDS,
  school: SCHOOL,
};
