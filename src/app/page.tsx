"use client";

import { Dashboard } from "@/components/Dashboard";
import { JobListScreen } from "@/components/JobListScreen";
import { WorkspaceScreen } from "@/components/WorkspaceScreen";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function Home() {
  const { screen } = useWorkspace();

  if (screen === "workspace") return <WorkspaceScreen />;
  if (screen === "jobs") return <JobListScreen />;
  return <Dashboard />;
}
