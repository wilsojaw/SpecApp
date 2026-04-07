"use client";

import { useSpec } from "@/context/SpecContext";
import { formatInches } from "@/lib/units";
import { TOE_KICK_HEIGHT, RISER_HEIGHT, computeCaseHeight } from "@/templates/base-cabinet/constants";

export function CabinetPreview() {
  const { state } = useSpec();
  const inputs = state.inputs as {
    width: number;
    height: number;
    depth: number;
    construction: string;
    doorCount: number;
    shelfCount: number;
    doorStyle: string;
    materialThickness: number;
  };

  const isFaceFrame = inputs.construction === "faceframe";
  const doorCount = Number(inputs.doorCount);
  const shelfCount = Number(inputs.shelfCount);

  // Scale real inches to SVG pixels
  const SCALE = 7;
  const COUNTER_TOP_THICKNESS = inputs.materialThickness;
  const caseHeight = computeCaseHeight(inputs.height, inputs.materialThickness);

  const frontW = inputs.width * SCALE;
  const cabinetH = caseHeight * SCALE;
  const counterTopH = COUNTER_TOP_THICKNESS * SCALE;
  const riserH = RISER_HEIGHT * SCALE;
  const FLOAT_GAP = 40; // big gap so counter top clearly floats above
  const topPieceH = counterTopH + riserH;
  const toeKickH = TOE_KICK_HEIGHT * SCALE;
  const totalH = topPieceH + FLOAT_GAP + cabinetH + toeKickH;
  const dOffX = inputs.depth * SCALE * 0.35;
  const dOffY = -inputs.depth * SCALE * 0.25;

  // Generous margins so labels never clip
  const marginL = 120;
  const marginR = Math.max(130, dOffX + 140);
  const marginT = Math.max(70, -dOffY + 60);
  const marginB = 80;

  const svgW = marginL + frontW + marginR;
  const svgH = marginT + totalH + marginB;
  const frontX = marginL;

  // Cabinet body positioned first, then counter top floats above
  const bodyY = marginT + topPieceH + FLOAT_GAP;
  const bodyH = cabinetH;
  const cabinetBottom = bodyY + bodyH + toeKickH;
  // Counter top + riser float above with a gap
  const riserY = bodyY - FLOAT_GAP - riserH;
  const counterTopY = riserY - counterTopH;

  // Face frame in SVG space (true proportion)
  const ffW = 1.5 * SCALE;
  const ffH = 1.5 * SCALE;

  // Shaker inset scales with door size
  const shakerInset = Math.min(12, frontW * 0.04);

  // === Label layout: compute non-overlapping Y positions ===
  const LABEL_GAP = 18; // minimum pixels between label baselines
  const labelAnchorR = frontX + frontW + dOffX + 45; // right-side label x

  // Right side: separate groups for counter top area and cabinet area
  const rightLabelsTop = [
    { name: "Counter Top", anchorY: counterTopY + counterTopH / 2, dotX: frontX + frontW + dOffX + 5, dotY: counterTopY + counterTopH / 2 + dOffY / 2 },
    { name: "Riser", anchorY: riserY + riserH / 2, dotX: frontX + frontW + 5, dotY: riserY + riserH / 2 },
  ];
  spreadLabels(rightLabelsTop, LABEL_GAP);

  const rightLabels = [
    { name: "Back Panel", anchorY: bodyY + dOffY + 25, dotX: frontX + frontW + dOffX - 10, dotY: bodyY + dOffY + 20 },
    { name: "Side Panel", anchorY: bodyY + bodyH / 2 + dOffY, dotX: frontX + frontW + dOffX + 5, dotY: bodyY + bodyH / 2 + dOffY },
  ];
  spreadLabels(rightLabels, LABEL_GAP);

  // Left side: build labels, then spread
  const leftLabelsRaw: { name: string; anchorY: number; dotX: number; dotY: number }[] = [];

  if (isFaceFrame) {
    leftLabelsRaw.push({
      name: "Face Frame",
      anchorY: bodyY + bodyH * 0.25,
      dotX: frontX + ffW / 2,
      dotY: bodyY + bodyH * 0.25,
    });
  }

  leftLabelsRaw.push({
    name: doorCount > 1 ? `Doors (${doorCount})` : "Door",
    anchorY: bodyY + bodyH * 0.4,
    dotX: frontX - 5,
    dotY: bodyY + bodyH * 0.4,
  });

  if (shelfCount > 0) {
    const shelfZone = bodyH * 0.7;
    const shelfY = bodyY + bodyH * 0.15 + shelfZone / (shelfCount + 1);
    leftLabelsRaw.push({
      name: shelfCount > 1 ? `Shelves (${shelfCount})` : "Shelf",
      anchorY: shelfY,
      dotX: frontX - 5,
      dotY: shelfY,
    });
  }

  leftLabelsRaw.push({
    name: "Bottom Panel",
    anchorY: bodyY + bodyH,
    dotX: frontX - 5,
    dotY: bodyY + bodyH - 2,
  });

  spreadLabels(leftLabelsRaw, LABEL_GAP);

  const labelOffL = 40; // how far left of frontX the label text sits

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Design Preview
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {formatInches(inputs.width)} W x {formatInches(inputs.height)} H x{" "}
          {formatInches(inputs.depth)} D (total)
        </p>
      </div>
      <div className="p-4 md:p-5 flex justify-center">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full md:max-w-lg"
          style={{ aspectRatio: `${svgW} / ${svgH}` }}
        >
          <defs>
            <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
              <path d="M6,0 L0,3 L6,6" fill="none" stroke="#94a3b8" strokeWidth="1" />
            </marker>
            <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="#94a3b8" strokeWidth="1" />
            </marker>
            <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
              <path d="M0,6 L3,0 L6,6" fill="none" stroke="#94a3b8" strokeWidth="1" />
            </marker>
            <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
              <path d="M0,0 L3,6 L6,0" fill="none" stroke="#94a3b8" strokeWidth="1" />
            </marker>
            <pattern id="wood" patternUnits="userSpaceOnUse" width="200" height="8" patternTransform="rotate(-2)">
              <line x1="0" y1="0" x2="200" y2="0" stroke="#d4a96a" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1="4" x2="200" y2="4" stroke="#c99a5b" strokeWidth="0.3" opacity="0.2" />
            </pattern>
            <pattern id="wood-side" patternUnits="userSpaceOnUse" width="8" height="200" patternTransform="rotate(2)">
              <line x1="0" y1="0" x2="0" y2="200" stroke="#c49255" strokeWidth="0.5" opacity="0.3" />
              <line x1="4" y1="0" x2="4" y2="200" stroke="#b8854d" strokeWidth="0.3" opacity="0.2" />
            </pattern>
          </defs>

          {/* === COUNTER TOP + RISER (3D, floating above cabinet) === */}
          {/* Riser front face */}
          <rect x={frontX} y={riserY} width={frontW} height={riserH} fill="#d4b88a" stroke="#8b6914" strokeWidth="1" />
          {/* Riser right side */}
          <polygon points={`${frontX + frontW},${riserY} ${frontX + frontW + dOffX * 0.3},${riserY + dOffY * 0.3} ${frontX + frontW + dOffX * 0.3},${riserY + riserH + dOffY * 0.3} ${frontX + frontW},${riserY + riserH}`} fill="#c9a87c" stroke="#8b6914" strokeWidth="1" />
          {/* Counter top front face */}
          <rect x={frontX} y={counterTopY} width={frontW} height={counterTopH} fill="#b8906e" stroke="#6b4c30" strokeWidth="1.5" />
          {/* Counter top top surface */}
          <polygon points={`${frontX},${counterTopY} ${frontX + dOffX},${counterTopY + dOffY} ${frontX + frontW + dOffX},${counterTopY + dOffY} ${frontX + frontW},${counterTopY}`} fill="#a0785a" stroke="#6b4c30" strokeWidth="1.5" />
          {/* Counter top right side */}
          <polygon points={`${frontX + frontW},${counterTopY} ${frontX + frontW + dOffX},${counterTopY + dOffY} ${frontX + frontW + dOffX},${counterTopY + counterTopH + dOffY} ${frontX + frontW},${counterTopY + counterTopH}`} fill="#a0785a" stroke="#6b4c30" strokeWidth="1.5" />

          {/* === BACK PANEL === */}
          <polygon points={`${frontX + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + bodyH + dOffY} ${frontX + dOffX},${bodyY + bodyH + dOffY}`} fill="#c9a87c" stroke="#8b6914" strokeWidth="1" opacity="0.4" />

          {/* === TOP PANEL === */}
          <polygon points={`${frontX},${bodyY} ${frontX + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + dOffY} ${frontX + frontW},${bodyY}`} fill="#e8d5b0" stroke="#8b6914" strokeWidth="1.5" />
          <polygon points={`${frontX},${bodyY} ${frontX + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + dOffY} ${frontX + frontW},${bodyY}`} fill="url(#wood)" opacity="0.5" />

          {/* === RIGHT SIDE PANEL === */}
          <polygon points={`${frontX + frontW},${bodyY} ${frontX + frontW + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + bodyH + dOffY} ${frontX + frontW},${bodyY + bodyH}`} fill="#d4b88a" stroke="#8b6914" strokeWidth="1.5" />
          <polygon points={`${frontX + frontW},${bodyY} ${frontX + frontW + dOffX},${bodyY + dOffY} ${frontX + frontW + dOffX},${bodyY + bodyH + dOffY} ${frontX + frontW},${bodyY + bodyH}`} fill="url(#wood-side)" opacity="0.5" />

          {/* === FRONT FACE === */}
          <rect x={frontX} y={bodyY} width={frontW} height={bodyH} fill="#e8d5b0" stroke="#8b6914" strokeWidth="1.5" />
          <rect x={frontX} y={bodyY} width={frontW} height={bodyH} fill="url(#wood)" />

          {/* === FACE FRAME === */}
          {isFaceFrame && (
            <g>
              <rect x={frontX} y={bodyY} width={ffW} height={bodyH} fill="#d4a050" stroke="#8b6914" strokeWidth="1" />
              <rect x={frontX + frontW - ffW} y={bodyY} width={ffW} height={bodyH} fill="#d4a050" stroke="#8b6914" strokeWidth="1" />
              <rect x={frontX + ffW} y={bodyY} width={frontW - 2 * ffW} height={ffH} fill="#d4a050" stroke="#8b6914" strokeWidth="1" />
              <rect x={frontX + ffW} y={bodyY + bodyH - ffH} width={frontW - 2 * ffW} height={ffH} fill="#d4a050" stroke="#8b6914" strokeWidth="1" />
            </g>
          )}

          {/* === DOORS === */}
          {(() => {
            const doorInset = isFaceFrame ? ffW : 0;
            const doorTop = bodyY + (isFaceFrame ? ffH : 0) + 2;
            const doorAreaW = frontW - 2 * doorInset;
            const doorAreaH = bodyH - (isFaceFrame ? 2 * ffH : 0) - 4;
            const gap = 3;
            const doorW = (doorAreaW - gap * (doorCount - 1)) / doorCount;
            return Array.from({ length: doorCount }, (_, i) => {
              const dx = frontX + doorInset + i * (doorW + gap);
              const isShaker = inputs.doorStyle === "shaker";
              return (
                <g key={`door-${i}`}>
                  <rect x={dx} y={doorTop} width={doorW} height={doorAreaH} fill="#f0e0c0" stroke="#a07830" strokeWidth="1.5" rx="1" />
                  {isShaker && doorW > shakerInset * 3 && doorAreaH > shakerInset * 3 && (
                    <rect x={dx + shakerInset} y={doorTop + shakerInset} width={doorW - 2 * shakerInset} height={doorAreaH - 2 * shakerInset} fill="none" stroke="#c0a060" strokeWidth="1.5" rx="1" />
                  )}
                  <rect x={i === 0 ? dx + doorW - 14 : dx + 6} y={doorTop + doorAreaH / 2 - 12} width={4} height={24} rx="2" fill="#888" stroke="#666" strokeWidth="0.5" />
                </g>
              );
            });
          })()}

          {/* === SHELVES === */}
          {shelfCount > 0 && Array.from({ length: shelfCount }, (_, i) => {
            const shelfZone = bodyH * 0.7;
            const shelfY = bodyY + bodyH * 0.15 + (shelfZone / (shelfCount + 1)) * (i + 1);
            return <line key={`shelf-${i}`} x1={frontX + 4} y1={shelfY} x2={frontX + frontW - 4} y2={shelfY} stroke="#a08050" strokeWidth="2" strokeDasharray="4 6" opacity="0.5" />;
          })}

          {/* === TOE KICK === */}
          <rect x={frontX + 8} y={bodyY + bodyH} width={frontW - 16} height={toeKickH} fill="#5a4a3a" stroke="#3a2a1a" strokeWidth="1" rx="1" />

          {/* ========== RIGHT SIDE LABELS - counter top / riser ========== */}
          {rightLabelsTop.map((lbl) => (
            <g key={lbl.name}>
              <line x1={lbl.dotX} y1={lbl.dotY} x2={labelAnchorR - 8} y2={lbl.anchorY} stroke="#3b82f6" strokeWidth="1" />
              <circle cx={lbl.dotX} cy={lbl.dotY} r="2" fill="#3b82f6" />
              <text x={labelAnchorR} y={lbl.anchorY + 3} className="text-[10px] fill-blue-600 font-semibold font-sans">
                {lbl.name}
              </text>
            </g>
          ))}

          {/* ========== RIGHT SIDE LABELS - cabinet body ========== */}
          {rightLabels.map((lbl) => (
            <g key={lbl.name}>
              <line x1={lbl.dotX} y1={lbl.dotY} x2={labelAnchorR - 8} y2={lbl.anchorY} stroke="#3b82f6" strokeWidth="1" />
              <circle cx={lbl.dotX} cy={lbl.dotY} r="2" fill="#3b82f6" />
              <text x={labelAnchorR} y={lbl.anchorY + 3} className="text-[10px] fill-blue-600 font-semibold font-sans">
                {lbl.name}
              </text>
            </g>
          ))}

          {/* ========== LEFT SIDE LABELS (spread to avoid overlap) ========== */}
          {leftLabelsRaw.map((lbl) => (
            <g key={lbl.name}>
              <line x1={lbl.dotX} y1={lbl.dotY} x2={frontX - labelOffL + 5} y2={lbl.anchorY} stroke="#3b82f6" strokeWidth="1" />
              <circle cx={lbl.dotX} cy={lbl.dotY} r="2" fill="#3b82f6" />
              <text x={frontX - labelOffL} y={lbl.anchorY + 3} textAnchor="end" className="text-[10px] fill-blue-600 font-semibold font-sans">
                {lbl.name}
              </text>
            </g>
          ))}

          {/* Toe Kick label (bottom center) */}
          {(() => {
            const toeKickMidY = bodyY + bodyH + toeKickH / 2;
            return (
              <g>
                <line x1={frontX + frontW / 2} y1={toeKickMidY} x2={frontX + frontW / 2} y2={toeKickMidY + 25} stroke="#3b82f6" strokeWidth="1" />
                <circle cx={frontX + frontW / 2} cy={toeKickMidY} r="2" fill="#3b82f6" />
                <text x={frontX + frontW / 2} y={toeKickMidY + 38} textAnchor="middle" className="text-[10px] fill-blue-600 font-semibold font-sans">Toe Kick</text>
              </g>
            );
          })()}

          {/* ========== DIMENSION LINES ========== */}

          {/* Width */}
          <line x1={frontX} y1={cabinetBottom + 50} x2={frontX + frontW} y2={cabinetBottom + 50} stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
          <text x={frontX + frontW / 2} y={cabinetBottom + 64} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
            {formatInches(inputs.width)}
          </text>

          {/* Case Height (box only) */}
          <line x1={frontX - 65} y1={bodyY} x2={frontX - 65} y2={bodyY + bodyH + toeKickH} stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowU)" markerEnd="url(#arrowD)" />
          <text x={frontX - 68} y={bodyY + (bodyH + toeKickH) / 2} textAnchor="end" dominantBaseline="central" className="text-[10px] fill-slate-500 font-mono">
            {formatInches(caseHeight + TOE_KICK_HEIGHT)}
          </text>

          {/* Total Height (dashed, spans counter top through toe kick) */}
          <line x1={frontX - 95} y1={counterTopY - 4} x2={frontX - 95} y2={cabinetBottom} stroke="#64748b" strokeWidth="1" strokeDasharray="4 3" markerStart="url(#arrowU)" markerEnd="url(#arrowD)" />
          <text x={frontX - 98} y={(counterTopY - 4 + cabinetBottom) / 2} textAnchor="end" dominantBaseline="central" className="text-[9px] fill-slate-400 font-mono">
            {formatInches(inputs.height)}
          </text>

          {/* Depth (along counter top surface) */}
          <line x1={frontX + frontW + 4} y1={counterTopY + 4} x2={frontX + frontW + dOffX + 4} y2={counterTopY + dOffY + 4} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <text x={frontX + frontW + dOffX / 2 + 14} y={counterTopY + dOffY / 2 - 6} className="text-[10px] fill-slate-500 font-mono">
            {formatInches(inputs.depth)}
          </text>
        </svg>
      </div>
    </div>
  );
}

// Spread label Y positions so they don't overlap (minimum gap between baselines)
function spreadLabels(
  labels: { name: string; anchorY: number; dotX: number; dotY: number }[],
  minGap: number,
) {
  // Sort by desired Y position
  labels.sort((a, b) => a.anchorY - b.anchorY);

  // Push labels down if they overlap the one above
  for (let i = 1; i < labels.length; i++) {
    const prev = labels[i - 1].anchorY;
    if (labels[i].anchorY - prev < minGap) {
      labels[i].anchorY = prev + minGap;
    }
  }
}
