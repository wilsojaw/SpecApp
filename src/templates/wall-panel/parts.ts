import type { Part } from "../types";
import type { WallPanelInputs } from "./defaults";

const FRAME_CROSSMEMBER_SPACING = 24;
const CLEAT_HEIGHT = 1.5;

export function generateParts(inputs: WallPanelInputs): Part[] {
  const {
    width,
    height,
    panelCount,
    frameWidth,
    skinThickness,
    skinMaterial,
    monitorCutouts,
    monitorWidth,
    monitorHeight,
    shelfCleats,
  } = inputs;

  // Per-panel dimensions
  const panelWidth = width / panelCount;
  const parts: Part[] = [];

  const frameMat =
    frameWidth === 1.5 ? '2x2 lumber (actual 1-1/2")' : '2x3 lumber (actual 2")';
  const skinMat =
    skinMaterial === "lam-ply"
      ? `${formatThick(skinThickness)} Lam Plywood`
      : skinMaterial === "mdf"
        ? `${formatThick(skinThickness)} MDF`
        : `${formatThick(skinThickness)} Sintra PVC`;

  // --- Frame parts (per panel, multiplied by panelCount) ---

  // Vertical stiles (2 per panel)
  parts.push({
    id: "frame-stile",
    name: "Frame Stile",
    quantity: 2 * panelCount,
    length: height,
    width: frameWidth,
    thickness: frameWidth,
    material: frameMat,
    notes: "Full-height vertical frame members",
  });

  // Top & bottom rails (2 per panel)
  const railLength = panelWidth - 2 * frameWidth;
  parts.push({
    id: "frame-rail",
    name: "Frame Rail",
    quantity: 2 * panelCount,
    length: railLength,
    width: frameWidth,
    thickness: frameWidth,
    material: frameMat,
    notes: "Top and bottom horizontal members",
  });

  // Cross members (horizontal braces spaced every ~24")
  const crossCount = Math.max(0, Math.floor(height / FRAME_CROSSMEMBER_SPACING) - 1);
  if (crossCount > 0) {
    parts.push({
      id: "frame-cross",
      name: "Frame Cross Member",
      quantity: crossCount * panelCount,
      length: railLength,
      width: frameWidth,
      thickness: frameWidth,
      material: frameMat,
      notes: `Spaced ~${FRAME_CROSSMEMBER_SPACING}" apart for rigidity`,
    });
  }

  // --- Skin panels ---

  // Front skin (1 per panel)
  parts.push({
    id: "front-skin",
    name: "Front Skin",
    quantity: panelCount,
    length: height,
    width: panelWidth,
    thickness: skinThickness,
    material: skinMat,
    notes: "Visible face — finish side out",
  });

  // Back skin (1 per panel)
  parts.push({
    id: "back-skin",
    name: "Back Skin",
    quantity: panelCount,
    length: height,
    width: panelWidth,
    thickness: skinThickness,
    material: skinMat,
    notes: "Back face — can be unfinished if against wall",
  });

  // --- Monitor cutout backer (if applicable) ---
  if (monitorCutouts > 0) {
    // Backer cleat — horizontal supports above and below cutout
    parts.push({
      id: "monitor-cleat",
      name: "Monitor Mount Cleat",
      quantity: monitorCutouts * 2,
      length: monitorWidth + 4,
      width: frameWidth,
      thickness: frameWidth,
      material: frameMat,
      notes: `Horizontal cleats framing ${monitorWidth}" x ${monitorHeight}" cutout`,
    });

    // Monitor backer plate (for VESA mount)
    parts.push({
      id: "monitor-backer",
      name: "Monitor Backer Plate",
      quantity: monitorCutouts,
      length: monitorHeight + 4,
      width: monitorWidth + 4,
      thickness: 0.75,
      material: '3/4" Plywood',
      notes: "VESA mount attaches here — secure to frame cleats",
    });
  }

  // --- Shelf cleats ---
  if (shelfCleats > 0) {
    parts.push({
      id: "shelf-cleat",
      name: "Shelf Cleat",
      quantity: shelfCleats,
      length: panelWidth - 2,
      width: CLEAT_HEIGHT,
      thickness: 0.75,
      material: '3/4" Plywood',
      notes: "French cleat or L-bracket shelf support",
    });
  }

  // --- Base feet / levelers plate ---
  parts.push({
    id: "base-plate",
    name: "Base Plate",
    quantity: panelCount,
    length: panelWidth - 4,
    width: frameWidth * 2 + 2,
    thickness: 0.75,
    material: '3/4" Plywood',
    notes: "Floor plate for leveler feet — recessed 2\" from edges",
  });

  return parts;
}

function formatThick(t: number): string {
  if (t === 0.75) return '3/4"';
  if (t === 0.5) return '1/2"';
  if (t === 0.375) return '3/8"';
  if (t === 0.25) return '1/4"';
  if (t === 0.125) return '1/8"';
  return `${t}"`;
}
