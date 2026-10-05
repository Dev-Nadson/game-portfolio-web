import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { Img } from "../../src/shared/img";

/** Primitivas de pixel art (compartilhadas com o jogo) + leitura e escrita de PNG. */
export * from "../../src/shared/img";

export function readPng(file: string): Img {
  const png = PNG.sync.read(fs.readFileSync(file));
  const img = new Img(png.width, png.height);
  img.data.set(png.data);
  return img;
}

export function writePng(img: Img, file: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const png = new PNG({ width: img.w, height: img.h });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(file, PNG.sync.write(png));
}
