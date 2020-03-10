import { ComponentType, Entity } from "./core";
import {
  RenderData,
  PositionData,
  PositionAnimateData,
  PositionAnimateComponent,
  FOVData,
  WantsToActOnEntityData
} from "./creator";
import { Context } from "../context";
import { Key } from "../input";
import { lerp, setFOV } from "../util";
import * as ROT from "rot-js";

export const RENDER_SYSTEM_FLAGS =
  (1 << ComponentType.Render) | (1 << ComponentType.Position);
export const PLAYER_INPUT_SYSTEM_FLAGS =
  (1 << ComponentType.Position) |
  (1 << ComponentType.Input) |
  (1 << ComponentType.FOV);
export const CAMERA_SYSTEM_FLAGS =
  (1 << ComponentType.Camera) | (1 << ComponentType.Position);
export const POSITION_ANIMATE_SYSTEM_FLAGS =
  (1 << ComponentType.PositionAnimate) | (1 << ComponentType.Position);

export abstract class System {
  abstract act(e: Entity, c: Context): void;
}

export class PositionAnimateSystem extends System {
  act(e: Entity, c: Context): void {
    if (e.has(POSITION_ANIMATE_SYSTEM_FLAGS)) {
      const position = e.get(ComponentType.Position);
      const pAnimate = e.get(ComponentType.PositionAnimate);
      if (position && pAnimate) {
        const positionData = position.data as PositionData;
        const pAnimateData = pAnimate.data as PositionAnimateData;
        pAnimateData.counter += c.delta;
        if (pAnimateData.counter > pAnimateData.duration) {
          positionData.x = pAnimateData.end.x;
          positionData.y = pAnimateData.end.y;
          e.removeComponent(ComponentType.PositionAnimate);
        } else {
          positionData.x = lerp(
            pAnimateData.start.x,
            pAnimateData.end.x,
            pAnimateData.counter / pAnimateData.duration
          );
          positionData.y = lerp(
            pAnimateData.start.y,
            pAnimateData.end.y,
            pAnimateData.counter / pAnimateData.duration
          );
          if (
            positionData.x === pAnimateData.end.x &&
            positionData.y === pAnimateData.end.y
          ) {
            e.removeComponent(ComponentType.PositionAnimate);
          }
        }
      }
    }
  }
}

export class RenderSystem extends System {
  act(e: Entity, c: Context): void {
    const { camera } = c;
    if (e.has(RENDER_SYSTEM_FLAGS)) {
      const render = e.get(ComponentType.Render);
      const position = e.get(ComponentType.Position);
      if (render && position) {
        const renderData = render.data as RenderData;
        const positionData = position.data as PositionData;
        renderData.sprite.position.set(
          positionData.x * 32 - camera.x,
          positionData.y * 32 - camera.y
        );
      }
    }
  }
}

export class InputSystem extends System {
  act(e: Entity, c: Context): void {
    const { input } = c;
    if (e.has(PLAYER_INPUT_SYSTEM_FLAGS)) {
      const position = e.get(ComponentType.Position);
      const fov = e.get(ComponentType.FOV);
      if (position && fov) {
        const data = position.data as PositionData;
        const fovData = fov.data as FOVData;
        const { inputMap } = input;
        let lateralMovement = 0;
        let verticalMovement = 0;
        let visionRadiusChange = 0;
        if (inputMap[Key.W]) {
          --verticalMovement;
        }
        if (inputMap[Key.A]) {
          --lateralMovement;
        }
        if (inputMap[Key.S]) {
          ++verticalMovement;
        }
        if (inputMap[Key.D]) {
          ++lateralMovement;
        }
        if (inputMap[Key.Q]) {
          --visionRadiusChange;
        }
        if (inputMap[Key.E]) {
          ++visionRadiusChange;
        }
        if (inputMap[Key.F]) {
          for (const entity of c.getEntitiesAt(`${data.x},${data.y}`) || []) {
            const wantsToAct = entity.get(ComponentType.WantsToActOnEntity);
            if (wantsToAct) {
              const actData = wantsToAct.data as WantsToActOnEntityData;
              actData.act(e, c);
            }
          }
        }
        fovData.visionRadius = ROT.Util.clamp(
          fovData.visionRadius + visionRadiusChange,
          0,
          15
        );
        if (lateralMovement || verticalMovement || visionRadiusChange) {
          const pAnimate = e.get(ComponentType.PositionAnimate);
          let x = data.x;
          let y = data.y;
          if (pAnimate) {
            const pAnimateData = pAnimate.data as PositionAnimateData;
            x = pAnimateData.end.x;
            y = pAnimateData.end.y;
          }
          if (c.map[`${x + lateralMovement},${y + verticalMovement}`]) {
            e.removeComponent(ComponentType.PositionAnimate);
            e.addComponent(
              PositionAnimateComponent({
                start: { x: data.x, y: data.y },
                end: {
                  x: x + lateralMovement,
                  y: y + verticalMovement
                },
                counter: 0,
                duration: 9
              })
            );
            c.moveEntity(
              e.index,
              `${x},${y}`,
              `${x + lateralMovement},${y + verticalMovement}`
            );
            setFOV(
              x + lateralMovement,
              y + verticalMovement,
              fovData.visionRadius,
              c
            );
          }
        }
      }
    }
  }
}

export class CameraSystem extends System {
  act(e: Entity, c: Context): void {
    const { camera } = c;
    if (e.has(CAMERA_SYSTEM_FLAGS)) {
      const position = e.get(ComponentType.Position);
      if (position) {
        const positionData = position.data as PositionData;
        camera.x = positionData.x * 2 * 16 - camera.w / 2;
        camera.y = positionData.y * 2 * 16 - camera.h / 2;
      }
    }
  }
}
