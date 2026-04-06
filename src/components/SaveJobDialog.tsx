"use client";

import { useState } from "react";
import { useSpec } from "@/context/SpecContext";

interface SaveJobDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SaveJobDialog({ open, onClose }: SaveJobDialogProps) {
  const { currentJob, saveJob } = useSpec();
  const [name, setName] = useState(currentJob?.name ?? "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await saveJob(trimmed);
      onClose();
    } catch (err) {
      console.error("Failed to save job:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {currentJob ? "Update Job" : "Save as Job"}
        </h3>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Customer / Project Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="e.g. Smith Kitchen Remodel"
          autoFocus
          className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {saving ? "Saving..." : currentJob ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
