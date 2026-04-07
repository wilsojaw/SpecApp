import type { Part } from "../types";
import type { BaseCabinetInputs } from "./defaults";
import { formatThickness } from "@/lib/units";
import {
  TOE_KICK_HEIGHT,
  TOE_KICK_SETBACK,
  FACE_FRAME_WIDTH,
  SHELF_CLEARANCE,
  DOOR_STOP_WIDTH,
  DOOR_STOP_SETBACK,
  DOOR_REVEAL,
  OVERLAY,
  RISER_HEIGHT,
  RISER_SETBACK,
  CT_BUILDUP_HEIGHT,
  computeCaseHeight,
} from "./constants";

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
  const mat = `${formatThickness(t)} Plywood`;
  const backMat = `${formatThickness(backThickness)} Plywood`;
  const caseHeight = computeCaseHeight(height, t);
  const caseInnerWidth = width - 2 * t;
  const caseInnerHeight = caseHeight - 2 * t;

  const parts: Part[] = [];

  // Top and bottom panels run full length; sides are inset between them

  parts.push({
    id: "top-panel",
    name: "Top Panel",
    quantity: 1,
    length: width,
    width: depth,
    thickness: t,
    material: mat,
  });

  parts.push({
    id: "bottom-panel",
    name: "Bottom Panel",
    quantity: 1,
    length: width,
    width: depth,
    thickness: t,
    material: mat,
  });

  parts.push({
    id: "side-panel",
    name: "Side Panel",
    quantity: 2,
    length: caseInnerHeight,
    width: depth,
    thickness: t,
    material: mat,
    notes: "Inset between top and bottom panels, flush to edges",
  });

  parts.push({
    id: "back-panel",
    name: "Back Panel",
    quantity: 1,
    length: caseInnerHeight,
    width: width,
    thickness: backThickness,
    material: backMat,
    notes: "Inset between top and bottom for smooth/flush back",
  });

  // Toe kick platform — separate base, set back 2-1/2" all around

  const toeKickLength = width - 2 * TOE_KICK_SETBACK;
  const toeKickWidth = depth - 2 * TOE_KICK_SETBACK;

  parts.push({
    id: "toe-kick-fb",
    name: "Toe Kick Front/Back",
    quantity: 2,
    length: toeKickLength,
    width: TOE_KICK_HEIGHT,
    thickness: t,
    material: mat,
  });

  parts.push({
    id: "toe-kick-side",
    name: "Toe Kick Side",
    quantity: 2,
    length: toeKickWidth - 2 * t,
    width: TOE_KICK_HEIGHT,
    thickness: t,
    material: mat,
  });

  // Door stops (frameless only — face frame acts as stop)

  if (construction === "frameless") {
    parts.push({
      id: "door-stop",
      name: "Door Stop",
      quantity: 2,
      length: caseInnerHeight,
      width: DOOR_STOP_WIDTH,
      thickness: t,
      material: mat,
      notes: `Set back ${formatThickness(DOOR_STOP_SETBACK)}" from front edge`,
    });
  }

  if (shelfCount > 0) {
    const shelfDepth =
      construction === "frameless"
        ? depth - DOOR_STOP_WIDTH - backThickness
        : depth - backThickness - t;

    parts.push({
      id: "shelf",
      name: "Adjustable Shelf",
      quantity: shelfCount,
      length: caseInnerWidth - SHELF_CLEARANCE,
      width: shelfDepth,
      thickness: t,
      material: mat,
    });
  }

  if (construction === "faceframe") {
    parts.push({
      id: "ff-stile",
      name: "Face Frame Stile",
      quantity: 2,
      length: caseHeight,
      width: FACE_FRAME_WIDTH,
      thickness: t,
      material: mat,
    });

    parts.push({
      id: "ff-rail",
      name: "Face Frame Rail",
      quantity: 2,
      length: width - 2 * FACE_FRAME_WIDTH,
      width: FACE_FRAME_WIDTH,
      thickness: t,
      material: mat,
    });
  }

  // Riser frame — set back 1" from all edges, attached with screws

  parts.push({
    id: "riser-long",
    name: "Riser (Long)",
    quantity: 2,
    length: width - 2 * RISER_SETBACK,
    width: RISER_HEIGHT,
    thickness: t,
    material: mat,
    notes: 'Set back 1" from edges, attached with screws',
  });

  parts.push({
    id: "riser-short",
    name: "Riser (Short)",
    quantity: 2,
    length: depth - 2 * RISER_SETBACK - 2 * t,
    width: RISER_HEIGHT,
    thickness: t,
    material: mat,
    notes: 'Set back 1" from edges, attached with screws',
  });

  // Counter top — 3/4" slab + 3/8" build-up strips for 1-1/2" visual edge

  parts.push({
    id: "counter-top",
    name: "Counter Top",
    quantity: 1,
    length: width,
    width: depth,
    thickness: t,
    material: mat,
    notes: "Main slab, laminate covered",
  });

  parts.push({
    id: "ct-buildup-long",
    name: "CT Build-Up Strip (Long)",
    quantity: 2,
    length: width,
    width: CT_BUILDUP_HEIGHT,
    thickness: backThickness,
    material: backMat,
    notes: 'Attached under countertop edges for 1-1/2" visual thickness',
  });

  parts.push({
    id: "ct-buildup-short",
    name: "CT Build-Up Strip (Short)",
    quantity: 2,
    length: depth - 2 * backThickness,
    width: CT_BUILDUP_HEIGHT,
    thickness: backThickness,
    material: backMat,
    notes: 'Attached under countertop edges for 1-1/2" visual thickness',
  });

  parts.push(calculateDoors(inputs, caseHeight, mat));

  return parts;
}

function calculateDoors(
  inputs: BaseCabinetInputs,
  caseHeight: number,
  mat: string,
): Part {
  const { width, construction, doorCount } = inputs;

  let doorHeight: number;
  let doorWidth: number;

  if (construction === "faceframe") {
    const openingHeight = caseHeight - 2 * FACE_FRAME_WIDTH;
    const openingWidth = width - 2 * FACE_FRAME_WIDTH;
    doorHeight = openingHeight + 2 * OVERLAY - DOOR_REVEAL;
    doorWidth =
      doorCount === 1
        ? openingWidth + 2 * OVERLAY
        : (openingWidth + 2 * OVERLAY) / 2 - DOOR_REVEAL / 2;
  } else {
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
    thickness: inputs.materialThickness,
    material: mat,
    notes: inputs.doorStyle === "shaker" ? "Shaker style" : "Slab style",
  };
}
