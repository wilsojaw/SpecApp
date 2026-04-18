"use client";

import { useCallback, useEffect, useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { deleteJob, JOB_STATUSES, listJobs, type Job, type JobStatus } from "@/lib/jobs";
import { displayName } from "@/lib/workspaces";
import { templateRegistry } from "@/templates/registry";

export function JobListScreen() {
  const { selectedWorkspace, clearWorkspace, goToSpec } = useWorkspace();
  const { loadJob, newJob } = useSpec();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  const fetchJobs = useCallback(async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const data = await listJobs(
        selectedWorkspace.id,
        filter === "all" ? undefined : filter
      );
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedWorkspace]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleDelete(id: string) {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  }

  function handleCreateJob() {
    newJob();
    goToSpec();
  }

  function handleOpenJob(job: Job) {
    loadJob(job);
    goToSpec();
  }

  if (!selectedWorkspace) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500 text-white font-bold text-sm flex-shrink-0">
              S
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">
                {displayName(selectedWorkspace)}
              </h1>
              <p className="text-xs text-slate-500">Jobs</p>
            </div>
          </div>
          <button
            onClick={clearWorkspace}
            className="text-sm px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-medium transition-colors flex-shrink-0"
          >
            Switch workspace
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <button
            onClick={handleCreateJob}
            className="w-full mb-4 text-sm font-medium px-4 py-3 rounded-md bg-blue-500 text-white active:bg-blue-600 transition-colors"
          >
            + Create new job
          </button>

          <div className="flex gap-1 mb-3 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 md:py-1.5 text-xs font-medium rounded-md transition-colors flex-shrink-0 ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              }`}
            >
              All
            </button>
            {JOB_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-3 py-2 md:py-1.5 text-xs font-medium rounded-md transition-colors flex-shrink-0 ${
                  filter === s.value
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No jobs yet. Create one to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition-colors cursor-pointer hover:border-blue-300"
                  onClick={() => handleOpenJob(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {job.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {templateRegistry[job.template_type]?.name ?? job.template_type} &middot;{" "}
                        {new Date(job.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {(() => {
                        const s = JOB_STATUSES.find((s) => s.value === job.status);
                        return s ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
                            {s.label}
                          </span>
                        ) : null;
                      })()}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id);
                        }}
                        className="text-slate-300 hover:text-red-500 text-sm transition-colors"
                        title="Delete job"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
