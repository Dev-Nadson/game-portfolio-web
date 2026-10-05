import Phaser from "phaser";
import { GAME } from "../config";
import type { Facing } from "../types";

const DIRS: Facing[] = ["down", "left", "right", "up"];
/** frame "parado" de cada direção na spritesheet (coluna 1) */
const IDLE_FRAME: Record<Facing, number> = { down: 1, left: 5, right: 9, up: 13 };

const FACING_VEC: Record<Facing, { x: number; y: number }> = {
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export interface MoveInput {
  x: number;
  y: number;
  run: boolean;
}

export function createPlayerAnims(scene: Phaser.Scene): void {
  DIRS.forEach((dir, row) => {
    const key = `walk-${dir}`;
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers("player", { start: row * 4, end: row * 4 + 3 }),
      frameRate: 8,
      repeat: -1,
    });
  });
}

/**
 * Personagem controlado pelo visitante. O corpo físico cobre só os pés
 * (10x6), o que permite passar "atrás" de árvores e prédios.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: Facing;

  constructor(scene: Phaser.Scene, x: number, y: number, facing: Facing) {
    super(scene, x, y, "player", IDLE_FRAME[facing]);
    this.facing = facing;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 6).setOffset(3, 18);
    body.setCollideWorldBounds(true);
  }

  /** Move em 8 direções com a diagonal normalizada. */
  move(input: MoveInput): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const len = Math.hypot(input.x, input.y);
    if (len === 0) {
      body.setVelocity(0, 0);
      this.anims.stop();
      this.setFrame(IDLE_FRAME[this.facing]);
    } else {
      const speed = GAME.playerSpeed * (input.run ? GAME.runMultiplier : 1);
      body.setVelocity((input.x / len) * speed, (input.y / len) * speed);
      // na diagonal, mantém a direção horizontal (como no Stardew)
      this.facing = input.x !== 0 ? (input.x < 0 ? "left" : "right") : input.y < 0 ? "up" : "down";
      this.anims.play(`walk-${this.facing}`, true);
      this.anims.timeScale = input.run ? 1.5 : 1;
    }
    this.setDepth(this.y);
  }

  halt(): void {
    this.move({ x: 0, y: 0, run: false });
  }

  /** Ponto logo à frente dos pés, usado para achar o objeto "olhado". */
  probe(): { x: number; y: number } {
    const v = FACING_VEC[this.facing];
    return { x: this.x + v.x * 9, y: this.y - 3 + v.y * 10 };
  }
}
