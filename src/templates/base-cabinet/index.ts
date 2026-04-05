import type { Template, InputField } from "../types";
import { BaseCabinetInputs, baseCabinetDefaults } from "./defaults";
import { generateParts } from "./parts";
import { generateAssembly } from "./assembly";

const inputSchema: InputField[] = [
  {
    key: "width",
    label: "Width",
    type: "number",
    min: 9,
    max: 48,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "height",
    label: "Height",
    type: "number",
    min: 12,
    max: 42,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "depth",
    label: "Depth",
    type: "number",
    min: 12,
    max: 30,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "shelfCount",
    label: "Shelves",
    type: "number",
    min: 0,
    max: 6,
    step: 1,
    group: "Options",
  },
  {
    key: "doorStyle",
    label: "Door Style",
    type: "select",
    options: [
      { value: "slab", label: "Slab" },
      { value: "shaker", label: "Shaker" },
    ],
    group: "Options",
  },
  {
    key: "construction",
    label: "Construction",
    type: "select",
    options: [
      { value: "faceframe", label: "Face Frame" },
      { value: "frameless", label: "Frameless" },
    ],
    group: "Options",
  },
  {
    key: "doorCount",
    label: "Doors",
    type: "select",
    options: [
      { value: "1", label: "Single Door" },
      { value: "2", label: "Double Door" },
      { value: "4", label: "Quadruple" },
    ],
    group: "Options",
  },
  {
    key: "materialThickness",
    label: "Material Thickness",
    type: "number",
    min: 0.25,
    max: 1.5,
    step: 0.125,
    unit: '"',
    group: "Material",
  },
  {
    key: "backThickness",
    label: "Back Panel Thickness",
    type: "number",
    min: 0.25,
    max: 1,
    step: 0.125,
    unit: '"',
    group: "Material",
  },
];

export const baseCabinetTemplate: Template<BaseCabinetInputs> = {
  id: "base-cabinet",
  name: "Base Cabinet",
  description: "Standard lower kitchen/bathroom cabinet with doors and adjustable shelves",
  defaultInputs: baseCabinetDefaults,
  inputSchema,
  generateParts,
  generateAssembly,
};
