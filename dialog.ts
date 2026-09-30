import type { KaboomCtx, GameObj } from "kaboom";
import { GAME_CONFIG } from "./config";

export interface DialogController {
  open: (title: string, lines: string[]) => void;
  close: () => void;
  isOpen: () => boolean;
}

/**
 * Cria um controlador de diálogo. Ele encapsula toda a criação/destruição
 * dos objetos do balão, expondo só open/close/isOpen para o resto do jogo.
 */
export function createDialog(k: KaboomCtx): DialogController {
  let container: GameObj | null = null;

  function close(): void {
    container?.destroy();
    container = null;
  }

  function open(title: string, lines: string[]): void {
    close();

    const boxWidth = 560;
    const boxHeight = 280;
    const x = (GAME_CONFIG.width - boxWidth) / 2;
    const y = (GAME_CONFIG.height - boxHeight) / 2;

    // k.fixed() faz o balão ficar preso à tela, não ao mundo do jogo.
    container = k.add([k.fixed(), k.z(100)]);

    container.add([
      k.rect(boxWidth, boxHeight, { radius: 10 }),
      k.pos(x, y),
      k.color(24, 24, 36),
      k.outline(3, k.rgb(255, 255, 255)),
    ]);

    container.add([
      k.text(title, { size: 22 }),
      k.pos(x + 24, y + 18),
      k.color(255, 220, 130),
    ]);

    container.add([
      k.text(lines.join("\n"), { size: 15, width: boxWidth - 48 }),
      k.pos(x + 24, y + 58),
      k.color(230, 230, 230),
    ]);

    container.add([
      k.text("[E / ESC] fechar", { size: 12 }),
      k.pos(x + 24, y + boxHeight - 26),
      k.color(150, 150, 150),
    ]);
  }

  function isOpen(): boolean {
    return container !== null;
  }

  return { open, close, isOpen };
}
