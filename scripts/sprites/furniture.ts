import { Img, sheet, type SpriteOut } from "./draw";
import { C } from "./palette";

/**
 * Móveis e objetos dos interiores. Cada objeto "conquista" do currículo
 * tem um sprite próprio; os de decoração são reaproveitados.
 * Prefixo "f-" no nome do sprite.
 */

function desk(img: Img, x: number, y: number, w: number, h: number) {
  img.rect(x, y, w, 4, C.woodLight);
  img.hline(x, x + w - 1, y + 3, C.wood);
  img.rect(x, y + 4, w, h - 4, C.wood);
  img.hline(x, x + w - 1, y + 4, C.woodDark);
  img.rect(x + 2, y + 6, w - 4, h - 8, "#a55d3f");
  img.frame(x + 2, y + 6, w - 4, h - 8, C.woodDark);
}

function screen(img: Img, x: number, y: number, w: number, h: number, bg: string, bezel: string = C.ink) {
  img.rect(x, y, w, h, bezel);
  img.rect(x + 1, y + 1, w - 2, h - 2, bg);
}

function codeLines(img: Img, x: number, y: number, w: number, rows: number, seed: number) {
  const colors = [C.yellow, C.sky, C.pink, C.leaf, C.white];
  for (let r = 0; r < rows; r++) {
    const indent = ((r * 3 + seed) % 3) * 2;
    const len = 3 + ((r * 7 + seed * 5) % (w - 4 - indent));
    img.hline(x + indent, x + indent + len, y + r * 2, colors[(r + seed) % colors.length]);
  }
}

function finish(img: Img, shadow = true): Img {
  img.outline(C.outline);
  if (shadow) img.shadow(img.w / 2, img.h - 1, img.w / 2 - 2, 1.5);
  return img;
}

// ───────────────────────── Catsuc ─────────────────────────

function terminal(): Img {
  const img = new Img(32, 32);
  desk(img, 1, 17, 30, 13);
  // monitor CRT
  img.rect(7, 2, 18, 14, C.cream);
  img.hline(7, 24, 2, C.paper);
  screen(img, 9, 4, 14, 9, C.black, C.stoneDark);
  img.text(10, 5, ">_", C.leaf);
  img.hline(10, 18, 11, "#2f7a43");
  img.rect(14, 16, 4, 1, C.cream);
  // teclado e caneca com a cobrinha do Python
  img.rect(8, 17, 16, 3, C.stone).hline(9, 22, 18, C.stoneMid);
  img.rect(26, 13, 4, 5, C.white).set(27, 14, "#4a7fc1").set(28, 15, C.yellow);
  return finish(img);
}

function serverRack(): SpriteOut {
  const frame = (on: boolean) => {
    const img = new Img(16, 32);
    img.rect(1, 1, 14, 30, C.ink);
    img.rect(2, 2, 12, 28, C.slate);
    for (let u = 0; u < 6; u++) {
      const y = 3 + u * 4;
      img.rect(3, y, 10, 3, "#2a3148");
      img.hline(4, 8, y + 1, C.stoneDark);
      const blink = (u + (on ? 1 : 0)) % 2 === 0;
      img.set(10, y + 1, blink ? C.leaf : "#2f7a43");
      img.set(12, y + 1, u === 3 && on ? C.yellow : C.leaf);
    }
    img.hline(2, 13, 28, C.stoneDark);
    return finish(img);
  };
  return { img: sheet([frame(true), frame(false)], 2), frame: { w: 16, h: 32 } };
}

function backupCabinet(): Img {
  const img = new Img(16, 32);
  img.rect(1, 3, 14, 27, C.stoneMid);
  img.hline(1, 14, 3, C.stone);
  img.textCenter(8, 5, "BKP", C.ink);
  for (let d = 0; d < 3; d++) {
    const y = 12 + d * 6;
    img.rect(2, y, 12, 5, C.stone);
    img.frame(2, y, 12, 5, C.stoneDark);
    img.rect(6, y + 2, 4, 1, C.slate);
    img.rect(3, y + 1, 2, 1, [C.redLight, C.yellow, C.leaf][d]);
  }
  // disquete em cima
  img.rect(4, 0, 8, 3, "#4a7fc1").rect(6, 0, 4, 1, C.stone);
  return finish(img);
}

function devDesk(): Img {
  const img = new Img(32, 32);
  desk(img, 1, 17, 30, 13);
  for (const x of [3, 16]) {
    screen(img, x, 3, 13, 10, "#1e2436");
    codeLines(img, x + 2, 5, 11, 4, x);
    img.rect(x + 5, 13, 3, 4, C.stoneDark);
  }
  img.rect(8, 18, 14, 2, C.stone);
  img.rect(24, 18, 3, 2, C.stoneDark);
  return finish(img);
}

function redisFridge(): Img {
  const img = new Img(16, 32);
  img.rect(1, 1, 14, 30, C.red);
  img.hline(2, 13, 1, C.redLight);
  img.vline(1, 1, 30, "#8f3526");
  img.hline(1, 14, 11, "#8f3526");
  img.rect(12, 4, 1, 5, C.stone).rect(12, 14, 1, 8, C.stone);
  // logo: cubinhos empilhados
  img.rect(4, 15, 5, 2, C.white).rect(4, 18, 5, 2, C.white).rect(4, 21, 5, 2, C.white);
  img.set(9, 15, C.salmon);
  // ímã de post-it
  img.rect(3, 4, 5, 4, C.yellow).hline(4, 6, 5, C.wood);
  return finish(img);
}

function componentsShelf(): Img {
  const img = new Img(32, 32);
  img.rect(1, 1, 30, 30, C.wood);
  img.rect(3, 3, 26, 26, C.woodDark);
  const colors = [C.sky, C.pink, C.yellow, C.leaf, C.purpleLight, C.orange, C.teal];
  for (let s = 0; s < 3; s++) {
    const y = 3 + s * 9;
    img.rect(3, y + 7, 26, 2, C.wood);
    let x = 4;
    let i = s * 2;
    while (x < 27) {
      const w = 3 + (i % 3);
      const h = 4 + (i % 2) * 2;
      img.rect(x, y + 7 - h, Math.min(w, 28 - x), h, colors[i % colors.length]);
      img.hline(x, x + Math.min(w, 28 - x) - 1, y + 7 - h, C.white);
      x += w + 1;
      i++;
    }
  }
  return finish(img);
}

function testBoard(): Img {
  const img = new Img(32, 28);
  img.rect(1, 1, 30, 22, C.stone);
  img.rect(2, 2, 28, 20, C.white);
  img.text(3, 3, "TESTES", C.ink);
  // barras de cobertura
  img.text(3, 10, "12%", C.red);
  img.rect(16, 10, 3, 5, C.redLight);
  img.text(3, 16, "67%", C.grassDark);
  img.rect(16, 16, 13, 5, C.grassDark).hline(16, 28, 16, C.leaf);
  // bandeja de canetas
  img.rect(4, 23, 24, 2, C.stoneMid);
  img.hline(6, 9, 22, C.red).hline(12, 15, 22, "#4a7fc1");
  return finish(img, false);
}

function s3Conveyor(): Img {
  const img = new Img(40, 26);
  // esteira
  img.rect(1, 14, 26, 5, C.ink);
  img.hline(1, 26, 14, C.stoneDark);
  for (let x = 2; x < 26; x += 4) img.set(x, 16, C.stoneMid);
  img.rect(3, 19, 2, 6, C.slate).rect(22, 19, 2, 6, C.slate);
  // caixinhas (pedaços do arquivo em streaming)
  for (const x of [3, 10, 17]) {
    img.rect(x, 9, 5, 5, C.woodLight).hline(x, x + 4, 11, C.wood).set(x + 2, 9, C.wood);
  }
  // balde laranja
  img.rect(27, 6, 12, 18, C.orange);
  img.ellipse(33, 6, 6, 2, "#b5541f");
  img.hline(27, 38, 10, C.yellow);
  img.hline(28, 37, 22, "#b5541f");
  img.textCenter(33, 13, "S3", C.white);
  return finish(img);
}

function queueMachine(): Img {
  const img = new Img(32, 32);
  img.rect(2, 10, 28, 20, C.stoneMid);
  img.hline(2, 29, 10, C.stone);
  screen(img, 5, 13, 14, 8, C.black, C.slate);
  img.text(6, 14, "JOB", C.leaf);
  img.rect(22, 13, 5, 5, C.redLight).set(23, 14, C.salmon);
  img.rect(22, 20, 5, 3, C.yellow);
  img.rect(4, 24, 24, 4, C.slate);
  for (let x = 5; x < 27; x += 3) img.vline(x, 25, 26, C.stoneDark);
  // fila de jobs em cima
  for (const [x, c] of [
    [4, C.sky],
    [11, C.pink],
    [18, C.leaf],
  ] as const) {
    img.rect(x, 3, 6, 6, c).hline(x, x + 5, 3, C.white);
  }
  img.line(25, 8, 28, 2, C.stoneDark).set(28, 2, C.redLight);
  return finish(img);
}

function vault(): Img {
  const img = new Img(32, 32);
  img.rect(2, 2, 28, 27, C.stoneDark);
  img.rect(4, 4, 24, 23, C.stoneMid);
  img.hline(4, 27, 4, C.stone);
  img.circle(14, 15, 6, C.slate);
  img.circle(14, 15, 4, C.yellow);
  img.circle(14, 15, 1.5, C.wood);
  for (const [dx, dy] of [
    [0, -5],
    [5, 0],
    [0, 5],
    [-5, 0],
  ])
    img.set(14 + dx, 15 + dy, C.stone);
  img.rect(23, 11, 2, 9, C.stone);
  // biscoito (cookie HttpOnly) no topo
  img.circle(26, 3, 3, C.dirtDark);
  img.set(25, 2, C.woodDark).set(27, 4, C.woodDark);
  img.rect(6, 22, 12, 4, C.slate);
  img.text(7, 22, "JWT", C.yellow);
  img.rect(3, 29, 4, 2, C.ink).rect(25, 29, 4, 2, C.ink);
  return finish(img);
}

function rocket(): Img {
  const img = new Img(16, 32);
  img.rect(3, 26, 10, 5, C.slate).hline(3, 12, 26, C.stoneMid);
  img.ellipse(8, 14, 4, 10, C.white);
  img.ellipse(8, 5, 2, 3, C.red);
  img.circle(8, 12, 2, "#4a7fc1").set(7, 11, C.sky);
  img.rect(2, 18, 3, 6, C.red).rect(11, 18, 3, 6, C.red);
  img.rect(6, 23, 4, 3, C.orange).set(7, 25, C.yellow).set(8, 25, C.yellow);
  // baleinha do Docker na lateral
  img.rect(6, 16, 5, 2, "#4a7fc1").set(11, 15, "#4a7fc1");
  return finish(img);
}

function grafanaTv(): SpriteOut {
  const frame = (shift: number) => {
    const img = new Img(40, 26);
    img.rect(1, 1, 38, 22, C.ink);
    img.rect(3, 3, 34, 18, "#161a26");
    // painéis
    img.rect(4, 4, 15, 8, "#212638").rect(21, 4, 15, 8, "#212638");
    img.rect(4, 13, 32, 7, "#212638");
    for (let i = 0; i < 14; i++) {
      const y = 10 - Math.round(Math.abs(Math.sin((i + shift) * 0.7)) * 5);
      img.set(5 + i, y, C.orange);
    }
    img.rect(23, 6, 4, 5, C.leaf).rect(28, 8, 4, 3, C.yellow);
    for (let i = 0; i < 30; i++) {
      const y = 18 - Math.round((Math.sin((i + shift * 2) * 0.45) + 1) * 2);
      img.set(5 + i, y, C.sky);
    }
    img.rect(18, 23, 4, 2, C.stoneDark);
    return finish(img, false);
  };
  return { img: sheet([frame(0), frame(3)], 2), frame: { w: 40, h: 26 } };
}

function plaque(label: string): Img {
  const img = new Img(34, 14);
  img.rect(1, 1, 32, 12, C.woodDark);
  img.rect(2, 2, 30, 10, C.wood);
  img.frame(2, 2, 30, 10, C.yellow);
  img.textCenter(17, 5, label, C.paper);
  return finish(img, false);
}

// ─────────────────────── NeuroKids ───────────────────────

function reception(): Img {
  const img = new Img(48, 32);
  // monitor e sininho
  screen(img, 6, 2, 14, 10, "#dff5ec", C.stoneDark);
  img.rect(8, 4, 10, 2, C.purple).rect(8, 7, 4, 3, C.pink).rect(13, 7, 5, 3, C.sky);
  img.rect(12, 12, 3, 3, C.stoneDark);
  img.circle(36, 12, 3, C.yellow).set(36, 8, C.yellow).set(35, 11, "#fff3b0");
  // balcão
  img.rect(1, 15, 46, 4, C.woodLight).hline(1, 46, 18, C.wood);
  img.rect(2, 19, 44, 11, C.mint);
  img.hline(2, 45, 19, "#a9d6c4");
  for (let x = 6; x < 44; x += 8) img.vline(x, 21, 28, "#a9d6c4");
  img.ascii(21, 22, [".p.p.", "ppppp", ".ppp.", "..p.."], { p: C.pink });
  return finish(img);
}

function screensWall(): Img {
  const img = new Img(52, 30);
  img.rect(1, 1, 50, 26, C.stoneDark);
  const accents = [C.purple, C.teal, C.pink, "#4a7fc1", C.orange, C.grassDark];
  for (let i = 0; i < 6; i++) {
    const x = 3 + (i % 3) * 16;
    const y = 3 + Math.floor(i / 3) * 12;
    screen(img, x, y, 14, 10, C.white, C.ink);
    img.rect(x + 1, y + 1, 12, 2, accents[i]);
    img.rect(x + 2, y + 4, 4, 4, C.mint);
    img.hline(x + 7, x + 11, y + 4, C.stoneMid).hline(x + 7, x + 10, y + 6, C.stoneMid);
  }
  return finish(img, false);
}

function fileCabinet(): Img {
  const img = new Img(16, 32);
  img.rect(1, 2, 14, 28, C.stone);
  img.hline(1, 14, 2, C.white);
  for (let d = 0; d < 4; d++) {
    const y = 4 + d * 6;
    img.frame(2, y, 12, 5, C.stoneMid);
    img.rect(6, y + 2, 4, 1, C.stoneDark);
  }
  // cadeado
  img.rect(10, 13, 5, 5, C.yellow).frame(11, 10, 3, 4, C.stoneDark).set(12, 15, C.woodDark);
  return finish(img);
}

function logbook(): Img {
  const img = new Img(20, 28);
  img.rect(8, 12, 4, 14, C.wood).vline(8, 12, 25, C.woodDark);
  img.rect(5, 25, 10, 2, C.woodDark);
  img.rect(1, 6, 18, 7, C.woodDark);
  img.rect(2, 3, 8, 8, C.paper).rect(10, 3, 8, 8, C.white);
  img.vline(10, 3, 10, C.stoneMid);
  for (let y = 5; y < 10; y += 2) {
    img.hline(3, 8, y, C.stoneMid);
    img.hline(11, 16, y, C.stoneMid);
  }
  img.set(15, 9, C.redLight);
  img.line(17, 0, 13, 6, C.white);
  return finish(img);
}

function aiMachine(): SpriteOut {
  const frame = (glow: boolean) => {
    const img = new Img(40, 32);
    // entrada de PDFs
    img.rect(1, 12, 10, 12, C.stoneMid).hline(1, 10, 12, C.stone);
    img.rect(3, 8, 6, 7, C.white).hline(4, 7, 10, C.redLight).hline(4, 7, 12, C.stoneMid);
    // corpo com cúpula
    img.rect(10, 14, 20, 16, C.slate);
    img.hline(10, 29, 14, C.stoneMid);
    img.circle(20, 11, 8, C.ink);
    img.circle(20, 11, 7, glow ? "#5b3f8f" : "#3f2d66");
    img.circle(20, 11, glow ? 4 : 3, C.purpleLight);
    img.circle(20, 11, 1.5, C.white);
    if (glow) img.set(15, 7, C.white).set(25, 14, C.white);
    img.rect(13, 20, 14, 6, C.ink);
    img.text(14, 21, "RAG", glow ? C.purpleLight : C.purple);
    // saída de vetores
    img.rect(30, 16, 9, 14, C.stoneMid).hline(30, 38, 16, C.stone);
    for (let i = 0; i < 6; i++) img.set(32 + (i % 3) * 2, 19 + Math.floor(i / 3) * 3, glow ? C.teal : C.mint);
    img.rect(11, 29, 3, 2, C.ink).rect(26, 29, 3, 2, C.ink);
    return finish(img);
  };
  return { img: sheet([frame(true), frame(false)], 2), frame: { w: 40, h: 32 } };
}

function robotDesk(): Img {
  const img = new Img(32, 32);
  desk(img, 1, 17, 30, 13);
  // notebook
  img.rect(3, 10, 12, 8, C.stoneDark);
  img.rect(4, 11, 10, 6, "#1e2436");
  codeLines(img, 5, 12, 8, 3, 2);
  img.rect(2, 17, 14, 2, C.stone);
  // robozinho ajudante
  img.vline(24, 1, 3, C.stoneDark).set(24, 0, C.redLight);
  img.rect(19, 3, 10, 8, C.orange);
  img.rect(20, 5, 8, 4, C.cream);
  img.set(22, 6, C.ink).set(25, 6, C.ink).hline(22, 25, 8, C.wood);
  img.rect(20, 11, 8, 6, "#d8742a");
  img.rect(18, 12, 2, 4, C.orange).rect(28, 12, 2, 4, C.orange);
  return finish(img);
}

function examBed(): Img {
  const img = new Img(34, 18);
  img.rect(1, 4, 32, 6, C.white);
  img.rect(1, 2, 8, 4, C.mint);
  img.hline(1, 32, 9, C.stone);
  img.rect(2, 10, 30, 2, C.stoneDark);
  img.rect(3, 12, 2, 5, C.stoneMid).rect(29, 12, 2, 5, C.stoneMid);
  return finish(img);
}

function toyBlocks(): Img {
  const img = new Img(16, 16);
  img.rect(1, 8, 6, 6, C.redLight).text(2, 9, "A", C.white);
  img.rect(8, 8, 6, 6, "#4a7fc1").text(9, 9, "B", C.white);
  img.rect(4, 2, 6, 6, C.yellow).text(5, 3, "C", C.woodDark);
  return finish(img);
}

function kidsRug(): Img {
  const img = new Img(48, 32);
  const rings = [C.purpleLight, C.sky, C.leaf, C.yellow, C.pink];
  rings.forEach((c, i) => img.ellipse(24, 16, 23 - i * 4, 15 - i * 3, c));
  return img.outline(C.outline);
}

// ─────────────────────── UNIFAVIP ───────────────────────

function chalkboard(): Img {
  const img = new Img(52, 30);
  img.rect(1, 1, 50, 24, C.wood);
  img.rect(3, 3, 46, 20, "#2f5a3a");
  img.text(5, 5, "CIENCIA DA", C.white);
  img.text(5, 11, "COMPUTACAO", C.white);
  img.text(5, 17, "2025-2029", C.yellow);
  img.rect(4, 25, 44, 2, C.woodDark);
  img.rect(8, 24, 4, 1, C.white).rect(16, 24, 3, 1, C.pink);
  return finish(img, false);
}

function corkboard(): Img {
  const img = new Img(34, 26);
  img.rect(1, 1, 32, 22, C.wood);
  img.rect(3, 3, 28, 18, C.dirtDark);
  img.checker(3, 3, 28, 18, C.dirtDark, "#c47a4d");
  img.rect(5, 5, 10, 12, C.paper);
  img.text(6, 6, "PRO", C.ink);
  img.text(6, 12, "UNI", C.ink);
  // medalha
  img.line(21, 4, 23, 10, "#4a7fc1").line(27, 4, 25, 10, C.red);
  img.circle(24, 13, 4, C.yellow);
  img.circle(24, 13, 2, C.orange);
  img.set(10, 4, C.redLight).set(24, 4, C.blue);
  return finish(img, false);
}

function bookshelf(): Img {
  const img = new Img(32, 34);
  img.rect(1, 1, 30, 32, C.woodDark);
  img.rect(3, 3, 26, 28, "#4d2a26");
  const colors = [C.red, "#4a7fc1", C.yellow, C.grassDark, C.purple, C.orange, C.teal, C.pink];
  for (let s = 0; s < 3; s++) {
    const y = 3 + s * 9;
    img.rect(3, y + 8, 26, 1, C.wood);
    let x = 4;
    let i = s * 3;
    while (x < 28) {
      const h = 6 + (i % 3);
      img.rect(x, y + 8 - h, 2, h, colors[i % colors.length]);
      img.set(x, y + 9 - h, C.white);
      x += 3;
      i++;
    }
  }
  return finish(img);
}

function certificate(): Img {
  const img = new Img(18, 16);
  img.rect(1, 1, 16, 13, "#8257e5");
  img.rect(3, 3, 12, 9, C.paper);
  img.hline(5, 12, 5, C.stoneMid).hline(5, 12, 7, C.stoneMid);
  img.circle(12, 10, 1.5, C.yellow);
  return finish(img, false);
}

function studentDesk(): Img {
  const img = new Img(16, 20);
  img.rect(1, 2, 14, 4, C.woodLight).hline(1, 14, 5, C.wood);
  img.rect(2, 6, 2, 6, C.slate).rect(12, 6, 2, 6, C.slate);
  img.rect(4, 12, 8, 3, "#4a7fc1").rect(4, 15, 2, 4, C.slate).rect(10, 15, 2, 4, C.slate);
  img.rect(4, 2, 5, 2, C.white);
  return finish(img);
}

function teacherDesk(): Img {
  const img = new Img(34, 22);
  desk(img, 1, 6, 32, 14);
  img.circle(26, 4, 3, C.red).set(26, 0, C.grassDark).set(25, 3, C.salmon);
  img.rect(5, 3, 8, 3, C.paper).rect(6, 2, 8, 3, C.white);
  return finish(img);
}

function globe(): Img {
  const img = new Img(16, 20);
  img.rect(5, 16, 6, 2, C.woodDark).vline(8, 12, 16, C.woodDark);
  img.circle(8, 8, 6, "#4a7fc1");
  img.ellipse(6, 7, 2.5, 3, C.grassDark).ellipse(11, 10, 2, 1.5, C.grassDark);
  img.set(5, 5, C.leaf);
  img.line(2, 8, 8, 14, C.yellow);
  return finish(img);
}

// ─────────────────────── decoração comum ───────────────────────

function pottedPlant(): Img {
  const img = new Img(16, 24);
  img.rect(4, 15, 8, 7, C.wood).hline(4, 11, 15, C.woodLight).hline(5, 10, 21, C.woodDark);
  for (const [x, y, r] of [
    [8, 8, 5],
    [4, 11, 3],
    [12, 11, 3],
  ])
    img.circle(x, y, r, C.grassDark);
  img.circle(7, 7, 3, C.grass).set(6, 5, C.leaf);
  return finish(img);
}

function waterCooler(): Img {
  const img = new Img(16, 32);
  img.rect(4, 1, 8, 10, C.sky).hline(5, 10, 2, C.white).vline(10, 3, 9, C.waterLight);
  img.rect(3, 11, 10, 18, C.stone).hline(3, 12, 11, C.white);
  img.rect(5, 16, 2, 2, C.redLight).rect(9, 16, 2, 2, "#4a7fc1");
  img.rect(4, 29, 8, 2, C.stoneDark);
  return finish(img);
}

function coffeeMachine(): Img {
  const img = new Img(16, 24);
  img.rect(2, 2, 12, 20, C.ink);
  img.rect(3, 3, 10, 5, C.slate).set(5, 5, C.leaf).set(7, 5, C.redLight);
  img.rect(5, 10, 6, 8, "#161a26");
  img.rect(6, 14, 4, 4, C.white).hline(6, 9, 14, C.wood);
  img.set(7, 11, C.stone).set(8, 12, C.stone);
  return finish(img);
}

function chair(): Img {
  const img = new Img(16, 18);
  img.rect(3, 1, 10, 7, "#4a7fc1").hline(4, 11, 1, C.sky);
  img.rect(3, 8, 10, 3, "#35599a");
  img.rect(7, 11, 2, 4, C.slate).hline(3, 12, 15, C.slate);
  return finish(img);
}

export function drawFurniture(): Record<string, SpriteOut> {
  return {
    // Catsuc
    "f-terminal": terminal(),
    "f-server-rack": serverRack(),
    "f-backup": backupCabinet(),
    "f-dev-desk": devDesk(),
    "f-redis-fridge": redisFridge(),
    "f-components-shelf": componentsShelf(),
    "f-test-board": testBoard(),
    "f-s3-conveyor": s3Conveyor(),
    "f-queue-machine": queueMachine(),
    "f-vault": vault(),
    "f-rocket": rocket(),
    "f-grafana-tv": grafanaTv(),
    "f-plaque-suporte": plaque("SUPORTE"),
    "f-plaque-junior": plaque("JUNIOR"),
    "f-plaque-pleno": plaque("PLENO"),
    // NeuroKids
    "f-reception": reception(),
    "f-screens-wall": screensWall(),
    "f-file-cabinet": fileCabinet(),
    "f-logbook": logbook(),
    "f-ai-machine": aiMachine(),
    "f-robot-desk": robotDesk(),
    "f-exam-bed": examBed(),
    "f-toy-blocks": toyBlocks(),
    "f-kids-rug": kidsRug(),
    // UNIFAVIP
    "f-chalkboard": chalkboard(),
    "f-corkboard": corkboard(),
    "f-bookshelf": bookshelf(),
    "f-certificate": certificate(),
    "f-student-desk": studentDesk(),
    "f-teacher-desk": teacherDesk(),
    "f-globe": globe(),
    // comum
    "f-plant": pottedPlant(),
    "f-water-cooler": waterCooler(),
    "f-coffee": coffeeMachine(),
    "f-chair": chair(),
  };
}
