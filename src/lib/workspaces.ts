import { supabase } from "./supabase";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Workspace = Tables<"workspaces">;
export type WorkspaceInsert = TablesInsert<"workspaces">;
export type WorkspaceUpdate = TablesUpdate<"workspaces">;

export function displayName(ws: Workspace | { name: string }) {
  return `${ws.name}'s Workspace`;
}

export function parseUniqueNameError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : fallback;
  const lower = message.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique")) {
    return "A workspace with that name already exists";
  }
  return message;
}

export async function listWorkspaces() {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createWorkspace(name: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate) {
  const { data, error } = await supabase
    .from("workspaces")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWorkspace(id: string) {
  const { error } = await supabase.from("workspaces").delete().eq("id", id);
  if (error) throw error;
}
