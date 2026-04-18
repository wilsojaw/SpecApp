"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { copyJob, getJob, listRecentJobs, type JobSummary } from "@/lib/jobs";
import {
  createWorkspace,
  deleteWorkspace,
  displayName,
  parseUniqueNameError,
  updateWorkspace,
} from "@/lib/workspaces";
import { templateRegistry } from "@/templates/registry";

const CREATE_SENTINEL = "__create__";

export function WorkspaceScreen() {
  const {
    workspaces,
    loading,
    selectWorkspace,
    upsertWorkspace,
    removeWorkspace,
    goToSpec,
  } = useWorkspace();
  const { loadJob } = useSpec();
  const [selectedId, setSelectedId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [openingJobId, setOpeningJobId] = useState<string | null>(null);

  const workspaceMap = useMemo(
    () => new Map(workspaces.map((w) => [w.id, w])),
    [workspaces]
  );
  const selected = selectedId ? workspaceMap.get(selectedId) ?? null : null;

  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const data = await listRecentJobs(5);
      setRecentJobs(data);
    } catch (err) {
      console.error("Failed to load recent jobs:", err);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  async function handleOpenRecent(job: JobSummary) {
    setError(null);
    if (!selected) {
      setError("Select or create a workspace first");
      return;
    }
    setOpeningJobId(job.id);
    try {
      if (job.workspace_id === selected.id) {
        const full = await getJob(job.id);
        selectWorkspace(selected.id);
        loadJob(full);
        goToSpec();
        return;
      }
      const sourceWs = workspaceMap.get(job.workspace_id);
      const sourceLabel = sourceWs ? displayName(sourceWs) : "another workspace";
      const confirmed = window.confirm(
        `Copy "${job.name}" from ${sourceLabel} into ${displayName(selected)}? A new job will be created in your workspace; the original is unchanged.`
      );
      if (!confirmed) return;
      const copy = await copyJob(job.id, selected.id);
      selectWorkspace(selected.id);
      loadJob(copy);
      goToSpec();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open job");
    } finally {
      setOpeningJobId(null);
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setError(null);
    const value = e.target.value;
    if (value === CREATE_SENTINEL) {
      setCreating(true);
      setNewName("");
      setSelectedId("");
    } else {
      setCreating(false);
      setRenamingId(null);
      setSelectedId(value);
    }
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createWorkspace(name);
      upsertWorkspace(created);
      setCreating(false);
      setNewName("");
      setSelectedId(created.id);
    } catch (err) {
      setError(parseUniqueNameError(err, "Failed to create workspace"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename() {
    if (!selected) return;
    const name = renameValue.trim();
    if (!name) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateWorkspace(selected.id, { name });
      upsertWorkspace(updated);
      setRenamingId(null);
    } catch (err) {
      setError(parseUniqueNameError(err, "Failed to rename workspace"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    const confirmed = window.confirm(
      `Delete ${displayName(selected)}? All jobs in this workspace will also be deleted. This cannot be undone.`
    );
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    try {
      await deleteWorkspace(selected.id);
      removeWorkspace(selected.id);
      setSelectedId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setBusy(false);
    }
  }

  function handleContinue() {
    if (!selected) return;
    selectWorkspace(selected.id);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-500 text-white font-bold text-base">
            S
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">SpecApp</h1>
            <p className="text-xs text-slate-500">Choose your workspace</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-700">Workspace</span>
              <select
                value={creating ? CREATE_SENTINEL : selectedId}
                onChange={handleSelectChange}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>
                  Select a workspace…
                </option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {displayName(w)}
                  </option>
                ))}
                <option value={CREATE_SENTINEL}>+ Create new workspace</option>
              </select>
            </label>

            {creating && (
              <div className="flex flex-col gap-2 p-3 rounded-md bg-slate-50 border border-slate-200">
                <label className="text-xs font-medium text-slate-700">
                  New workspace name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Justin"
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Will appear as &ldquo;{(newName.trim() || "Name") + "'s Workspace"}&rdquo;
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={busy}
                    className="flex-1 text-sm px-3 py-2 rounded-md bg-blue-500 text-white font-medium active:bg-blue-600 disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                      setError(null);
                    }}
                    className="text-sm px-3 py-2 rounded-md bg-slate-100 text-slate-700 font-medium active:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selected && !creating && (
              <div className="flex flex-col gap-2 p-3 rounded-md bg-slate-50 border border-slate-200">
                {renamingId === selected.id ? (
                  <>
                    <label className="text-xs font-medium text-slate-700">Rename</label>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="border border-slate-300 rounded-md px-3 py-2 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleRename}
                        disabled={busy}
                        className="flex-1 text-sm px-3 py-2 rounded-md bg-blue-500 text-white font-medium active:bg-blue-600 disabled:opacity-50"
                      >
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(null);
                          setError(null);
                        }}
                        className="text-sm px-3 py-2 rounded-md bg-slate-100 text-slate-700 font-medium active:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(selected.id);
                        setRenameValue(selected.name);
                        setError(null);
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-700 active:bg-slate-100"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded-md bg-white border border-red-200 text-red-600 active:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selected || creating}
              className="w-full text-sm px-4 py-3 rounded-md bg-blue-500 text-white font-medium active:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Recent activity
                </h2>
                {!selected && (
                  <span className="text-xs text-slate-400">Select a workspace first</span>
                )}
              </div>
              {recentLoading ? (
                <p className="text-sm text-slate-400 py-4 text-center">Loading…</p>
              ) : recentJobs.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No jobs yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentJobs.map((job) => {
                    const sourceWs = workspaceMap.get(job.workspace_id);
                    const sameWorkspace = selected?.id === job.workspace_id;
                    const actionLabel = !selected
                      ? "Open"
                      : sameWorkspace
                      ? "Open"
                      : "Copy";
                    const isOpening = openingJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        className="rounded-md border border-slate-200 bg-white p-3 flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {job.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {sourceWs ? displayName(sourceWs) : "Unknown workspace"} &middot;{" "}
                            {templateRegistry[job.template_type]?.name ?? job.template_type} &middot;{" "}
                            {new Date(job.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenRecent(job)}
                          disabled={isOpening}
                          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors flex-shrink-0 disabled:opacity-50"
                        >
                          {isOpening ? "…" : actionLabel}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
