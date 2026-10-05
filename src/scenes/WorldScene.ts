import Phaser from "phaser";
import { GAME } from "../config";
import type { DoorDef, ExitDef, MapDef } from "../types";
import { Player, type MoveInput } from "../entities/Player";
import { findTarget, type Interactable } from "../systems/interaction";
import { renderMap } from "../systems/map-render";
import { progress } from "../systems/progress";
import { fadeIn } from "../systems/transition";
import type { UIScene } from "./UIScene";

type Keys = Record<
  "W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SHIFT" | "E" | "SPACE" | "ENTER",
  Phaser.Input.Keyboard.Key
>;

/**
 * Base das cenas exploráveis (vila e interiores): monta o mapa, cria o
 * jogador, a câmera e cuida de interação, portas e saídas.
 */
export abstract class WorldScene extends Phaser.Scene {
  protected def!: MapDef;
  protected player!: Player;
  private items: Interactable[] = [];
  private keys!: Keys;
  private target: Interactable | null = null;
  private leaving = false;

  /** Qual mapa e qual ponto de entrada usar, a partir dos dados da cena. */
  protected abstract resolve(data: unknown): { def: MapDef; spawn: string };
  protected abstract onDoor(door: DoorDef): void;
  protected abstract onExit(exit: ExitDef): void;

  protected get ui(): UIScene {
    return this.scene.get("UI") as UIScene;
  }

  create(data: unknown): void {
    const { def, spawn } = this.resolve(data);
    this.def = def;
    this.leaving = false;
    this.target = null;

    const world = renderMap(this, def);
    this.items = world.items;
    this.physics.world.setBounds(0, 0, world.widthPx, world.heightPx);

    const s = def.spawns[spawn] ?? Object.values(def.spawns)[0];
    this.player = new Player(this, s.x * GAME.tile, s.y * GAME.tile, s.facing);
    this.player.halt();
    this.physics.add.collider(this.player, world.collide);
    this.physics.add.collider(this.player, world.solids);

    const cam = this.cameras.main;
    cam.setZoom(GAME.zoom).setRoundPixels(true).setBackgroundColor(GAME.background);
    const viewW = GAME.width / GAME.zoom;
    const viewH = GAME.height / GAME.zoom;
    if (world.widthPx <= viewW && world.heightPx <= viewH) {
      cam.centerOn(world.widthPx / 2, world.heightPx / 2);
    } else {
      cam.setBounds(0, 0, world.widthPx, world.heightPx);
      cam.startFollow(this.player, true, 0.15, 0.15);
    }

    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE,ENTER"
    ) as Keys;

    this.ui.enterWorld(def.name);
    fadeIn(this);
  }

  update(): void {
    if (this.leaving) return;
    if (this.ui.busy) {
      this.player.halt();
      this.ui.hidePrompt();
      return;
    }

    const input = this.readInput();
    this.player.move(input);

    this.target = findTarget(this.items, this.player.probe(), GAME.interactRange);
    if (this.target) {
      const { sprite } = this.target;
      const top = this.cameras.main.getWorldPoint(0, 0);
      const sx = (sprite.x - top.x) * GAME.zoom;
      const sy = (sprite.y - sprite.height - top.y) * GAME.zoom;
      this.ui.showPrompt(this.target.content.title, sx, sy);
    } else {
      this.ui.hidePrompt();
    }

    const pressed = [this.keys.E, this.keys.SPACE, this.keys.ENTER].some((k) =>
      Phaser.Input.Keyboard.JustDown(k)
    );
    if (pressed && this.target && this.ui.canInteract()) this.interact(this.target);

    this.checkDoors(input);
  }

  private readInput(): MoveInput {
    const k = this.keys;
    return {
      x: (k.LEFT.isDown || k.A.isDown ? -1 : 0) + (k.RIGHT.isDown || k.D.isDown ? 1 : 0),
      y: (k.UP.isDown || k.W.isDown ? -1 : 0) + (k.DOWN.isDown || k.S.isDown ? 1 : 0),
      run: k.SHIFT.isDown,
    };
  }

  private interact(item: Interactable): void {
    this.player.halt();
    this.ui.hidePrompt();
    this.ui.openDialog(item.content);
    progress.mark(item.content.id);
    item.sparkle?.destroy();
    item.sparkle = undefined;
  }

  private checkDoors(input: MoveInput): void {
    const T = GAME.tile;
    const { x, y } = this.player;
    if (input.y < 0) {
      for (const door of this.def.doors) {
        const bottom = (door.y + 1) * T;
        const inside = x > door.x * T + 2 && x < (door.x + door.w) * T - 2;
        if (inside && y <= bottom + 9 && y >= bottom) return this.leave(() => this.onDoor(door));
      }
    }
    if (input.y > 0) {
      for (const exit of this.def.exits) {
        const inside = x > exit.x * T && x < (exit.x + exit.w) * T;
        if (inside && y >= exit.y * T + 8) return this.leave(() => this.onExit(exit));
      }
    }
  }

  private leave(go: () => void): void {
    this.leaving = true;
    this.player.halt();
    this.ui.hidePrompt();
    go();
  }
}
