import type { DoorDef } from "../types";
import { VILLAGE } from "../maps/village";
import { goTo } from "../systems/transition";
import { WorldScene } from "./WorldScene";

export interface VillageData {
  spawn?: string;
}

export class VillageScene extends WorldScene {
  constructor() {
    super("Village");
  }

  protected resolve(data: VillageData) {
    return { def: VILLAGE, spawn: data?.spawn ?? "start" };
  }

  protected onDoor(door: DoorDef): void {
    goTo(this, "Interior", { id: door.target });
  }

  protected onExit(): void {
    // a vila não tem saídas
  }
}
