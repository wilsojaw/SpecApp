"use client";

import { useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { InputPanel } from "./InputPanel";
import { CutSheet } from "./CutSheet";
import { JobsPanel } from "./JobsPanel";

export function Dashboard() {
  const { currentJob, newJob } = useSpec();
  const [jobsPanelOpen, setJobsPanelOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500 text-white font-bold text-sm">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                SpecApp
              </h1>
              <p className="text-xs text-slate-500">
                {currentJob ? currentJob.name : "Cut Sheet Generator"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {currentJob && (
              <button
                onClick={newJob}
                className="text-sm px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                + New
              </button>
            )}
            <button
              onClick={() => setJobsPanelOpen(true)}
              className="text-sm px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
            >
              Jobs
            </button>
          </div>
        </div>
      </header>

      <JobsPanel open={jobsPanelOpen} onClose={() => setJobsPanelOpen(false)} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto print:hidden">
          <InputPanel />
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto blueprint-grid">
          <div className="p-6 max-w-5xl mx-auto">
            <CutSheet />
          </div>
        </main>
      </div>
    </div>
  );
}
