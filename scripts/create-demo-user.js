import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import ws from 'ws';

// Cargar variables de entorno del archivo .env en la raíz
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("ERROR: Faltan variables de entorno VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Por favor, asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tu .env (nunca lo subas a GitHub).");
  process.exit(1);
}

// Inicializar cliente con Service Role para bypass de RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: fetch
  },
  realtime: {
    transport: ws // Esto soluciona el error de Node.js 20 sin WebSocket nativo
  }
});

async function createDemoUser() {
  console.log("Creando usuario DEMO...");
  const email = 'demo_admin@prepkitchen.com';
  const password = 'admin123456';

  // 1. Crear usuario en auth.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Ya confirmado
    user_metadata: { name: 'Demo Administrator' }
  });

  let userId;

  if (authError) {
    if (authError.message.includes('already been registered') || authError.status === 422) {
      console.log("El usuario demo ya existe en auth.users. Recuperando su ID...");
      // Listar usuarios (como es service_role podemos listar todos y filtrar)
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        console.error("Error al listar usuarios:", listError.message);
        process.exit(1);
      }
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        console.error("No se pudo encontrar el usuario existente.");
        process.exit(1);
      }
    } else {
      console.error("Error creando usuario en auth:", authError.message);
      process.exit(1);
    }
  } else {
    console.log("Usuario creado en auth.users con éxito.");
    userId = authData.user.id;
  }

  // 2. Insertar/Actualizar en public.users
  console.log(`Asegurando que el usuario (ID: ${userId}) esté en public.users como admin...`);
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      email,
      name: 'Demo Administrator',
      role: 'admin',
      active: true
    });

  if (dbError) {
    console.error("Error insertando en public.users:", dbError.message);
    process.exit(1);
  }

  console.log("¡Éxito! El entorno Demo está listo con el usuario:");
  console.log(`Email: ${email}`);
  console.log(`Clave: ${password}`);
}

createDemoUser();
