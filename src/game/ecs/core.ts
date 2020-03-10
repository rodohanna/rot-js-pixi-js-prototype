export enum ComponentType {
  Render,
  Position,
  Input,
  Camera,
  PositionAnimate,
  FOV,
  WantsToActOnEntity
}

export interface Component {
  type: ComponentType;
  data: Record<string, any>;
}

export class Entity {
  components: Component[];
  componentFlags: number;
  index = -1;
  constructor(components?: Component[]) {
    this.components = components || [];
    this.componentFlags = 0;
    for (const component of this.components) {
      this.componentFlags |= 1 << component.type;
    }
  }
  addComponent(component: Component): void {
    this.components.push(component);
    this.componentFlags |= 1 << component.type;
  }
  removeComponent(type: ComponentType) {
    const index = this.components.findIndex(
      component => component.type === type
    );
    if (index !== -1) {
      this.components.splice(index, 1);
      this.componentFlags &= ~(1 << type);
    }
  }
  has(typeFlags: number): boolean {
    return (this.componentFlags & typeFlags) === typeFlags;
  }
  get(type: ComponentType): Component | undefined {
    return this.components.find(component => component.type === type);
  }
}
