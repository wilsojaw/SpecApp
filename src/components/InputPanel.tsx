"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpec } from "@/context/SpecContext";
import { templateRegistry, templateList } from "@/templates/registry";
import { SpecField } from "./SpecField";
import { SavePresetDialog } from "./SavePresetDialog";
import {
  listSavedTemplates,
  deleteSavedTemplate,
  type SavedTemplate,
} from "@/lib/templates-db";

export function InputPanel() {
  const { state, setTemplateId, setInput, setAllInputs } = useSpec();
  const template = templateRegistry[state.templateId];
  const [presets, setPresets] = useState<SavedTemplate[]>([]);
  const [savePresetOpen, setSavePresetOpen] = useState(false);

  const fetchPresets = useCallback(async () => {
    try {
      const data = await listSavedTemplates(state.templateId);
      setPresets(data);
    } catch (err) {
      console.error("Failed to load presets:", err);
    }
  }, [state.templateId]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  if (!template) return null;

  function loadPreset(preset: SavedTemplate) {
    setAllInputs(preset.custom_inputs as unknown as Record<string, unknown>);
  }

  async function handleDeletePreset(id: string) {
    try {
      await deleteSavedTemplate(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete preset:", err);
    }
  }

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

      {/* Saved presets */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Presets
          </label>
          <button
            onClick={() => setSavePresetOpen(true)}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            + Save Current
          </button>
        </div>
        {presets.length === 0 ? (
          <p className="text-xs text-slate-400">No saved presets</p>
        ) : (
          <div className="flex flex-col gap-1">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300 transition-colors group"
              >
                <button
                  onClick={() => loadPreset(preset)}
                  className="text-left min-w-0 flex-1"
                >
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {preset.name}
                  </p>
                  {preset.description && (
                    <p className="text-xs text-slate-400 truncate">
                      {preset.description}
                    </p>
                  )}
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="text-slate-300 hover:text-red-500 text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete preset"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SavePresetDialog
        open={savePresetOpen}
        onClose={() => setSavePresetOpen(false)}
        onSaved={fetchPresets}
      />

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
