import { supabase } from '../lib/supabase';
import { CHANGE_TYPES } from '../lib/constants';

export async function getRecipes({ categoryId, search, limit } = {}) {
  let query = supabase
    .from('recipes')
    .select(`
      *,
      categories(id, name, icon),
      recipe_ingredients(count)
    `)
    .order('updated_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function searchRecipes(term) {
  if (!term || term.length < 2) return [];

  // Search by recipe name
  const namePromise = supabase
    .from('recipes')
    .select('*, categories(id, name, icon)')
    .ilike('name', `%${term}%`)
    .limit(20);

  // Search by ingredient
  const ingredientPromise = supabase
    .from('recipe_ingredients')
    .select('recipe_id, ingredient, recipes(*, categories(id, name, icon))')
    .ilike('ingredient', `%${term}%`)
    .limit(20);

  const [nameResult, ingredientResult] = await Promise.all([
    namePromise,
    ingredientPromise,
  ]);

  if (nameResult.error) throw nameResult.error;
  if (ingredientResult.error) throw ingredientResult.error;

  // Merge results, avoiding duplicates
  const recipeMap = new Map();

  nameResult.data.forEach((r) => {
    recipeMap.set(r.id, { ...r, matchType: 'nombre' });
  });

  ingredientResult.data.forEach((item) => {
    if (item.recipes && !recipeMap.has(item.recipes.id)) {
      recipeMap.set(item.recipes.id, {
        ...item.recipes,
        matchType: 'ingrediente',
        matchedIngredient: item.ingredient,
      });
    }
  });

  return Array.from(recipeMap.values());
}

export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories(id, name, icon),
      recipe_ingredients(id, ingredient, quantity, sort_order),
      recipe_steps(id, step_number, instruction),
      updated_by_user:users!recipes_updated_by_fkey(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Sort ingredients and steps
  if (data.recipe_ingredients) {
    data.recipe_ingredients.sort((a, b) => a.sort_order - b.sort_order);
  }
  if (data.recipe_steps) {
    data.recipe_steps.sort((a, b) => a.step_number - b.step_number);
  }

  return data;
}

export async function getRecentRecipes(limit = 5) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, categories(id, name, icon)')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createRecipe(recipeData, userId) {
  const { name, category_id, shelf_life, shelf_life_unit, storage, ingredients, steps } = recipeData;

  // Insert recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      name,
      category_id,
      shelf_life: shelf_life || null,
      shelf_life_unit: shelf_life_unit || null,
      storage: storage || null,
      updated_by: userId,
    })
    .select()
    .single();

  if (recipeError) throw recipeError;

  // Insert ingredients
  if (ingredients?.length) {
    const ingredientRows = ingredients.map((ing, idx) => ({
      recipe_id: recipe.id,
      ingredient: ing.ingredient,
      quantity: ing.quantity || null,
      sort_order: idx,
    }));

    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRows);

    if (ingError) throw ingError;
  }

  // Insert steps
  if (steps?.length) {
    const stepRows = steps.map((step, idx) => ({
      recipe_id: recipe.id,
      step_number: idx + 1,
      instruction: step.instruction,
    }));

    const { error: stepError } = await supabase
      .from('recipe_steps')
      .insert(stepRows);

    if (stepError) throw stepError;
  }

  // Record history
  await supabase.from('recipe_history').insert({
    recipe_id: recipe.id,
    user_id: userId,
    change_type: CHANGE_TYPES.CREATED,
    new_value: recipeData,
  });

  return recipe;
}

export async function updateRecipe(id, recipeData, userId) {
  // Get current state for history
  const oldRecipe = await getRecipeById(id);

  const { name, category_id, shelf_life, shelf_life_unit, storage, ingredients, steps } = recipeData;

  // Update recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .update({
      name,
      category_id,
      shelf_life: shelf_life || null,
      shelf_life_unit: shelf_life_unit || null,
      storage: storage || null,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (recipeError) throw recipeError;

  // Replace ingredients: delete old, insert new
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

  if (ingredients?.length) {
    const ingredientRows = ingredients.map((ing, idx) => ({
      recipe_id: id,
      ingredient: ing.ingredient,
      quantity: ing.quantity || null,
      sort_order: idx,
    }));

    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRows);

    if (ingError) throw ingError;
  }

  // Replace steps: delete old, insert new
  await supabase.from('recipe_steps').delete().eq('recipe_id', id);

  if (steps?.length) {
    const stepRows = steps.map((step, idx) => ({
      recipe_id: id,
      step_number: idx + 1,
      instruction: step.instruction,
    }));

    const { error: stepError } = await supabase
      .from('recipe_steps')
      .insert(stepRows);

    if (stepError) throw stepError;
  }

  // Record history
  await supabase.from('recipe_history').insert({
    recipe_id: id,
    user_id: userId,
    change_type: CHANGE_TYPES.EDITED,
    old_value: {
      name: oldRecipe.name,
      category_id: oldRecipe.category_id,
      shelf_life: oldRecipe.shelf_life,
      shelf_life_unit: oldRecipe.shelf_life_unit,
      storage: oldRecipe.storage,
      ingredients: oldRecipe.recipe_ingredients,
      steps: oldRecipe.recipe_steps,
    },
    new_value: recipeData,
  });

  return recipe;
}

export async function deleteRecipe(id, userId) {
  const oldRecipe = await getRecipeById(id);

  // Record history before deletion
  await supabase.from('recipe_history').insert({
    recipe_id: id,
    user_id: userId,
    change_type: CHANGE_TYPES.DELETED,
    old_value: {
      name: oldRecipe.name,
      category_id: oldRecipe.category_id,
      shelf_life: oldRecipe.shelf_life,
      storage: oldRecipe.storage,
    },
  });

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
