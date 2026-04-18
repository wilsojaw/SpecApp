"use client";

import { useState } from "react";
import { useSpec } from "@/context/SpecContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { displayName } from "@/lib/workspaces";
import { InputPanel } from "./InputPanel";
import { CutSheet } from "./CutSheet";

export function Dashboard() {
  const { currentJob, newJob } = useSpec();
  const { selectedWorkspace, goToJobs } = useWorkspace();
  const [inputPanelOpen, setInputPanelOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goToJobs}
              className="text-sm px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-medium transition-colors flex-shrink-0 print:hidden"
              aria-label="Back to jobs"
            >
              ← Jobs
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">
                {currentJob ? currentJob.name : "New Job"}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {selectedWorkspace ? displayName(selectedWorkspace) : "Cut Sheet Generator"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden flex-shrink-0">
            <button
              onClick={() => setInputPanelOpen(true)}
              className="md:hidden text-sm px-3 py-2 rounded-md bg-blue-500 text-white font-medium active:bg-blue-600 transition-colors"
            >
              Specs
            </button>
            {currentJob && (
              <button
                onClick={newJob}
                className="text-sm px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-medium transition-colors"
              >
                + New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile input drawer */}
      {inputPanelOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          <div
            className="absolute inset-0 bg-black/40 drawer-backdrop"
            onClick={() => setInputPanelOpen(false)}
          />
          <div className="relative mt-14 flex-1 flex flex-col bg-white rounded-t-2xl shadow-xl drawer-panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-base font-semibold text-slate-900">
                Specifications
              </h2>
              <button
                onClick={() => setInputPanelOpen(false)}
                className="text-slate-400 active:text-slate-600 text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InputPanel />
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop only */}
        <aside className="hidden md:block w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto print:hidden">
          <InputPanel />
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto blueprint-grid">
          <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <CutSheet />
          </div>
        </main>
      </div>
    </div>
  );
}
