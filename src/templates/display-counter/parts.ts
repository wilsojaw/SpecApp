import type { Part } from "../types";
import type { DisplayCounterInputs } from "./defaults";

const KICK_HEIGHT = 3.5;
const NAILER_WIDTH = 3;
const DOOR_REVEAL = 1 / 8;

export function generateParts(inputs: DisplayCounterInputs): Part[] {
  const {
    width,
    height,
    depth,
    counterOverhang,
    backStyle,
    frontPanel,
    shelfCount,
    hasdoor,
    materialThickness,
  } = inputs;

  const t = materialThickness;
  const mat = `${formatThick(t)} Plywood`;
  const caseHeight = height - KICK_HEIGHT;
  const caseInnerWidth = width - 2 * t;
  const parts: Part[] = [];

  // Side panels
  parts.push({
    id: "side-panel",
    name: "Side Panel",
    quantity: 2,
    length: caseHeight,
    width: depth,
    thickness: t,
    material: mat,
  });

  // Bottom panel
  parts.push({
    id: "bottom-panel",
    name: "Bottom Panel",
    quantity: 1,
    length: caseInnerWidth,
    width: depth,
    thickness: t,
    material: mat,
  });

  // Top nailer (front)
  parts.push({
    id: "top-nailer-front",
    name: "Top Nailer (Front)",
    quantity: 1,
    length: caseInnerWidth,
    width: NAILER_WIDTH,
    thickness: t,
    material: mat,
    notes: "Flush with top, behind front panel",
  });

  // Top nailer (back)
  parts.push({
    id: "top-nailer-back",
    name: "Top Nailer (Back)",
    quantity: 1,
    length: caseInnerWidth,
    width: NAILER_WIDTH,
    thickness: t,
    material: mat,
    notes: "Flush with top, at back edge",
  });

  // Counter top
  parts.push({
    id: "counter-top",
    name: "Counter Top",
    quantity: 1,
    length: width + 2 * counterOverhang,
    width: depth + counterOverhang,
    thickness: t,
    material: mat,
    notes: `${counterOverhang}" overhang on sides and front`,
  });

  // Front panel
  parts.push({
    id: "front-panel",
    name: "Front Panel",
    quantity: 1,
    length: caseHeight,
    width: width,
    thickness: frontPanel === "graphic" ? 0.125 : t,
    material: frontPanel === "graphic" ? "Graphic substrate (1/8\" sintra or foam)" : mat,
    notes:
      frontPanel === "graphic"
        ? "Printed graphic wrap, adhered to case front"
        : "Laminated finish panel",
  });

  // Back panel (if closed)
  if (backStyle === "closed") {
    parts.push({
      id: "back-panel",
      name: "Back Panel",
      quantity: 1,
      length: caseHeight,
      width: width,
      thickness: 0.25,
      material: '1/4" Plywood',
      notes: "Stapled into rabbet or flush-mounted",
    });
  }

  // Internal shelves
  if (shelfCount > 0) {
    parts.push({
      id: "shelf",
      name: "Internal Shelf",
      quantity: shelfCount,
      length: caseInnerWidth - 1 / 16,
      width: depth - 0.75,
      thickness: t,
      material: mat,
      notes: "Adjustable on shelf pins",
    });
  }

  // Kick plate
  parts.push({
    id: "kick-plate",
    name: "Kick Plate",
    quantity: 1,
    length: caseInnerWidth,
    width: KICK_HEIGHT,
    thickness: t,
    material: mat,
    notes: "Recessed 2\" from front face",
  });

  // Door (optional)
  if (hasdoor === "yes") {
    const doorHeight = caseHeight - DOOR_REVEAL;
    const doorWidth = caseInnerWidth + 2 * 0.5 - DOOR_REVEAL;

    parts.push({
      id: "door",
      name: "Access Door",
      quantity: 1,
      length: doorHeight,
      width: doorWidth,
      thickness: t,
      material: mat,
      notes: "Rear-mounted with locking latch for shipping",
    });
  }

  return parts;
}

function formatThick(t: number): string {
  if (t === 0.75) return '3/4"';
  if (t === 0.5) return '1/2"';
  if (t === 0.25) return '1/4"';
  return `${t}"`;
}
