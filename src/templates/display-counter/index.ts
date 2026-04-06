import type { Template, InputField } from "../types";
import { DisplayCounterInputs, displayCounterDefaults } from "./defaults";
import { generateParts } from "./parts";
import { generateAssembly } from "./assembly";

const inputSchema: InputField[] = [
  {
    key: "width",
    label: "Width",
    type: "number",
    min: 24,
    max: 96,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "height",
    label: "Height",
    type: "number",
    min: 30,
    max: 48,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "depth",
    label: "Depth",
    type: "number",
    min: 12,
    max: 36,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "counterOverhang",
    label: "Counter Overhang",
    type: "number",
    min: 0,
    max: 3,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "frontPanel",
    label: "Front Panel",
    type: "select",
    options: [
      { value: "graphic", label: "Graphic Wrap" },
      { value: "laminate", label: "Laminate" },
    ],
    group: "Options",
  },
  {
    key: "backStyle",
    label: "Back",
    type: "select",
    options: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
    group: "Options",
  },
  {
    key: "shelfCount",
    label: "Internal Shelves",
    type: "number",
    min: 0,
    max: 3,
    step: 1,
    group: "Options",
  },
  {
    key: "hasdoor",
    label: "Access Door",
    type: "select",
    options: [
      { value: "no", label: "None" },
      { value: "yes", label: "Locking Door" },
    ],
    group: "Options",
  },
  {
    key: "materialThickness",
    label: "Material Thickness",
    type: "number",
    min: 0.5,
    max: 0.75,
    step: 0.25,
    unit: '"',
    group: "Material",
  },
];

export const displayCounterTemplate: Template<DisplayCounterInputs> = {
  id: "display-counter",
  name: "Display Counter",
  description:
    "Tradeshow reception or product display counter with optional graphic wrap",
  defaultInputs: displayCounterDefaults,
  inputSchema,
  generateParts,
  generateAssembly,
};
