"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpec } from "@/context/SpecContext";
import { listJobs, deleteJob, JOB_STATUSES, type Job, type JobStatus } from "@/lib/jobs";
import { templateRegistry } from "@/templates/registry";

interface JobsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function JobsPanel({ open, onClose }: JobsPanelProps) {
  const { loadJob, currentJob } = useSpec();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listJobs(
        filter === "all" ? undefined : filter
      );
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (open) fetchJobs();
  }, [open, fetchJobs]);

  async function handleDelete(id: string) {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-lg bg-white shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Jobs</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {JOB_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === s.value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              Loading...
            </p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No jobs yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`rounded-lg border p-4 transition-colors cursor-pointer hover:border-blue-300 ${
                    currentJob?.id === job.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                  onClick={() => {
                    loadJob(job);
                    onClose();
                  }}
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
      </div>
    </div>
  );
}
