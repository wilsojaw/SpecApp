import { supabase } from "./supabase";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Job = Tables<"jobs">;
export type JobInsert = TablesInsert<"jobs">;
export type JobUpdate = TablesUpdate<"jobs">;
export type JobSummary = Pick<
  Job,
  "id" | "name" | "workspace_id" | "template_type" | "status" | "updated_at"
>;
const SUMMARY_COLUMNS = "id, name, workspace_id, template_type, status, updated_at";

export type JobStatus = "draft" | "in_progress" | "completed";

export const JOB_STATUSES: {
  value: JobStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "bg-slate-100 text-slate-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
];

export async function listRecentJobs(limit = 5): Promise<JobSummary[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(SUMMARY_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function copyJob(sourceId: string, targetWorkspaceId: string) {
  const source = await getJob(sourceId);
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      name: source.name,
      template_type: source.template_type,
      template_id: source.template_id,
      inputs: source.inputs,
      sheet_size: source.sheet_size,
      cut_sheet_data: source.cut_sheet_data,
      notes: source.notes,
      status: "draft",
      workspace_id: targetWorkspaceId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listJobs(workspaceId: string, status?: JobStatus) {
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getJob(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createJob(job: JobInsert) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: JobUpdate) {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
