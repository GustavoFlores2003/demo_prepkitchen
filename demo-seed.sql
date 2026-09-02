-- ==========================================
-- SCRIPT DE RESTAURACIÓN / CREACIÓN DE DEMO
-- ==========================================
-- Este script crea un usuario administrador de prueba directamente 
-- en la base de datos, saltándose la necesidad de registrarlo en la UI.
-- 
-- Credenciales que generará:
-- Email: demo_admin@prepkitchen.com
-- Password: admin123456
-- ==========================================

-- 1. Insertar el usuario en la tabla interna de autenticación (auth.users)
-- Usamos un UUID fijo (11111111-1111-1111-1111-111111111111) para poder restaurarlo fácilmente.
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  created_at, 
  updated_at, 
  role, 
  confirmation_token, 
  email_change, 
  email_change_token_new, 
  recovery_token
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'demo_admin@prepkitchen.com',
  crypt('admin123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE 
SET encrypted_password = crypt('admin123456', gen_salt('bf')); -- Restaura la contraseña si ya existe

-- 2. Insertar la identidad del usuario (requerido por Supabase para el login)
INSERT INTO auth.identities (
  id, 
  user_id, 
  identity_data, 
  provider, 
  last_sign_in_at, 
  created_at, 
  updated_at
)
VALUES (
  uuid_generate_v4(),
  '11111111-1111-1111-1111-111111111111',
  format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'demo_admin@prepkitchen.com')::jsonb,
  'email',
  now(),
  now(),
  now()
) ON CONFLICT (provider, id) DO NOTHING;

-- 3. Insertar al usuario en TU tabla pública de usuarios con el rol 'admin'
INSERT INTO public.users (id, email, name, role, active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo_admin@prepkitchen.com',
  'Admin Demo',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE 
SET role = 'admin', active = true, name = 'Admin Demo';
