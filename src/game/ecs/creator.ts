import * as PIXI from "pixi.js";
import { ComponentType, Component, Entity } from "./core";
import { Context } from "../context";

export interface PositionData {
  x: number;
  y: number;
}

export interface RenderData {
  sprite: PIXI.Sprite;
}

export interface PositionAnimateData {
  start: V2;
  end: V2;
  counter: number;
  duration: number;
}

export interface FOVData {
  visionRadius: number;
}

export interface WantsToActOnEntityData {
  act: (e: Entity, c: Context) => void;
}

export const PositionComponent = ({ x, y }: PositionData): Component => {
  return { type: ComponentType.Position, data: { x, y } };
};

export const RenderComponent = ({ sprite }: RenderData): Component => {
  return { type: ComponentType.Render, data: { sprite } };
};

export const InputComponent = () => {
  return { type: ComponentType.Input, data: {} };
};

export const CameraComponent = () => {
  return { type: ComponentType.Camera, data: {} };
};

export const PositionAnimateComponent = ({
  start,
  end,
  counter = 0,
  duration
}: PositionAnimateData) => {
  return {
    type: ComponentType.PositionAnimate,
    data: { start, end, counter, duration }
  };
};

export const FOVComponent = ({ visionRadius }: FOVData) => {
  return { type: ComponentType.FOV, data: { visionRadius } };
};

export const WantsToActOnEntityComponent = ({
  act
}: WantsToActOnEntityData) => {
  return { type: ComponentType.WantsToActOnEntity, data: { act } };
};
