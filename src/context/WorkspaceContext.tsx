"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  listWorkspaces,
  type Workspace,
} from "@/lib/workspaces";

const STORAGE_KEY = "specapp:workspaceId";

export type Screen = "workspace" | "jobs" | "spec";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  screen: Screen;
  loading: boolean;
  selectWorkspace: (id: string) => void;
  clearWorkspace: () => void;
  goToSpec: () => void;
  goToJobs: () => void;
  upsertWorkspace: (ws: Workspace) => void;
  removeWorkspace: (id: string) => void;
  refreshWorkspaces: () => Promise<Workspace[]>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [screen, setScreen] = useState<Screen>("workspace");
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    const data = await listWorkspaces();
    setWorkspaces(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listWorkspaces();
        if (cancelled) return;
        setWorkspaces(data);
        const savedId = window.localStorage.getItem(STORAGE_KEY);
        const match = savedId ? data.find((w) => w.id === savedId) : null;
        if (match) {
          setSelectedWorkspace(match);
          setScreen("jobs");
        } else {
          if (savedId) window.localStorage.removeItem(STORAGE_KEY);
          setScreen("workspace");
        }
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectWorkspace = useCallback(
    (id: string) => {
      if (selectedWorkspace?.id === id) return;
      const match = workspaces.find((w) => w.id === id);
      if (!match) return;
      setSelectedWorkspace(match);
      setScreen("jobs");
      window.localStorage.setItem(STORAGE_KEY, id);
    },
    [workspaces, selectedWorkspace]
  );

  const clearWorkspace = useCallback(() => {
    setSelectedWorkspace(null);
    setScreen("workspace");
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const goToSpec = useCallback(() => setScreen("spec"), []);
  const goToJobs = useCallback(() => setScreen("jobs"), []);

  const upsertWorkspace = useCallback((ws: Workspace) => {
    setWorkspaces((prev) => {
      const idx = prev.findIndex((w) => w.id === ws.id);
      if (idx === -1) return [...prev, ws];
      const next = prev.slice();
      next[idx] = ws;
      return next;
    });
    setSelectedWorkspace((prev) => (prev?.id === ws.id ? ws : prev));
  }, []);

  const removeWorkspace = useCallback((id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setSelectedWorkspace((prev) => {
      if (prev?.id !== id) return prev;
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    });
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,
        screen,
        loading,
        selectWorkspace,
        clearWorkspace,
        goToSpec,
        goToJobs,
        upsertWorkspace,
        removeWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
