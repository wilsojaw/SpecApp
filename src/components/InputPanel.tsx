"use client";

import { useSpec } from "@/context/SpecContext";
import { templateRegistry, templateList } from "@/templates/registry";
import { SpecField } from "./SpecField";

export function InputPanel() {
  const { state, setTemplateId, setInput } = useSpec();
  const template = templateRegistry[state.templateId];

  if (!template) return null;

  // Group fields by group name
  const groups = new Map<string, typeof template.inputSchema>();
  for (const field of template.inputSchema) {
    if (!groups.has(field.group)) groups.set(field.group, []);
    groups.get(field.group)!.push(field);
  }

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Template selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Template
        </label>
        <select
          value={state.templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {templateList.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">{template.description}</p>
      </div>

      {/* Grouped fields */}
      {Array.from(groups.entries()).map(([groupName, fields]) => (
        <div key={groupName} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1">
            {groupName}
          </h3>
          {fields.map((field) => (
            <SpecField
              key={field.key}
              field={field}
              value={state.inputs[field.key]}
              onChange={setInput}
            />
          ))}
        </div>
      ))}

      {/* Summary */}
      <div className="mt-2 rounded-md bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
          Summary
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total Parts</span>
          <span className="font-mono text-slate-900">
            {state.parts.reduce((sum, p) => sum + p.quantity, 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-600">Sheets Required</span>
          <span className="font-mono text-slate-900">
            {state.packedSheets.length}
          </span>
        </div>
      </div>
    </div>
  );
}
