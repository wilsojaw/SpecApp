"use client";

import { useSpec } from "@/context/SpecContext";
import { formatInches, formatThickness } from "@/lib/units";

export function PartsTable() {
  const { state, highlightPart } = useSpec();
  const { parts } = state;

  const handlePartClick = (partId: string) => {
    highlightPart(partId);
    // Find the first sheet that contains this part
    const sheetIndex = state.packedSheets.findIndex((s) =>
      s.placements.some((p) => p.part.id === partId)
    );
    const el = document.getElementById(`cutting-sheet-${sheetIndex >= 0 ? sheetIndex : 0}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (parts.length === 0) return null;

  // Group parts by material
  const groups = new Map<string, typeof parts>();
  for (const part of parts) {
    if (!groups.has(part.material)) groups.set(part.material, []);
    groups.get(part.material)!.push(part);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Parts List
        </h2>
      </div>

      {Array.from(groups.entries()).map(([material, groupParts]) => (
        <div key={material}>
          <div className="px-4 md:px-5 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              {material}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-3 md:px-5 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Part
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Qty
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Length
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Width
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Thick.
                  </th>
                  <th className="text-left px-3 md:px-5 py-2 font-medium text-slate-600 whitespace-nowrap">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupParts.map((part, i) => (
                  <tr
                    key={part.id}
                    onClick={() => handlePartClick(part.id)}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-blue-50 active:bg-blue-100 transition-colors ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
                  >
                    <td className="px-3 md:px-5 py-2.5 text-blue-700 font-medium underline underline-offset-2 decoration-blue-300">
                      {part.name}
                    </td>
                    <td className="text-center px-3 py-2.5 font-mono text-slate-700">
                      {part.quantity}
                    </td>
                    <td className="text-right px-3 py-2.5 font-mono text-blue-700">
                      {formatInches(part.length)}
                    </td>
                    <td className="text-right px-3 py-2.5 font-mono text-blue-700">
                      {formatInches(part.width)}
                    </td>
                    <td className="text-right px-3 py-2.5 font-mono text-slate-600">
                      {formatThickness(part.thickness)}
                    </td>
                    <td className="px-3 md:px-5 py-2.5 text-slate-500 text-xs">
                      {part.notes || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="px-4 md:px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between text-sm">
        <span className="font-medium text-slate-600">
          Total individual pieces
        </span>
        <span className="font-mono font-semibold text-slate-900">
          {parts.reduce((sum, p) => sum + p.quantity, 0)}
        </span>
      </div>
    </div>
  );
}
