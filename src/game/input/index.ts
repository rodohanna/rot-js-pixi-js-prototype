import * as ROT from "rot-js";
export enum Key {
  W,
  A,
  S,
  D,
  E,
  Q,
  F
}
export class Input {
  inputMap: Record<number, boolean> = {};
  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }
  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!e.repeat) {
      this.setInput(e.keyCode, true);
    }
  };
  private handleKeyUp = (e: KeyboardEvent): void => {
    this.setInput(e.keyCode, false);
  };
  private setInput(keyCode: number, isSet: boolean): void {
    switch (keyCode) {
      case ROT.KEYS.VK_W: {
        this.inputMap[Key.W] = isSet;
        break;
      }
      case ROT.KEYS.VK_A: {
        this.inputMap[Key.A] = isSet;
        break;
      }
      case ROT.KEYS.VK_S: {
        this.inputMap[Key.S] = isSet;
        break;
      }
      case ROT.KEYS.VK_D: {
        this.inputMap[Key.D] = isSet;
        break;
      }
      case ROT.KEYS.VK_Q: {
        this.inputMap[Key.Q] = isSet;
        break;
      }
      case ROT.KEYS.VK_E: {
        this.inputMap[Key.E] = isSet;
        break;
      }
      case ROT.KEYS.VK_F: {
        this.inputMap[Key.F] = isSet;
        break;
      }
    }
  }
}
