"use client";

import { useSpec } from "@/context/SpecContext";
import { templateRegistry } from "@/templates/registry";
import { formatInches } from "@/lib/units";
import { CabinetPreview } from "./CabinetPreview";
import { PartsTable } from "./PartsTable";
import { SheetLayoutDiagram } from "./SheetLayoutDiagram";
import { AssemblyNotes } from "./AssemblyNotes";

export function CutSheet() {
  const { state } = useSpec();
  const template = templateRegistry[state.templateId];

  if (!template) return null;

  const inputs = state.inputs as Record<string, number | string>;

  return (
    <div className="flex flex-col gap-6">
      {/* Cut Sheet Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {template.name} Cut Sheet
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {formatInches(inputs.width as number)} W x{" "}
              {formatInches(inputs.height as number)} H x{" "}
              {formatInches(inputs.depth as number)} D
              {inputs.construction === "faceframe"
                ? " \u00B7 Face Frame"
                : " \u00B7 Frameless"}
              {" \u00B7 "}
              {inputs.doorStyle === "shaker" ? "Shaker" : "Slab"} Door
              {(inputs.doorCount as number) > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex-shrink-0 text-sm px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors print:hidden"
          >
            Print
          </button>
        </div>
      </div>

      {/* Design Preview */}
      <CabinetPreview />

      {/* Parts Table */}
      <PartsTable />

      {/* Sheet Layout */}
      <SheetLayoutDiagram />

      {/* Assembly Notes */}
      <AssemblyNotes />
    </div>
  );
}
