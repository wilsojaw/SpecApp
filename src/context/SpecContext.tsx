"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Part, PackedSheet, AssemblyStep } from "@/templates/types";
import { templateRegistry } from "@/templates/registry";
import { packSheets } from "@/lib/bin-pack";

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
  setTemplateId: (id: string) => void;
  setInput: (key: string, value: unknown) => void;
  setSheetSize: (size: SheetSize) => void;
  highlightPart: (partId: string) => void;
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
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const highlightPart = useCallback((partId: string) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedPartId(partId);
    highlightTimer.current = setTimeout(() => setHighlightedPartId(null), 2000);
  }, []);

  return (
    <SpecContext.Provider value={{ state, highlightedPartId, setTemplateId, setInput, setSheetSize, highlightPart }}>
      {children}
    </SpecContext.Provider>
  );
}

export function useSpec() {
  const ctx = useContext(SpecContext);
  if (!ctx) throw new Error("useSpec must be used within SpecProvider");
  return ctx;
}
