import { supabase } from "./supabase";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type SavedTemplate = Tables<"templates">;
export type SavedTemplateInsert = TablesInsert<"templates">;
export type SavedTemplateUpdate = TablesUpdate<"templates">;

export async function listSavedTemplates(templateType?: string) {
  let query = supabase
    .from("templates")
    .select("*")
    .order("name", { ascending: true });

  if (templateType) {
    query = query.eq("template_type", templateType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSavedTemplate(id: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createSavedTemplate(template: SavedTemplateInsert) {
  const { data, error } = await supabase
    .from("templates")
    .insert(template)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSavedTemplate(
  id: string,
  updates: SavedTemplateUpdate
) {
  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSavedTemplate(id: string) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}
