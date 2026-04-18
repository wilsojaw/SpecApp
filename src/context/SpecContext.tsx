"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Part, PackedSheet, AssemblyStep } from "@/templates/types";
import { templateRegistry } from "@/templates/registry";
import { packSheets } from "@/lib/bin-pack";
import { lamAdjust, DEFAULT_LAMINATE_EDGES } from "@/templates/base-cabinet/constants";
import {
  createJob,
  updateJob,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import type { Json } from "@/lib/database.types";
import { useWorkspace } from "@/context/WorkspaceContext";

interface SheetSize {
  width: number;
  height: number;
}

interface SpecState {
  templateId: string;
  inputs: Record<string, unknown>;
  sheetSize: SheetSize;
  parts: Part[];
  packedSheets: PackedSheet[];
  assemblySteps: AssemblyStep[];
  laminateSelections: Record<string, boolean>;
}

interface SpecContextValue {
  state: SpecState;
  highlightedPartId: string | null;
  currentJob: Job | null;
  setTemplateId: (id: string) => void;
  setInput: (key: string, value: unknown) => void;
  setAllInputs: (inputs: Record<string, unknown>) => void;
  setSheetSize: (size: SheetSize) => void;
  toggleLaminate: (partId: string) => void;
  highlightPart: (partId: string) => void;
  saveJob: (name: string) => Promise<Job>;
  loadJob: (job: Job) => void;
  updateJobStatus: (status: JobStatus) => Promise<void>;
  newJob: () => void;
}

const SpecContext = createContext<SpecContextValue | null>(null);

const DEFAULT_SHEET_SIZE: SheetSize = { width: 48.5, height: 96.5 };

function generateBase(
  templateId: string,
  inputs: Record<string, unknown>,
) {
  const template = templateRegistry[templateId];
  if (!template) return { baseParts: [] as Part[], assemblySteps: [] as AssemblyStep[], laminateDefaults: {} as Record<string, boolean> };

  const baseParts = template.generateParts(inputs as never);
  const assemblySteps = template.generateAssembly(inputs as never, baseParts);

  const laminateDefaults: Record<string, boolean> = {};
  for (const part of baseParts) {
    laminateDefaults[part.id] = !!part.laminate;
  }

  return { baseParts, assemblySteps, laminateDefaults };
}

/** Apply laminate adjustments to parts based on selections, then pack sheets */
function applyLaminateAndPack(
  baseParts: Part[],
  selections: Record<string, boolean>,
  sheetSize: SheetSize,
) {
  const parts = baseParts.map((part) => {
    if (!selections[part.id]) return part;

    const lEdges = part.laminate?.lengthEdges ?? DEFAULT_LAMINATE_EDGES;
    const wEdges = part.laminate?.widthEdges ?? DEFAULT_LAMINATE_EDGES;
    if (lEdges === 0 && wEdges === 0) return part;

    return {
      ...part,
      length: lamAdjust(part.length, lEdges),
      width: lamAdjust(part.width, wEdges),
    };
  });

  const packedSheets = packSheets(parts, sheetSize.width, sheetSize.height);
  return { parts, packedSheets };
}

export function SpecProvider({ children }: { children: ReactNode }) {
  const { selectedWorkspace } = useWorkspace();
  const defaultTemplateId = "base-cabinet";
  const defaultInputs = { ...templateRegistry[defaultTemplateId].defaultInputs };

  const [templateId, setTemplateIdState] = useState(defaultTemplateId);
  const [inputs, setInputs] = useState<Record<string, unknown>>(defaultInputs);
  const [sheetSize, setSheetSize] = useState<SheetSize>(DEFAULT_SHEET_SIZE);
  const [highlightedPartId, setHighlightedPartId] = useState<string | null>(null);
  const [currentJob, setCurrentJobState] = useState<Job | null>(null);
  const [laminateOverrides, setLaminateOverrides] = useState<Record<string, boolean>>({});
  const laminateRef = useRef<Record<string, boolean>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentJobWorkspaceRef = useRef<string | null>(null);
  const setCurrentJob = useCallback((job: Job | null) => {
    currentJobWorkspaceRef.current = job?.workspace_id ?? null;
    setCurrentJobState(job);
  }, []);

  const resetSpecDefaults = useCallback(() => {
    currentJobWorkspaceRef.current = null;
    setCurrentJobState(null);
    setTemplateIdState(defaultTemplateId);
    setInputs({ ...templateRegistry[defaultTemplateId].defaultInputs });
    setSheetSize(DEFAULT_SHEET_SIZE);
    setLaminateOverrides({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  const workspaceId = selectedWorkspace?.id ?? null;
  useEffect(() => {
    // Skip reset when a just-loaded job already belongs to the new workspace
    if (workspaceId && currentJobWorkspaceRef.current === workspaceId) return;
    resetSpecDefaults();
  }, [workspaceId, resetSpecDefaults]);

  // Step 1: Generate base parts + assembly (no laminate adjustments)
  const base = useMemo(
    () => generateBase(templateId, inputs),
    [templateId, inputs]
  );

  // Step 2: Merge laminate defaults with user overrides
  const laminateSelections = useMemo(() => {
    const merged = { ...base.laminateDefaults, ...laminateOverrides };
    laminateRef.current = merged;
    return merged;
  }, [base.laminateDefaults, laminateOverrides]);

  // Step 3: Apply laminate adjustments + pack sheets (re-runs when selections OR sheet size change)
  const { parts, packedSheets } = useMemo(
    () => applyLaminateAndPack(base.baseParts, laminateSelections, sheetSize),
    [base.baseParts, laminateSelections, sheetSize]
  );

  const state: SpecState = {
    templateId,
    inputs,
    sheetSize,
    parts,
    packedSheets,
    assemblySteps: base.assemblySteps,
    laminateSelections,
  };

  const setTemplateId = useCallback((id: string) => {
    const template = templateRegistry[id];
    if (!template) return;
    setTemplateIdState(id);
    setInputs({ ...template.defaultInputs });
    setLaminateOverrides({});
  }, []);

  const setInput = useCallback((key: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setAllInputs = useCallback((newInputs: Record<string, unknown>) => {
    setInputs(newInputs);
  }, []);

  const toggleLaminate = useCallback((partId: string) => {
    setLaminateOverrides((prev) => ({
      ...prev,
      [partId]: !laminateRef.current[partId],
    }));
  }, []);

  const highlightPart = useCallback((partId: string) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedPartId(partId);
    highlightTimer.current = setTimeout(() => setHighlightedPartId(null), 2000);
  }, []);

  const saveJob = useCallback(
    async (name: string) => {
      const cutSheetData = {
        parts,
        packedSheets,
        assemblySteps: base.assemblySteps,
        laminateSelections,
      };

      if (currentJob) {
        // Update existing job
        const updated = await updateJob(currentJob.id, {
          name,
          inputs: inputs as Json,
          sheet_size: sheetSize as unknown as Json,
          cut_sheet_data: cutSheetData as unknown as Json,
        });
        setCurrentJob(updated);
        return updated;
      } else {
        // Create new job
        if (!selectedWorkspace) {
          throw new Error("Cannot create job without a selected workspace");
        }
        const created = await createJob({
          name,
          template_type: templateId,
          inputs: inputs as Json,
          sheet_size: sheetSize as unknown as Json,
          cut_sheet_data: cutSheetData as unknown as Json,
          status: "draft",
          workspace_id: selectedWorkspace.id,
        });
        setCurrentJob(created);
        return created;
      }
    },
    [currentJob, templateId, inputs, sheetSize, parts, packedSheets, base.assemblySteps, laminateSelections, selectedWorkspace]
  );

  const loadJob = useCallback((job: Job) => {
    setCurrentJob(job);
    setTemplateIdState(job.template_type);
    setInputs(job.inputs as unknown as Record<string, unknown>);
    if (job.sheet_size) {
      setSheetSize(job.sheet_size as unknown as SheetSize);
    }
    // Restore saved laminate selections as overrides
    const data = job.cut_sheet_data as Record<string, unknown> | null;
    if (data?.laminateSelections) {
      setLaminateOverrides(data.laminateSelections as Record<string, boolean>);
    } else {
      setLaminateOverrides({});
    }
  }, []);

  const updateJobStatus = useCallback(
    async (status: JobStatus) => {
      if (!currentJob) return;
      const updated = await updateJob(currentJob.id, { status });
      setCurrentJob(updated);
    },
    [currentJob]
  );

  const newJob = useCallback(() => {
    resetSpecDefaults();
  }, [resetSpecDefaults]);

  return (
    <SpecContext.Provider
      value={{
        state,
        highlightedPartId,
        currentJob,
        setTemplateId,
        setInput,
        setAllInputs,
        setSheetSize,
        toggleLaminate,
        highlightPart,
        saveJob,
        loadJob,
        updateJobStatus,
        newJob,
      }}
    >
      {children}
    </SpecContext.Provider>
  );
}

export function useSpec() {
  const ctx = useContext(SpecContext);
  if (!ctx) throw new Error("useSpec must be used within SpecProvider");
  return ctx;
}
