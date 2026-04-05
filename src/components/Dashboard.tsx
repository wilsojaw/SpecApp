"use client";

import { InputPanel } from "./InputPanel";
import { CutSheet } from "./CutSheet";

export function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500 text-white font-bold text-sm">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">
              SpecApp
            </h1>
            <p className="text-xs text-slate-500">Cut Sheet Generator</p>
          </div>
        </div>
      </header>

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
