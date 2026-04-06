"use client";

import { useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { templateRegistry } from "@/templates/registry";
import { formatInches } from "@/lib/units";
import { CabinetPreview } from "./CabinetPreview";
import { PartsTable } from "./PartsTable";
import { SheetLayoutDiagram } from "./SheetLayoutDiagram";
import { AssemblyNotes } from "./AssemblyNotes";
import { SaveJobDialog } from "./SaveJobDialog";
import { JOB_STATUSES, type JobStatus } from "@/lib/jobs";

export function CutSheet() {
  const { state, currentJob, updateJobStatus } = useSpec();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
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
              {formatInches(inputs.height as number)} H
              {inputs.depth != null && <> x {formatInches(inputs.depth as number)} D</>}
              {" \u00B7 "}
              {state.parts.reduce((sum, p) => sum + p.quantity, 0)} parts
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
            {currentJob && (
              <select
                value={currentJob.status}
                onChange={(e) =>
                  updateJobStatus(e.target.value as JobStatus)
                }
                className="text-sm h-9 rounded-md border border-slate-300 px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="text-sm px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            >
              {currentJob ? "Save" : "Save Job"}
            </button>
            <button
              onClick={() => window.print()}
              className="text-sm px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      <SaveJobDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />

      {/* Design Preview (template-specific) */}
      {state.templateId === "base-cabinet" && <CabinetPreview />}

      {/* Parts Table */}
      <PartsTable />

      {/* Sheet Layout */}
      <SheetLayoutDiagram />

      {/* Assembly Notes */}
      <AssemblyNotes />
    </div>
  );
}
