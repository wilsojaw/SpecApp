"use client";

import { useSpec } from "@/context/SpecContext";

export function AssemblyNotes() {
  const { state } = useSpec();
  const { assemblySteps } = state;

  if (assemblySteps.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Assembly Instructions
        </h2>
      </div>
      <div className="p-4 md:p-5">
        <ol className="flex flex-col gap-4">
          {assemblySteps.map((step) => (
            <li key={step.order} className="flex gap-3">
              {/* Step number */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {step.order}
              </div>

              <div className="flex-1 min-w-0">
                {/* Instruction */}
                <p className="text-sm text-slate-800 leading-relaxed">
                  {step.instruction}
                </p>

                {/* Joinery note */}
                {step.joinery && (
                  <p className="text-xs text-blue-600 italic mt-1">
                    {step.joinery}
                  </p>
                )}

                {/* Hardware list */}
                {step.hardware && step.hardware.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {step.hardware.map((hw, i) => (
                      <li
                        key={i}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                      >
                        {hw}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
