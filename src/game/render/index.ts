import * as PIXI from "pixi.js";
export enum Layer {
  TILE,
  ENTITY
}
export class Renderer {
  _renderer: PIXI.Renderer;
  textureMap: Record<string, PIXI.Texture> = {};
  root = new PIXI.Container();
  tileContainer = new PIXI.Container();
  entityContainer = new PIXI.Container();
  constructor(pixiRendererOptions?: object) {
    this._renderer = new PIXI.Renderer(pixiRendererOptions);
    this.root.addChild(this.tileContainer);
    this.root.addChild(this.entityContainer);
  }
  loadAssetsFromManifest(manifest: AssetManifest): void {
    for (const [filePath, metaList] of Object.entries(manifest)) {
      const baseTexture = PIXI.BaseTexture.from(filePath);
      for (const meta of metaList) {
        const { key, x, y, w, h } = meta;
        const texture = new PIXI.Texture(
          baseTexture,
          new PIXI.Rectangle(x, y, w, h)
        );
        this.textureMap[key] = texture;
      }
    }
  }
  createFromTexture(textureKey: string): PIXI.Sprite | undefined {
    if (this.textureMap[textureKey]) {
      return new PIXI.Sprite(this.textureMap[textureKey]);
    }
  }
  render(): void {
    this._renderer.render(this.root);
  }
  addToScene(sprite: PIXI.Sprite, layer: Layer): void {
    switch (layer) {
      case Layer.TILE: {
        this.tileContainer.addChild(sprite);
        break;
      }
      case Layer.ENTITY: {
        this.entityContainer.addChild(sprite);
      }
    }
  }
  removeFromScene(sprite: PIXI.Sprite, layer: Layer): void {
    switch (layer) {
      case Layer.TILE: {
        this.tileContainer.removeChild(sprite);
        break;
      }
      case Layer.ENTITY: {
        this.entityContainer.removeChild(sprite);
      }
    }
  }
  clearScene(): void {
    this.tileContainer.removeChildren();
    this.entityContainer.removeChildren();
  }
  getView(): HTMLCanvasElement {
    return this._renderer.view;
  }
}
