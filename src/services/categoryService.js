import { supabase } from '../lib/supabase';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, recipes(count)')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory({ name, icon }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, icon })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, { name, icon }) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, icon })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
