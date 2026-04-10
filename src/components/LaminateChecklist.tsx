"use client";

import { useSpec } from "@/context/SpecContext";
import { formatDimension } from "@/lib/units";

export function LaminateChecklist() {
  const { state, toggleLaminate } = useSpec();
  const { parts, laminateSelections } = state;

  const laminateParts = parts.filter((p) => p.laminate);
  const checkedCount = Object.values(laminateSelections).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Laminate Checklist
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {checkedCount} selected ({laminateParts.length} recommended)
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {parts.map((part) => {
          const checked = !!laminateSelections[part.id];
          return (
            <li key={part.id}>
              <label className="flex items-start gap-3 px-4 md:px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLaminate(part.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {part.name}
                    </span>
                    {part.quantity > 1 && (
                      <span className="text-xs text-slate-400">
                        x{part.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDimension(part.length, part.width)}
                    {part.laminate && (
                      <span className="ml-2 text-blue-600">
                        {part.laminate.description}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
