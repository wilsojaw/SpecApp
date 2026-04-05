import type { Part } from "../types";
import type { BaseCabinetInputs } from "./defaults";

const TOE_KICK_HEIGHT = 4;
const FACE_FRAME_WIDTH = 1.5;
const SHELF_CLEARANCE = 1 / 16;
const SHELF_SETBACK = 0.75;
const DOOR_REVEAL = 1 / 8;
const OVERLAY = 0.5;
const RISER_HEIGHT = 1.25;

export function generateParts(inputs: BaseCabinetInputs): Part[] {
  const {
    width,
    height,
    depth,
    shelfCount,
    construction,
    doorCount,
    materialThickness,
    backThickness,
  } = inputs;

  const t = materialThickness;
  const caseHeight = height - TOE_KICK_HEIGHT;
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
    material: `${formatThick(t)} Plywood`,
  });

  // Bottom panel
  parts.push({
    id: "bottom-panel",
    name: "Bottom Panel",
    quantity: 1,
    length: caseInnerWidth,
    width: depth,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
  });

  // Top stretcher
  parts.push({
    id: "top-stretcher",
    name: "Top Stretcher",
    quantity: 1,
    length: caseInnerWidth,
    width: 4,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
  });

  // Back panel
  parts.push({
    id: "back-panel",
    name: "Back Panel",
    quantity: 1,
    length: caseHeight,
    width: width,
    thickness: backThickness,
    material: `${formatThick(backThickness)} Plywood`,
  });

  // Adjustable shelves
  if (shelfCount > 0) {
    parts.push({
      id: "shelf",
      name: "Adjustable Shelf",
      quantity: shelfCount,
      length: caseInnerWidth - SHELF_CLEARANCE,
      width: depth - SHELF_SETBACK,
      thickness: t,
      material: `${formatThick(t)} Plywood`,
    });
  }

  // Toe kick
  parts.push({
    id: "toe-kick",
    name: "Toe Kick",
    quantity: 1,
    length: caseInnerWidth,
    width: TOE_KICK_HEIGHT,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
  });

  // Face frame parts (if face frame construction)
  if (construction === "faceframe") {
    parts.push({
      id: "ff-stile",
      name: "Face Frame Stile",
      quantity: 2,
      length: caseHeight,
      width: FACE_FRAME_WIDTH,
      thickness: t,
      material: `${formatThick(t)} Plywood`,
      notes: "Vertical members",
    });

    parts.push({
      id: "ff-top-rail",
      name: "Face Frame Top Rail",
      quantity: 1,
      length: width - 2 * FACE_FRAME_WIDTH,
      width: FACE_FRAME_WIDTH,
      thickness: t,
      material: `${formatThick(t)} Plywood`,
      notes: "Horizontal member",
    });

    parts.push({
      id: "ff-bottom-rail",
      name: "Face Frame Bottom Rail",
      quantity: 1,
      length: width - 2 * FACE_FRAME_WIDTH,
      width: FACE_FRAME_WIDTH,
      thickness: t,
      material: `${formatThick(t)} Plywood`,
      notes: "Horizontal member",
    });
  }

  // Riser
  parts.push({
    id: "riser",
    name: "Riser",
    quantity: 1,
    length: width,
    width: RISER_HEIGHT,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
    notes: "Sits on top of case, under counter top",
  });

  // Counter Top
  parts.push({
    id: "counter-top",
    name: "Counter Top",
    quantity: 1,
    length: width,
    width: depth,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
    notes: "Sits on riser",
  });

  // Doors
  const doors = calculateDoors(inputs);
  parts.push(doors);

  return parts;
}

function calculateDoors(inputs: BaseCabinetInputs): Part {
  const { width, height, construction, doorCount, materialThickness } = inputs;
  const t = materialThickness;
  const caseHeight = height - TOE_KICK_HEIGHT;

  let doorHeight: number;
  let doorWidth: number;

  if (construction === "faceframe") {
    // Opening is inside the face frame
    const openingHeight = caseHeight - 2 * FACE_FRAME_WIDTH;
    const openingWidth = width - 2 * FACE_FRAME_WIDTH;
    // Door overlays the frame by OVERLAY on each side
    doorHeight = openingHeight + 2 * OVERLAY - DOOR_REVEAL;
    doorWidth =
      doorCount === 1
        ? openingWidth + 2 * OVERLAY
        : (openingWidth + 2 * OVERLAY) / 2 - DOOR_REVEAL / 2;
  } else {
    // Frameless: door covers the full cabinet face
    doorHeight = caseHeight - DOOR_REVEAL;
    doorWidth =
      doorCount === 1
        ? width - DOOR_REVEAL
        : width / 2 - DOOR_REVEAL;
  }

  return {
    id: "door",
    name: "Door",
    quantity: doorCount,
    length: doorHeight,
    width: doorWidth,
    thickness: t,
    material: `${formatThick(t)} Plywood`,
    notes: inputs.doorStyle === "shaker" ? "Shaker style" : "Slab style",
  };
}

function formatThick(t: number): string {
  if (t === 0.75) return '3/4"';
  if (t === 0.5) return '1/2"';
  if (t === 0.25) return '1/4"';
  return `${t}"`;
}
