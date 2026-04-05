export interface Part {
  id: string;
  name: string;
  quantity: number;
  length: number;
  width: number;
  thickness: number;
  material: string;
  notes?: string;
}

export interface StockSheet {
  width: number;
  height: number;
  material: string;
}

export interface Placement {
  part: Part;
  instanceIndex: number;
  x: number;
  y: number;
  placedWidth: number;
  placedHeight: number;
  rotated: boolean;
}

export interface PackedSheet {
  sheet: StockSheet;
  placements: Placement[];
  wastePercent: number;
}

export interface AssemblyStep {
  order: number;
  instruction: string;
  parts: string[];
  joinery?: string;
  hardware?: string[];
}

export interface InputField {
  key: string;
  label: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
  group: string;
}

export interface Template<TInputs = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  defaultInputs: TInputs;
  inputSchema: InputField[];
  generateParts: (inputs: TInputs) => Part[];
  generateAssembly: (inputs: TInputs, parts: Part[]) => AssemblyStep[];
}
