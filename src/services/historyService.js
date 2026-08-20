import { supabase } from '../lib/supabase';

export async function getHistory({ recipeId, limit = 50 } = {}) {
  let query = supabase
    .from('recipe_history')
    .select(`
      *,
      users(name),
      recipes(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (recipeId) {
    query = query.eq('recipe_id', recipeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
