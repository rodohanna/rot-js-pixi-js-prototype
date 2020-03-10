import { Context } from "../context";
import * as ROT from "rot-js";
import * as PIXI from "pixi.js";

export const lerp = (start: number, end: number, normal: number) => {
  return (1 - normal) * start + normal * end;
};

export const setFOV = (
  x: number,
  y: number,
  visionRadius: number,
  context: Context
) => {
  context.visibleCoords = {};
  const fov = new ROT.FOV.PreciseShadowcasting(
    (x: number, y: number): boolean => {
      return `${x},${y}` in context.map;
    }
  );
  fov.compute(
    x,
    y,
    visionRadius,
    (x: number, y: number, _r: number, visibility: number) => {
      context.visibleCoords[`${x},${y}`] = visibility;
    }
  );
};

export interface AlphaAnimatorOpts {
  start: number;
  end: number;
  duration: number;
  sprite: PIXI.Sprite;
}
export class AlphaAnimator {
  start: number;
  end: number;
  duration: number;
  sprite: PIXI.Sprite;
  private counter = 0;
  private running = false;
  constructor({ start, end, duration, sprite }: AlphaAnimatorOpts) {
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.sprite = sprite;
    this.running = false;
  }
  restart(newStart: number, newEnd: number): void {
    if (this.start !== newStart || this.end !== newEnd) {
      this.running = true;
      this.start = newStart;
      this.end = newEnd;
      this.counter = 0;
    }
  }
  tick(delta: number): void {
    this.sprite.visible = this.sprite.alpha !== 0;
    if (!this.running) {
      return;
    }
    this.counter += delta;
    if (this.counter > this.duration) {
      this.sprite.alpha = this.end;
      this.running = false;
    } else {
      this.sprite.alpha = lerp(
        this.start,
        this.end,
        this.counter / this.duration
      );
      if (this.start === this.end) {
        this.running = false;
      }
    }
  }
}
