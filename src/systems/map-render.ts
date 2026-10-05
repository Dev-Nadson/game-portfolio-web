import Phaser from "phaser";
import { GAME } from "../config";
import type { MapDef, PropDef } from "../types";
import type { Interactable } from "./interaction";
import { progress } from "./progress";

export interface RenderedMap {
  collide: Phaser.Tilemaps.TilemapLayer;
  solids: Phaser.Physics.Arcade.StaticGroup;
  items: Interactable[];
  widthPx: number;
  heightPx: number;
}

const DEPTH = { ground: -30, overlay: -20, floorProps: -10, sparkle: 100000 };

/**
 * Monta um MapDef na cena: camadas de tiles, props com ordenação por Y,
 * colisores e a lista de interativos. Usado pela vila, pelos interiores
 * e pela tela inicial.
 */
export function renderMap(scene: Phaser.Scene, def: MapDef): RenderedMap {
  const T = GAME.tile;
  const map = scene.make.tilemap({ tileWidth: T, tileHeight: T, width: def.width, height: def.height });
  const tiles = map.addTilesetImage("world", "world", T, T, 0, 0)!;

  map.createBlankLayer("ground", tiles)!.putTilesAt(def.ground, 0, 0).setDepth(DEPTH.ground);
  const overlay = map.createBlankLayer("overlay", tiles)!.setDepth(DEPTH.overlay);
  def.overlay.forEach((row, y) => row.forEach((t, x) => t >= 0 && overlay.putTileAt(t, x, y)));

  // camada invisível só com os tiles sólidos
  const collide = map.createBlankLayer("collide", tiles)!.setVisible(false);
  def.collision.forEach((row, y) => row.forEach((solid, x) => solid && collide.putTileAt(0, x, y)));
  collide.setCollisionByExclusion([-1]);

  const solids = scene.physics.add.staticGroup();
  const items: Interactable[] = [];
  for (const prop of def.props) spawnProp(scene, prop, solids, items);

  return { collide, solids, items, widthPx: def.width * T, heightPx: def.height * T };
}

function ensureAnim(scene: Phaser.Scene, texture: string, frames: number[], fps: number): string {
  const key = `${texture}:${frames.join("-")}`;
  if (!scene.anims.exists(key)) {
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: texture, frame })),
      frameRate: fps,
      repeat: -1,
    });
  }
  return key;
}

function spawnProp(
  scene: Phaser.Scene,
  prop: PropDef,
  solids: Phaser.Physics.Arcade.StaticGroup,
  items: Interactable[]
): void {
  const T = GAME.tile;
  const x = prop.x * T;
  const y = prop.y * T;
  const sprite = scene.add.sprite(x, y, prop.sprite, prop.frame ?? 0).setOrigin(0.5, 1);
  sprite.setDepth(prop.layer === "floor" ? DEPTH.floorProps : y);
  if (prop.flipX) sprite.setFlipX(true);
  if (prop.anim) {
    const key = ensureAnim(scene, prop.sprite, prop.anim.frames, prop.anim.fps);
    // atraso aleatório para as plantas não balançarem todas juntas
    sprite.play({ key, delay: Math.random() * 1500 });
  }

  let rect: Phaser.Geom.Rectangle;
  if (prop.body !== false) {
    const b = prop.body ?? { w: sprite.width - 4, h: Math.min(10, sprite.height / 3) };
    rect = new Phaser.Geom.Rectangle(x - b.w / 2, y - (b.dy ?? 0) - b.h, b.w, b.h);
    const zone = scene.add.zone(rect.centerX, rect.centerY, rect.width, rect.height);
    solids.add(zone);
  } else {
    // objetos de parede: a base do sprite é a área tocável
    rect = new Phaser.Geom.Rectangle(x - sprite.width / 2, y - 10, sprite.width, 10);
  }

  if (!prop.content) return;
  const item: Interactable = { content: prop.content, sprite, rect };
  if (!prop.content.optional && !progress.has(prop.content.id)) {
    item.sparkle = scene.add
      .sprite(x + sprite.width / 2 - 3, y - sprite.height + 2, "sparkle")
      .setDepth(DEPTH.sparkle)
      .play("sparkle");
    scene.tweens.add({ targets: item.sparkle, y: item.sparkle.y - 3, duration: 700, yoyo: true, repeat: -1 });
  }
  items.push(item);
}
