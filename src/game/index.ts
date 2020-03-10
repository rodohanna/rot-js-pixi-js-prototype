import * as PIXI from "pixi.js";
import { Renderer, Layer } from "./render";
import * as ROT from "rot-js";
import {
  InputSystem,
  RenderSystem,
  CameraSystem,
  PositionAnimateSystem,
  Entity,
  RenderComponent,
  InputComponent,
  CameraComponent,
  PositionComponent,
  FOVComponent,
  WantsToActOnEntityComponent,
  ComponentType,
  FOVData
} from "./ecs";
import { setFOV, AlphaAnimator } from "./util";
import { Context } from "./context";
const SPRITES = {
  FLOOR: "FLOOR",
  TREE: "TREE",
  LAMP: "LAMP",
  GHOST: "GHOST"
};
interface Tile {
  sprite: PIXI.Sprite;
  worldPosition: V2;
  gridPosition: V2;
  alphaAnimator: AlphaAnimator;
}
export class Game {
  context = new Context({ camera: { x: 0, y: 0, w: 1000, h: 750 } });
  renderer: Renderer;
  tiles: Tile[] = [];
  constructor() {
    this.renderer = new Renderer({
      width: this.context.camera.w,
      height: this.context.camera.h
    });
    document.getElementById("game-root")?.appendChild(this.renderer.getView());
  }
  init(): void {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.renderer.loadAssetsFromManifest({
      "tiles.png": [
        {
          key: SPRITES.FLOOR,
          x: 170,
          y: 289,
          w: 16,
          h: 16
        },
        {
          key: SPRITES.TREE,
          x: 0,
          y: 17,
          w: 16,
          h: 16
        },
        {
          key: SPRITES.LAMP,
          x: 85,
          y: 255,
          w: 16,
          h: 16
        },
        {
          key: SPRITES.GHOST,
          x: 442,
          y: 102,
          w: 16,
          h: 16
        }
      ]
    });
    this.spawnObjects();
    this.loop();
  }
  private spawnObjects(): void {
    const digger = new ROT.Map.Digger(100, 100, {
      roomWidth: [3, 12],
      roomHeight: [3, 12],
      corridorLength: [1, 2]
    });
    const scale = 2;
    const digCallback = (x: number, y: number, value: number) => {
      if (value) {
        return;
      }
      this.context.map[`${x},${y}`] = [];
      const sprite = this.renderer.createFromTexture(SPRITES.FLOOR);
      if (sprite) {
        const tint = ROT.RNG.getItem([
          0x0074d9,
          0x7fdbff,
          0x39cccc,
          0x3d9970,
          0x2ecc40,
          0x01ff70,
          0xffdc00,
          0xff851b,
          0xff4136,
          0x85144b,
          0xf012be,
          0xb10dc9,
          0xaaaaaa,
          0xdddddd,
          0xffffff
        ]);
        if (tint) {
          sprite.tint = tint;
        }
        sprite.scale.set(scale);
        sprite.position.set(x * 16 * scale, y * 16 * scale);
        sprite.alpha = 0;
        this.tiles.push({
          sprite,
          worldPosition: { x: x * 16 * scale, y: y * 16 * scale },
          gridPosition: { x, y },
          alphaAnimator: new AlphaAnimator({
            start: 0,
            end: 0,
            duration: 250,
            sprite
          })
        });
        this.renderer.addToScene(sprite, Layer.TILE);
      }
    };
    digger.create(digCallback);
    const playerSprite = this.renderer.createFromTexture(SPRITES.GHOST);
    const playerCoord = this.context.findFreeGridCell();
    if (playerSprite && playerCoord) {
      const [x, y] = playerCoord.split(",").map(coord => parseInt(coord));
      playerSprite.alpha = 0.75;
      playerSprite.scale.set(scale);
      playerSprite.position.set(x * 16 * scale, y * 16 * scale);
      this.renderer.addToScene(playerSprite, Layer.ENTITY);
      const e = new Entity();
      const visionRadius = 0;
      e.addComponent(RenderComponent({ sprite: playerSprite }));
      e.addComponent(InputComponent());
      e.addComponent(CameraComponent());
      e.addComponent(PositionComponent({ x, y }));
      e.addComponent(FOVComponent({ visionRadius }));
      this.context.addEntity(e, playerCoord);
      setFOV(x, y, visionRadius, this.context);
    }
    const lampSprite = this.renderer.createFromTexture(SPRITES.LAMP);
    const lampCoord = this.context.findFreeGridCell();
    if (lampSprite && lampCoord) {
      const [x, y] = lampCoord.split(",").map(coord => parseInt(coord));
      lampSprite.scale.set(scale);
      lampSprite.position.set(x * 16 * scale, y * 16 * scale);
      this.renderer.addToScene(lampSprite, Layer.ENTITY);
      const lampEntity = new Entity();
      lampEntity.addComponent(RenderComponent({ sprite: lampSprite }));
      lampEntity.addComponent(PositionComponent({ x, y }));
      lampEntity.addComponent(
        WantsToActOnEntityComponent({
          act: (e: Entity, c: Context) => {
            const fov = e.get(ComponentType.FOV);
            if (fov) {
              const fovData = fov.data as FOVData;
              fovData.visionRadius += 8;
              c.removeEntity(lampEntity.index, `${x},${y}`);
              this.renderer.removeFromScene(lampSprite, Layer.ENTITY);
              setFOV(x, y, fovData.visionRadius, c);
            }
          }
        })
      );
      this.context.addEntity(lampEntity, lampCoord);
    }
  }
  private loop(): void {
    const systems = [
      new InputSystem(),
      new PositionAnimateSystem(),
      new CameraSystem(),
      new RenderSystem()
    ];
    let oldTime = Date.now();
    console.log(this.context);
    const animate = () => {
      const newTime = Date.now();
      let deltaTime = newTime - oldTime;
      oldTime = newTime;
      if (deltaTime < 0) {
        deltaTime = 0;
      }
      if (deltaTime > 1000) {
        deltaTime = 1000;
      }
      for (const tile of this.tiles) {
        const { worldPosition, gridPosition, sprite } = tile;
        const visibility = this.context.visibleCoords[
          `${gridPosition.x},${gridPosition.y}`
        ];
        if (
          visibility === undefined &&
          sprite.alpha > 0 &&
          tile.alphaAnimator.end !== 0
        ) {
          tile.alphaAnimator.restart(sprite.alpha, 0.1);
        } else if (
          visibility !== undefined &&
          visibility !== tile.alphaAnimator.end
        ) {
          tile.alphaAnimator.restart(sprite.alpha, visibility || 0);
        }
        tile.alphaAnimator.tick(deltaTime);
        sprite.position.set(
          worldPosition.x - this.context.camera.x,
          worldPosition.y - this.context.camera.y
        );
      }
      this.context.delta = (deltaTime * 60) / 1000;
      this.context.processEntities(systems);
      this.renderer.render();
      this.context.input.inputMap = {};
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}

export default new Game();
