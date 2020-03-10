declare interface V2 {
  x: number;
  y: number;
}

declare interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ContextOpts {
  camera: Rect;
}

interface Cell {
  bg: string;
  fg: string;
  char: string;
}

// a string formatted as "x,y"
declare type CoordKey = string;
declare type EntityIndex = number;

declare interface AssetMeta {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
declare interface AssetManifest {
  [filePath: string]: AssetMeta[];
}
