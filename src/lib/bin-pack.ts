import type { Part, StockSheet, PackedSheet, Placement } from "@/templates/types";

const KERF = 0.125; // 1/8" saw blade width

const DEFAULT_SHEET: StockSheet = {
  width: 48,
  height: 96,
  material: "",
};

interface Rect {
  part: Part;
  instanceIndex: number;
  w: number;
  h: number;
}

// A skyline segment: a horizontal span at a given height
interface Segment {
  x: number;
  width: number;
  y: number; // top of this segment (how high stuff is stacked here)
}

export function packSheets(
  parts: Part[],
  sheetWidth: number = DEFAULT_SHEET.width,
  sheetHeight: number = DEFAULT_SHEET.height,
): PackedSheet[] {
  // Group parts by material
  const groups = new Map<string, Rect[]>();

  for (const part of parts) {
    for (let i = 0; i < part.quantity; i++) {
      const rawW = part.width + KERF;
      const rawH = part.length + KERF;
      // Keep original orientation -- we'll try both when placing
      groups.set(part.material, groups.get(part.material) || []);
      groups.get(part.material)!.push({
        part,
        instanceIndex: i,
        w: rawW,
        h: rawH,
      });
    }
  }

  const allSheets: PackedSheet[] = [];

  for (const [material, rects] of groups) {
    // Sort by area descending (largest pieces first)
    rects.sort((a, b) => b.w * b.h - a.w * a.h);

    const sheet: StockSheet = { width: sheetWidth, height: sheetHeight, material };
    let skyline: Segment[] = [{ x: 0, width: sheetWidth, y: 0 }];
    let placements: Placement[] = [];

    const startNewSheet = () => {
      if (placements.length > 0) {
        allSheets.push(finalizeSheet(sheet, placements));
      }
      skyline = [{ x: 0, width: sheetWidth, y: 0 }];
      placements = [];
    };

    for (const rect of rects) {
      const result = tryPlace(skyline, rect, sheetWidth, sheetHeight);

      if (result) {
        placements.push(result.placement);
        skyline = result.skyline;
      } else {
        // Can't fit on current sheet, start a new one
        startNewSheet();
        const retry = tryPlace(skyline, rect, sheetWidth, sheetHeight);
        if (retry) {
          placements.push(retry.placement);
          skyline = retry.skyline;
        }
        // If it still doesn't fit, the part is larger than the sheet -- skip it
      }
    }

    if (placements.length > 0) {
      allSheets.push(finalizeSheet(sheet, placements));
    }
  }

  return allSheets;
}

function tryPlace(
  skyline: Segment[],
  rect: Rect,
  sheetWidth: number,
  sheetHeight: number,
): { placement: Placement; skyline: Segment[] } | null {
  // Try both orientations, pick the one with the lowest placement
  const orientations: [number, number, boolean][] = [
    [rect.w, rect.h, false],
    [rect.h, rect.w, true],
  ];

  let best: { x: number; y: number; pw: number; ph: number; rotated: boolean } | null = null;

  for (const [pw, ph, rotated] of orientations) {
    if (pw > sheetWidth || ph > sheetHeight) continue;

    const pos = findBestPosition(skyline, pw, ph, sheetWidth, sheetHeight);
    if (pos && (!best || pos.y < best.y || (pos.y === best.y && pos.x < best.x))) {
      best = { x: pos.x, y: pos.y, pw, ph, rotated };
    }
  }

  if (!best) return null;

  const placement: Placement = {
    part: rect.part,
    instanceIndex: rect.instanceIndex,
    x: best.x,
    y: best.y,
    placedWidth: best.pw,
    placedHeight: best.ph,
    rotated: best.rotated,
  };

  const newSkyline = updateSkyline(skyline, best.x, best.pw, best.y + best.ph);

  return { placement, skyline: newSkyline };
}

// Find the lowest position on the skyline where a rect of (w x h) fits
function findBestPosition(
  skyline: Segment[],
  w: number,
  h: number,
  sheetWidth: number,
  sheetHeight: number,
): { x: number; y: number } | null {
  let bestX = -1;
  let bestY = Infinity;

  // Try placing the rect starting at each segment's x position
  for (let i = 0; i < skyline.length; i++) {
    const startX = skyline[i].x;
    if (startX + w > sheetWidth + 0.001) continue;

    // Find the max height across all segments this rect would span
    let maxY = 0;
    let coveredWidth = 0;
    let valid = true;

    for (let j = i; j < skyline.length && coveredWidth < w; j++) {
      const seg = skyline[j];
      maxY = Math.max(maxY, seg.y);

      if (maxY + h > sheetHeight + 0.001) {
        valid = false;
        break;
      }

      const segEnd = seg.x + seg.width;
      const rectEnd = startX + w;
      coveredWidth = Math.min(segEnd, rectEnd) - startX;
    }

    if (valid && coveredWidth >= w - 0.001 && maxY + h <= sheetHeight + 0.001) {
      if (maxY < bestY || (maxY === bestY && startX < bestX)) {
        bestY = maxY;
        bestX = startX;
      }
    }
  }

  if (bestX < 0) return null;
  return { x: bestX, y: bestY };
}

// Update the skyline after placing a rect at (x, newY) with width w
function updateSkyline(skyline: Segment[], x: number, w: number, newY: number): Segment[] {
  const result: Segment[] = [];
  const rectEnd = x + w;

  for (const seg of skyline) {
    const segEnd = seg.x + seg.width;

    if (segEnd <= x + 0.001 || seg.x >= rectEnd - 0.001) {
      // Segment is entirely outside the rect
      result.push(seg);
    } else {
      // Segment overlaps with the rect -- split it
      // Part before the rect
      if (seg.x < x - 0.001) {
        result.push({ x: seg.x, width: x - seg.x, y: seg.y });
      }
      // The rect's segment (at the new height)
      const overlapStart = Math.max(seg.x, x);
      const overlapEnd = Math.min(segEnd, rectEnd);
      result.push({ x: overlapStart, width: overlapEnd - overlapStart, y: newY });
      // Part after the rect
      if (segEnd > rectEnd + 0.001) {
        result.push({ x: rectEnd, width: segEnd - rectEnd, y: seg.y });
      }
    }
  }

  // Merge adjacent segments at the same height
  const merged: Segment[] = [result[0]];
  for (let i = 1; i < result.length; i++) {
    const prev = merged[merged.length - 1];
    if (Math.abs(prev.y - result[i].y) < 0.001 &&
        Math.abs((prev.x + prev.width) - result[i].x) < 0.001) {
      prev.width += result[i].width;
    } else {
      merged.push(result[i]);
    }
  }

  return merged;
}

function finalizeSheet(sheet: StockSheet, placements: Placement[]): PackedSheet {
  const sheetArea = sheet.width * sheet.height;
  const usedArea = placements.reduce(
    (sum, p) => sum + p.placedWidth * p.placedHeight,
    0
  );
  const wastePercent = ((sheetArea - usedArea) / sheetArea) * 100;

  return {
    sheet: { ...sheet },
    placements: [...placements],
    wastePercent,
  };
}
