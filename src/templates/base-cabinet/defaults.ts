export interface BaseCabinetInputs {
  width: number;
  height: number;
  depth: number;
  shelfCount: number;
  doorStyle: "slab" | "shaker";
  construction: "faceframe" | "frameless";
  doorCount: 1 | 2 | 4;
  materialThickness: number;
  backThickness: number;
}

export const baseCabinetDefaults: BaseCabinetInputs = {
  width: 39,
  height: 38,
  depth: 24,
  shelfCount: 1,
  doorStyle: "slab",
  construction: "frameless",
  doorCount: 2,
  materialThickness: 0.75,
  backThickness: 0.375,
};
