import type { Template, InputField } from "../types";
import { WallPanelInputs, wallPanelDefaults } from "./defaults";
import { generateParts } from "./parts";
import { generateAssembly } from "./assembly";

const inputSchema: InputField[] = [
  {
    key: "width",
    label: "Total Width",
    type: "number",
    min: 24,
    max: 240,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "height",
    label: "Height",
    type: "number",
    min: 48,
    max: 120,
    step: 0.25,
    unit: '"',
    group: "Dimensions",
  },
  {
    key: "panelCount",
    label: "Panel Sections",
    type: "number",
    min: 1,
    max: 6,
    step: 1,
    group: "Dimensions",
  },
  {
    key: "frameWidth",
    label: "Frame Stock",
    type: "select",
    options: [
      { value: "1.5", label: '2x2 (1-1/2")' },
      { value: "2", label: '2x3 (2")' },
    ],
    group: "Structure",
  },
  {
    key: "skinMaterial",
    label: "Skin Material",
    type: "select",
    options: [
      { value: "lam-ply", label: "Laminated Plywood" },
      { value: "mdf", label: "MDF" },
      { value: "sintra", label: "Sintra PVC" },
    ],
    group: "Structure",
  },
  {
    key: "skinThickness",
    label: "Skin Thickness",
    type: "number",
    min: 0.125,
    max: 0.5,
    step: 0.125,
    unit: '"',
    group: "Structure",
  },
  {
    key: "monitorCutouts",
    label: "Monitor Cutouts",
    type: "number",
    min: 0,
    max: 4,
    step: 1,
    group: "Features",
  },
  {
    key: "monitorWidth",
    label: "Monitor Width",
    type: "number",
    min: 14,
    max: 65,
    step: 1,
    unit: '"',
    group: "Features",
  },
  {
    key: "monitorHeight",
    label: "Monitor Height",
    type: "number",
    min: 8,
    max: 40,
    step: 1,
    unit: '"',
    group: "Features",
  },
  {
    key: "shelfCleats",
    label: "Shelf Cleats",
    type: "number",
    min: 0,
    max: 8,
    step: 1,
    group: "Features",
  },
];

export const wallPanelTemplate: Template<WallPanelInputs> = {
  id: "wall-panel",
  name: "Wall Panel / Backdrop",
  description:
    "Freestanding backdrop wall with optional monitor cutouts and shelf cleats",
  defaultInputs: wallPanelDefaults,
  inputSchema,
  generateParts,
  generateAssembly,
};
