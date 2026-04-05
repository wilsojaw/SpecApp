"use client";

import { useState, useEffect } from "react";
import { useSpec } from "@/context/SpecContext";
import { formatDimension, formatInches } from "@/lib/units";
import type { PackedSheet, Placement } from "@/templates/types";

const SCALE = 6; // pixels per inch
const PADDING = 24;

// Thresholds for inline labels
const LABEL_MIN_W = 50;
const LABEL_MIN_H = 30;
const DIM_MIN_W = 70;
const DIM_MIN_H = 45;

// Color palette for different parts
const COLOR_PALETTE = [
  { fill: "#dbeafe", stroke: "#3b82f6" }, // blue
  { fill: "#dcfce7", stroke: "#22c55e" }, // green
  { fill: "#fef3c7", stroke: "#f59e0b" }, // amber
  { fill: "#fce7f3", stroke: "#ec4899" }, // pink
  { fill: "#e0e7ff", stroke: "#6366f1" }, // indigo
  { fill: "#f3e8ff", stroke: "#a855f7" }, // purple
  { fill: "#ccfbf1", stroke: "#14b8a6" }, // teal
  { fill: "#ffe4e6", stroke: "#f43f5e" }, // rose
];

function buildColorMap(placements: Placement[]) {
  const map: Record<string, { fill: string; stroke: string }> = {};
  let idx = 0;
  for (const p of placements) {
    if (!map[p.part.id]) {
      map[p.part.id] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      idx++;
    }
  }
  return map;
}

interface LegendEntry {
  refNum: number;
  name: string;
  instance: string;
  dimension: string;
  color: { fill: string; stroke: string };
}

function SheetSVG({
  packed,
  index,
  total,
  highlightedPartId,
}: {
  packed: PackedSheet;
  index: number;
  total: number;
  highlightedPartId: string | null;
}) {
  const sheetW = packed.sheet.width * SCALE;
  const sheetH = packed.sheet.height * SCALE;
  const svgW = sheetW + PADDING * 2;
  const svgH = sheetH + PADDING * 2;

  const colorMap = buildColorMap(packed.placements);
  const legendEntries: LegendEntry[] = [];
  let refCounter = 1;

  // Pre-calculate which placements need legend entries
  const placementRefs: (number | null)[] = packed.placements.map((p) => {
    const pw = p.placedWidth * SCALE;
    const ph = p.placedHeight * SCALE;
    const canShowLabel = pw >= LABEL_MIN_W && ph >= LABEL_MIN_H;

    if (!canShowLabel) {
      const displayW = p.rotated ? p.part.length : p.part.width;
      const displayH = p.rotated ? p.part.width : p.part.length;
      const num = refCounter++;
      legendEntries.push({
        refNum: num,
        name: p.part.name,
        instance:
          p.part.quantity > 1 ? ` #${p.instanceIndex + 1}` : "",
        dimension: formatDimension(displayH, displayW),
        color: colorMap[p.part.id],
      });
      return num;
    }
    return null;
  });

  return (
    <div id={`cutting-sheet-${index}`} className="flex flex-col gap-2 scroll-mt-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-slate-700">
          Sheet {index + 1} of {total}
          <span className="font-normal text-slate-500 ml-2">
            {packed.sheet.material}
          </span>
        </h4>
        <span className="text-xs font-mono text-slate-500">
          {packed.wastePercent.toFixed(1)}% waste
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-2xl border border-slate-200 rounded-md bg-white"
        style={{ aspectRatio: `${svgW} / ${svgH}` }}
      >
        {/* Hatch pattern for background */}
        <defs>
          <pattern
            id={`hatch-${index}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Sheet background */}
        <rect
          x={PADDING}
          y={PADDING}
          width={sheetW}
          height={sheetH}
          fill={`url(#hatch-${index})`}
          stroke="#94a3b8"
          strokeWidth="2"
          rx="2"
        />

        {/* Sheet dimensions label */}
        <text
          x={PADDING + sheetW / 2}
          y={PADDING - 8}
          textAnchor="middle"
          className="text-[10px] fill-slate-400 font-mono"
        >
          {formatInches(packed.sheet.width)} x {formatInches(packed.sheet.height)}
        </text>

        {/* Placed parts */}
        {packed.placements.map((p, i) => (
          <PlacedPart
            key={i}
            placement={p}
            color={colorMap[p.part.id]}
            refNum={placementRefs[i]}
            highlighted={p.part.id === highlightedPartId}
          />
        ))}
      </svg>

      {/* Legend for parts too small for inline labels */}
      {legendEntries.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {legendEntries.map((entry) => (
            <div key={entry.refNum} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: entry.color.stroke }}
              >
                {entry.refNum}
              </span>
              <span className="text-slate-700 font-medium">
                {entry.name}{entry.instance}
              </span>
              <span className="text-slate-400 font-mono">
                {entry.dimension}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlacedPart({
  placement,
  color,
  refNum,
  highlighted,
}: {
  placement: Placement;
  color: { fill: string; stroke: string };
  refNum: number | null;
  highlighted: boolean;
}) {
  const { part, x, y, placedWidth, placedHeight } = placement;

  const px = PADDING + x * SCALE;
  const py = PADDING + y * SCALE;
  const pw = placedWidth * SCALE;
  const ph = placedHeight * SCALE;

  const displayW = placement.rotated ? part.length : part.width;
  const displayH = placement.rotated ? part.width : part.length;

  const canShowLabel = pw >= LABEL_MIN_W && ph >= LABEL_MIN_H;
  const canShowDim = pw >= DIM_MIN_W && ph >= DIM_MIN_H;

  return (
    <g className={highlighted ? "part-highlight" : ""}>
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill={highlighted ? "#fbbf24" : color.fill}
        stroke={highlighted ? "#d97706" : color.stroke}
        strokeWidth={highlighted ? 2.5 : 1.5}
        rx="1"
      />

      {canShowLabel ? (
        <>
          <text
            x={px + pw / 2}
            y={py + ph / 2 - (canShowDim ? 6 : 0)}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[9px] fill-slate-700 font-sans font-medium"
            style={{ pointerEvents: "none" }}
          >
            {part.name}
            {part.quantity > 1 ? ` #${placement.instanceIndex + 1}` : ""}
          </text>
          {canShowDim && (
            <text
              x={px + pw / 2}
              y={py + ph / 2 + 8}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[8px] fill-slate-500 font-mono"
              style={{ pointerEvents: "none" }}
            >
              {formatDimension(displayH, displayW)}
            </text>
          )}
        </>
      ) : (
        /* Numbered reference for small parts */
        <>
          <circle
            cx={px + pw / 2}
            cy={py + ph / 2}
            r={Math.min(pw, ph) * 0.35}
            fill={color.stroke}
            opacity="0.9"
          />
          <text
            x={px + pw / 2}
            y={py + ph / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[8px] fill-white font-bold"
            style={{ pointerEvents: "none" }}
          >
            {refNum}
          </text>
        </>
      )}
    </g>
  );
}

function SheetSizeInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        const raw = e.target.value;
        if (/^\d*\.?\d*$/.test(raw)) {
          setDraft(raw);
          const num = parseFloat(raw);
          if (!isNaN(num) && num > 0) onCommit(num);
        }
      }}
      onBlur={() => {
        setFocused(false);
        const num = parseFloat(draft);
        if (isNaN(num) || num <= 0) {
          setDraft(String(value));
        } else {
          onCommit(num);
          setDraft(String(num));
        }
      }}
      className="w-14 h-7 rounded border border-slate-300 bg-white px-1.5 text-xs text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

export function SheetLayoutDiagram() {
  const { state, highlightedPartId, setSheetSize } = useSpec();
  const { packedSheets, sheetSize } = state;

  if (packedSheets.length === 0) return null;

  return (
    <div id="cutting-layout" className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden scroll-mt-4">
      <div className="px-5 py-3 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Cutting Layout
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimized layout with 1/8&quot; kerf allowance
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-slate-500">Sheet</span>
            <SheetSizeInput
              value={sheetSize.width}
              onCommit={(w) => setSheetSize({ ...sheetSize, width: w })}
            />
            <span className="text-xs text-slate-400">&times;</span>
            <SheetSizeInput
              value={sheetSize.height}
              onCommit={(h) => setSheetSize({ ...sheetSize, height: h })}
            />
            <span className="text-xs text-slate-400 font-mono">&quot;</span>
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-6">
        {packedSheets.map((packed, i) => (
          <SheetSVG
            key={i}
            packed={packed}
            index={i}
            total={packedSheets.length}
            highlightedPartId={highlightedPartId}
          />
        ))}
      </div>
    </div>
  );
}
