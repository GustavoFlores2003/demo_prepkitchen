-- Creación de la tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cocinero',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de la tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de la tabla de recetas
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  shelf_life NUMERIC,
  shelf_life_unit TEXT,
  storage TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de la tabla de ingredientes de recetas
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient TEXT NOT NULL,
  quantity TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de la tabla de pasos de recetas
CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de la tabla de historial de recetas
CREATE TABLE recipe_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS (Row Level Security) - Habilitar para todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_history ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad muy básicas para desarrollo (idealmente deberías restringirlas)
CREATE POLICY "Permitir todo a usuarios autenticados en users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en recipes" ON recipes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en recipe_ingredients" ON recipe_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en recipe_steps" ON recipe_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en recipe_history" ON recipe_history FOR ALL USING (auth.role() = 'authenticated');

-- Opcional: Insertar datos genéricos de demostración para Categorías
INSERT INTO categories (name, icon) VALUES 
  ('Salsas Base', 'Droplet'),
  ('Cortes de Carne', 'Beef'),
  ('Vegetales Prep', 'Carrot'),
  ('Masas', 'Pizza');

-- (Nota: No se insertan usuarios aquí porque dependen de auth.users de Supabase Auth)
-- (Nota: No se insertan recetas porque dependen de un user_id y category_id válidos)
