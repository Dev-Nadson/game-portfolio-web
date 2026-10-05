/**
 * Gera toda a pixel art própria do jogo em public/assets.
 *
 *   npm run sprites
 *
 * Saídas:
 * - tilesets/world.png: Kenney Tiny Town + tiles próprios (ver src/maps/tileset.ts)
 * - sprites/<nome>.png: um PNG por sprite ou spritesheet
 * - src/assets/sprites.gen.ts: manifesto lido pelo BootScene (não editar)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Img, readPng, writePng } from "./sprites/draw";
import { drawPlayer, PLAYER_FRAME } from "./sprites/player";
import { drawCustomTiles } from "./sprites/tiles";
import { drawTrees } from "./sprites/nature";
import { drawBuildings } from "./sprites/buildings";
import { drawObjects } from "./sprites/objects";
import { drawCrops, CROP_FRAME } from "./sprites/crops";
import { drawFurniture } from "./sprites/furniture";
import { drawUi } from "./sprites/ui";
import { CUSTOM_TILES, KENNEY_TILE_COUNT, TILESET_COLUMNS } from "../src/maps/tileset";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "public/assets");
const TILE = 16;

interface ManifestEntry {
  key: string;
  file: string;
  frameWidth?: number;
  frameHeight?: number;
}

const manifest: ManifestEntry[] = [];

function emit(key: string, img: Img, frame?: { w: number; h: number }): void {
  const file = `assets/sprites/${key}.png`;
  writePng(img, path.join(ROOT, "public", file));
  manifest.push({ key, file, ...(frame && { frameWidth: frame.w, frameHeight: frame.h }) });
}

function buildTileset(): void {
  const kenney = readPng(path.join(ASSETS, "tilesets/kenney-tiny-town/tilemap_packed.png"));
  const custom = drawCustomTiles();
  const total = KENNEY_TILE_COUNT + CUSTOM_TILES.length;
  const out = new Img(TILESET_COLUMNS * TILE, Math.ceil(total / TILESET_COLUMNS) * TILE);
  out.blit(kenney, 0, 0);
  CUSTOM_TILES.forEach((name, i) => {
    const index = KENNEY_TILE_COUNT + i;
    out.blit(custom[name], (index % TILESET_COLUMNS) * TILE, Math.floor(index / TILESET_COLUMNS) * TILE);
  });
  writePng(out, path.join(ASSETS, "tilesets/world.png"));
}

function writeManifest(): void {
  const file = path.join(ROOT, "src/assets/sprites.gen.ts");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = [
    "// Arquivo gerado por scripts/generate-sprites.ts — não editar à mão.",
    "export const SPRITES = " + JSON.stringify(manifest, null, 2) + " as const;",
    "",
    "export type SpriteKey = (typeof SPRITES)[number][\"key\"];",
    "",
  ].join("\n");
  fs.writeFileSync(file, body);
}

buildTileset();
emit("player", drawPlayer(), PLAYER_FRAME);
emit("crops", drawCrops(), CROP_FRAME);
for (const group of [drawTrees(), drawBuildings(), drawObjects(), drawFurniture(), drawUi()]) {
  for (const [key, value] of Object.entries(group)) {
    if (value instanceof Img) emit(key, value);
    else emit(key, value.img, value.frame);
  }
}
writeManifest();
console.log(`✓ ${manifest.length} sprites + tileset gerados em public/assets`);
