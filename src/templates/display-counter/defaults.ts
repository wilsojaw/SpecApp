export interface DisplayCounterInputs {
  width: number;
  height: number;
  depth: number;
  counterOverhang: number;
  backStyle: "open" | "closed";
  frontPanel: "graphic" | "laminate";
  shelfCount: number;
  hasdoor: "yes" | "no";
  materialThickness: number;
}

export const displayCounterDefaults: DisplayCounterInputs = {
  width: 48,
  height: 40,
  depth: 24,
  counterOverhang: 1,
  backStyle: "open",
  frontPanel: "graphic",
  shelfCount: 1,
  hasdoor: "no",
  materialThickness: 0.75,
};
