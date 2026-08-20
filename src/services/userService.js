import { supabase } from '../lib/supabase';

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleUserActive(id, active) {
  const { data, error } = await supabase
    .from('users')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createUser(email, password, name, role = 'cocinero') {
  // Invocar la Edge Function para crear el usuario sin perder la sesión actual del Admin
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: { email, password, name, role },
  });

  if (error) {
    console.error('Error invoking create-user function:', error);
    // Extraer mensaje de error si viene del body de la función
    throw new Error(error.message || 'Error al crear el usuario');
  }

  // La Edge Function devuelve el newUser en la propiedad data o podría venir directamente
  if (data?.error) {
     throw new Error(data.error);
  }

  return data;
}
