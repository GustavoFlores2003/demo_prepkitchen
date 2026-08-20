-- ============================================
-- PrepKitchen — Database Migration Script
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. TABLES
-- ============================================

-- User profiles (linked to auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'cocinero' CHECK (role IN ('admin', 'cocinero')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📦',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    shelf_life INTEGER,
    shelf_life_unit TEXT CHECK (shelf_life_unit IN ('horas', 'días', 'semanas')),
    storage TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient TEXT NOT NULL,
    quantity TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL
);

CREATE TABLE recipe_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    change_type TEXT NOT NULL CHECK (change_type IN ('creada', 'editada', 'eliminada')),
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES
-- ============================================

CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_updated ON recipes(updated_at DESC);
CREATE INDEX idx_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_ingredients_sort ON recipe_ingredients(recipe_id, sort_order);
CREATE INDEX idx_steps_recipe ON recipe_steps(recipe_id);
CREATE INDEX idx_steps_order ON recipe_steps(recipe_id, step_number);
CREATE INDEX idx_history_recipe ON recipe_history(recipe_id);
CREATE INDEX idx_history_created ON recipe_history(created_at DESC);

-- 3. HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_history ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_admin" ON users
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "users_update_admin" ON users
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- CATEGORIES policies
CREATE POLICY "categories_select" ON categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "categories_insert_admin" ON categories
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "categories_update_admin" ON categories
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "categories_delete_admin" ON categories
    FOR DELETE USING (get_user_role() = 'admin');

-- RECIPES policies
CREATE POLICY "recipes_select" ON recipes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "recipes_insert_admin" ON recipes
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "recipes_update_admin" ON recipes
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "recipes_delete_admin" ON recipes
    FOR DELETE USING (get_user_role() = 'admin');

-- RECIPE_INGREDIENTS policies
CREATE POLICY "ingredients_select" ON recipe_ingredients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "ingredients_insert_admin" ON recipe_ingredients
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "ingredients_update_admin" ON recipe_ingredients
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "ingredients_delete_admin" ON recipe_ingredients
    FOR DELETE USING (get_user_role() = 'admin');

-- RECIPE_STEPS policies
CREATE POLICY "steps_select" ON recipe_steps
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "steps_insert_admin" ON recipe_steps
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "steps_update_admin" ON recipe_steps
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "steps_delete_admin" ON recipe_steps
    FOR DELETE USING (get_user_role() = 'admin');

-- RECIPE_HISTORY policies
CREATE POLICY "history_select_admin" ON recipe_history
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "history_insert_admin" ON recipe_history
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- 5. SEED DATA — Initial Categories
-- ============================================

INSERT INTO categories (name, icon) VALUES
    ('Preparaciones calientes', '🔥'),
    ('Preparaciones frescos / cortes', '🥗'),
    ('Preparaciones proteínas frías', '🍗'),
    ('Preparaciones lácteos', '🧀'),
    ('Preparaciones salsas', '🫙'),
    ('Preparaciones panes', '🍞');

-- 6. TRIGGER — Auto-create user profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'cocinero')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
