export interface SlotDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  gameViewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  slots: SlotDefinition[];
}