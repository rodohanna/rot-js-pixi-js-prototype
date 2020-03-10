import { Entity, System } from "../ecs";
import { Input } from "../input";

export class Context {
  camera: Rect;
  map: Record<CoordKey, EntityIndex[]> = {};
  visibleCoords: Record<CoordKey, number> = {};
  entities: Record<EntityIndex, Entity> = {};
  input = new Input();
  delta = 0;
  private entityIndex = 0;
  constructor(opts: ContextOpts) {
    this.camera = opts.camera;
  }
  moveEntity(eIndex: EntityIndex, from: CoordKey, to: CoordKey) {
    const indexPosition = this.map[from].findIndex(index => index === eIndex);
    if (indexPosition !== -1 && this.entities[eIndex]) {
      if (this.map[to].length > 0) {
        console.warn(
          `Attempted to move an entity to an occupied tile: [${eIndex}] ${from} -> ${to}`,
          this.entities[eIndex]
        );
      }
      this.map[from].splice(indexPosition, 1);
      this.map[to].push(eIndex);
    }
  }
  removeEntity(eIndex: EntityIndex, where: CoordKey): void {
    const indexPosition = this.map[where].findIndex(index => index === eIndex);
    if (indexPosition !== -1 && this.entities[eIndex]) {
      this.map[where].splice(indexPosition, 1);
      delete this.entities[eIndex];
    }
  }
  addEntity(entity: Entity, where: CoordKey): void {
    ++this.entityIndex;
    if (this.map[where] && !this.entities[this.entityIndex]) {
      this.entities[this.entityIndex] = entity;
      this.map[where].push(this.entityIndex);
      entity.index = this.entityIndex;
    }
  }
  getEntitiesAt(where: CoordKey): Entity[] | undefined {
    return this.map[where]?.map(index => this.entities[index]);
  }
  processEntities(systems: System[]): void {
    for (const e of Object.values(this.entities)) {
      for (const system of systems) {
        system.act(e, this);
      }
    }
  }
  findFreeGridCell(): CoordKey | undefined {
    for (const [coordKey, entityIndexes] of Object.entries(this.map)) {
      if (entityIndexes.length === 0) {
        return coordKey;
      }
    }
  }
}
