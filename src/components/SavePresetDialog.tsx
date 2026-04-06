"use client";

import { useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { createSavedTemplate } from "@/lib/templates-db";
import type { Json } from "@/lib/database.types";

interface SavePresetDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SavePresetDialog({
  open,
  onClose,
  onSaved,
}: SavePresetDialogProps) {
  const { state } = useSpec();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await createSavedTemplate({
        name: trimmed,
        template_type: state.templateId,
        description: description.trim() || null,
        custom_inputs: state.inputs as unknown as Json,
      });
      setName("");
      setDescription("");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save preset:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-md p-4 md:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Save as Preset
        </h3>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Preset Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="e.g. Standard Kitchen Base"
          autoFocus
          className="w-full h-11 md:h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1 mt-3">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 36x34.5x24 face frame slab"
          className="w-full h-11 md:h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
