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
import {
  createJob,
  updateJob,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import type { Json } from "@/lib/database.types";

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
}

interface SpecContextValue {
  state: SpecState;
  highlightedPartId: string | null;
  currentJob: Job | null;
  setTemplateId: (id: string) => void;
  setInput: (key: string, value: unknown) => void;
  setAllInputs: (inputs: Record<string, unknown>) => void;
  setSheetSize: (size: SheetSize) => void;
  highlightPart: (partId: string) => void;
  saveJob: (name: string) => Promise<Job>;
  loadJob: (job: Job) => void;
  updateJobStatus: (status: JobStatus) => Promise<void>;
  newJob: () => void;
}

const SpecContext = createContext<SpecContextValue | null>(null);

const DEFAULT_SHEET_SIZE: SheetSize = { width: 48.5, height: 96.5 };

function calculate(
  templateId: string,
  inputs: Record<string, unknown>,
  sheetSize: SheetSize,
): Omit<SpecState, "templateId" | "inputs" | "sheetSize"> {
  const template = templateRegistry[templateId];
  if (!template) return { parts: [], packedSheets: [], assemblySteps: [] };

  const parts = template.generateParts(inputs as never);
  const packedSheets = packSheets(parts, sheetSize.width, sheetSize.height);
  const assemblySteps = template.generateAssembly(inputs as never, parts);

  return { parts, packedSheets, assemblySteps };
}

export function SpecProvider({ children }: { children: ReactNode }) {
  const defaultTemplateId = "base-cabinet";
  const defaultInputs = { ...templateRegistry[defaultTemplateId].defaultInputs };

  const [templateId, setTemplateIdState] = useState(defaultTemplateId);
  const [inputs, setInputs] = useState<Record<string, unknown>>(defaultInputs);
  const [sheetSize, setSheetSize] = useState<SheetSize>(DEFAULT_SHEET_SIZE);
  const [highlightedPartId, setHighlightedPartId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  const derived = useMemo(
    () => calculate(templateId, inputs, sheetSize),
    [templateId, inputs, sheetSize]
  );

  const state: SpecState = {
    templateId,
    inputs,
    sheetSize,
    ...derived,
  };

  const setTemplateId = useCallback((id: string) => {
    const template = templateRegistry[id];
    if (!template) return;
    setTemplateIdState(id);
    setInputs({ ...template.defaultInputs });
  }, []);

  const setInput = useCallback((key: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setAllInputs = useCallback((newInputs: Record<string, unknown>) => {
    setInputs(newInputs);
  }, []);

  const highlightPart = useCallback((partId: string) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedPartId(partId);
    highlightTimer.current = setTimeout(() => setHighlightedPartId(null), 2000);
  }, []);

  const saveJob = useCallback(
    async (name: string) => {
      const cutSheetData = {
        parts: derived.parts,
        packedSheets: derived.packedSheets,
        assemblySteps: derived.assemblySteps,
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
        const created = await createJob({
          name,
          template_type: templateId,
          inputs: inputs as Json,
          sheet_size: sheetSize as unknown as Json,
          cut_sheet_data: cutSheetData as unknown as Json,
          status: "draft",
        });
        setCurrentJob(created);
        return created;
      }
    },
    [currentJob, templateId, inputs, sheetSize, derived]
  );

  const loadJob = useCallback((job: Job) => {
    setCurrentJob(job);
    setTemplateIdState(job.template_type);
    setInputs(job.inputs as unknown as Record<string, unknown>);
    if (job.sheet_size) {
      setSheetSize(job.sheet_size as unknown as SheetSize);
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
    setCurrentJob(null);
    setTemplateIdState(defaultTemplateId);
    setInputs({ ...templateRegistry[defaultTemplateId].defaultInputs });
    setSheetSize(DEFAULT_SHEET_SIZE);
  }, []);

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
