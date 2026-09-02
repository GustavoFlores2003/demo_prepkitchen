-- 1. Identificar Datos Demo
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- 2. Limpiar políticas existentes
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en users" ON users;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en categories" ON categories;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en recipes" ON recipes;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en recipe_ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en recipe_steps" ON recipe_steps;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en recipe_history" ON recipe_history;

-- 3. Trigger para forzar is_demo = true si el usuario es demo_admin
CREATE OR REPLACE FUNCTION set_demo_flag() RETURNS TRIGGER AS $$
BEGIN
  IF auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' THEN
    NEW.is_demo = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_categories_demo ON categories;
CREATE TRIGGER tr_categories_demo BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_demo_flag();

DROP TRIGGER IF EXISTS tr_recipes_demo ON recipes;
CREATE TRIGGER tr_recipes_demo BEFORE INSERT OR UPDATE ON recipes
FOR EACH ROW EXECUTE FUNCTION set_demo_flag();

-- 4. Nuevas Políticas RLS Seguras

-- USERS: Todos pueden leer (para mostrar nombres en historial, etc).
DROP POLICY IF EXISTS "Users: Select" ON users;
CREATE POLICY "Users: Select" ON users FOR SELECT USING (auth.role() = 'authenticated');

-- USERS: Demo no puede insertar, actualizar ni borrar. Solo los admins reales pueden.
DROP POLICY IF EXISTS "Users: Modificaciones Admin" ON users;
DROP POLICY IF EXISTS "Users: Insert Admin" ON users;
CREATE POLICY "Users: Insert Admin" ON users FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users: Update Admin" ON users;
CREATE POLICY "Users: Update Admin" ON users FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users: Delete Admin" ON users;
CREATE POLICY "Users: Delete Admin" ON users FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- CATEGORIES:
DROP POLICY IF EXISTS "Categories: Select" ON categories;
CREATE POLICY "Categories: Select" ON categories FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories: Admin Real" ON categories;
CREATE POLICY "Categories: Admin Real" ON categories AS PERMISSIVE FOR ALL USING (
  auth.role() = 'authenticated' AND 
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Categories: Demo Admin" ON categories;
CREATE POLICY "Categories: Demo Admin" ON categories AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' AND is_demo = true
);

-- RECIPES:
DROP POLICY IF EXISTS "Recipes: Select" ON recipes;
CREATE POLICY "Recipes: Select" ON recipes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Recipes: Admin Real" ON recipes;
CREATE POLICY "Recipes: Admin Real" ON recipes AS PERMISSIVE FOR ALL USING (
  auth.role() = 'authenticated' AND 
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Recipes: Demo Admin" ON recipes;
CREATE POLICY "Recipes: Demo Admin" ON recipes AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' AND is_demo = true
);

-- RECIPE_INGREDIENTS, STEPS, HISTORY:
DROP POLICY IF EXISTS "Deps: Select" ON recipe_ingredients;
CREATE POLICY "Deps: Select" ON recipe_ingredients FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Deps: Select Steps" ON recipe_steps;
CREATE POLICY "Deps: Select Steps" ON recipe_steps FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Deps: Select Hist" ON recipe_history;
CREATE POLICY "Deps: Select Hist" ON recipe_history FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Deps: Admin Real Ing" ON recipe_ingredients;
CREATE POLICY "Deps: Admin Real Ing" ON recipe_ingredients AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Deps: Admin Real Steps" ON recipe_steps;
CREATE POLICY "Deps: Admin Real Steps" ON recipe_steps AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Deps: Admin Real Hist" ON recipe_history;
CREATE POLICY "Deps: Admin Real Hist" ON recipe_history AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Deps: Demo Admin Ing" ON recipe_ingredients;
CREATE POLICY "Deps: Demo Admin Ing" ON recipe_ingredients AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' AND 
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND is_demo = true)
);
DROP POLICY IF EXISTS "Deps: Demo Admin Steps" ON recipe_steps;
CREATE POLICY "Deps: Demo Admin Steps" ON recipe_steps AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' AND 
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_steps.recipe_id AND is_demo = true)
);
DROP POLICY IF EXISTS "Deps: Demo Admin Hist" ON recipe_history;
CREATE POLICY "Deps: Demo Admin Hist" ON recipe_history AS PERMISSIVE FOR ALL USING (
  auth.jwt()->>'email' = 'demo_admin@prepkitchen.com' AND 
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_history.recipe_id AND is_demo = true)
);

-- 5. Función de Restauración (Reset)
CREATE OR REPLACE FUNCTION reset_demo_data() RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_cat_salsas UUID := '00000000-0000-0000-0000-000000000001';
  v_cat_carnes UUID := '00000000-0000-0000-0000-000000000002';
  v_cat_vegetales UUID := '00000000-0000-0000-0000-000000000003';
  v_cat_masas UUID := '00000000-0000-0000-0000-000000000004';
  v_cat_postres UUID := '00000000-0000-0000-0000-000000000005';
  v_recipe_pomodoro UUID := '00000000-0000-0000-0000-000000000010';
  v_recipe_bechamel UUID := '00000000-0000-0000-0000-000000000011';
  v_recipe_pollo UUID := '00000000-0000-0000-0000-000000000012';
  v_recipe_carne UUID := '00000000-0000-0000-0000-000000000013';
  v_recipe_veg UUID := '00000000-0000-0000-0000-000000000014';
  v_recipe_pizza UUID := '00000000-0000-0000-0000-000000000015';
  v_recipe_brownie UUID := '00000000-0000-0000-0000-000000000016';
BEGIN
  -- Validar si se ejecuta desde frontend (RPC) que sea el admin demo u otro admin
  IF auth.role() = 'authenticated' THEN
    IF auth.jwt()->>'email' != 'demo_admin@prepkitchen.com' AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'No autorizado para restaurar datos demo';
    END IF;
  END IF;

  -- Limpiar datos demo (Las cascadas limpiarán ingredients, steps y history)
  DELETE FROM recipes WHERE is_demo = true;
  DELETE FROM categories WHERE is_demo = true;

  -- Obtener el usuario demo (debe existir)
  SELECT id INTO v_user_id FROM public.users WHERE email = 'demo_admin@prepkitchen.com' LIMIT 1;

  -- Recrear categorías demo
  INSERT INTO categories (id, name, icon, is_demo) VALUES
    (v_cat_salsas, 'Salsas Base', 'Droplet', true),
    (v_cat_carnes, 'Carnes', 'Beef', true),
    (v_cat_vegetales, 'Vegetales', 'Carrot', true),
    (v_cat_masas, 'Masas', 'Pizza', true),
    (v_cat_postres, 'Postres', 'Cake', true);

  -- Recrear recetas demo
  IF v_user_id IS NOT NULL THEN
    INSERT INTO recipes (id, name, category_id, shelf_life, shelf_life_unit, storage, updated_by, is_demo) VALUES
      (v_recipe_pomodoro, 'Salsa Pomodoro', v_cat_salsas, 3, 'días', 'Refrigeración (Cámara 1)', v_user_id, true),
      (v_recipe_bechamel, 'Salsa Bechamel', v_cat_salsas, 2, 'días', 'Refrigeración (Cámara 1)', v_user_id, true),
      (v_recipe_pollo, 'Pollo Marinado', v_cat_carnes, 4, 'días', 'Cámara de Carnes', v_user_id, true),
      (v_recipe_carne, 'Carne Mechada', v_cat_carnes, 5, 'días', 'Envasado al vacío', v_user_id, true),
      (v_recipe_veg, 'Vegetales Asados', v_cat_vegetales, 2, 'días', 'Contenedores herméticos', v_user_id, true),
      (v_recipe_pizza, 'Masa de Pizza', v_cat_masas, 24, 'horas', 'Bandejas tapadas, refrigeración', v_user_id, true),
      (v_recipe_brownie, 'Brownie de Chocolate', v_cat_postres, 5, 'días', 'Temperatura ambiente tapado', v_user_id, true);

    -- Ingredientes
    INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, sort_order) VALUES
      (v_recipe_pomodoro, 'Tomates pera triturados', '5 kg', 0),
      (v_recipe_pomodoro, 'Cebolla blanca brunoise', '500 g', 1),
      (v_recipe_pomodoro, 'Ajo picado', '50 g', 2),
      (v_recipe_pomodoro, 'Aceite de oliva', '100 ml', 3),
      (v_recipe_pomodoro, 'Albahaca fresca', '1 atado', 4),
      
      (v_recipe_bechamel, 'Mantequilla', '100 g', 0),
      (v_recipe_bechamel, 'Harina de trigo', '100 g', 1),
      (v_recipe_bechamel, 'Leche entera', '1 L', 2),
      (v_recipe_bechamel, 'Nuez moscada', 'Pizca', 3),

      (v_recipe_pollo, 'Pechuga de pollo', '2 kg', 0),
      (v_recipe_pollo, 'Salsa de soja', '200 ml', 1),
      (v_recipe_pollo, 'Jengibre rallado', '30 g', 2),
      
      (v_recipe_carne, 'Carne para desmechar (Falda)', '3 kg', 0),
      (v_recipe_carne, 'Cebolla', '1 kg', 1),
      (v_recipe_carne, 'Pimentón rojo', '500 g', 2),
      (v_recipe_carne, 'Ajo', '5 dientes', 3),

      (v_recipe_veg, 'Calabacín', '1 kg', 0),
      (v_recipe_veg, 'Berenjena', '1 kg', 1),
      (v_recipe_veg, 'Pimiento', '500 g', 2),
      (v_recipe_veg, 'Aceite de oliva', '150 ml', 3),
      
      (v_recipe_pizza, 'Harina 00', '1 kg', 0),
      (v_recipe_pizza, 'Agua tibia', '600 ml', 1),
      (v_recipe_pizza, 'Levadura fresca', '15 g', 2),
      (v_recipe_pizza, 'Sal', '25 g', 3),
      
      (v_recipe_brownie, 'Chocolate cobertura', '500 g', 0),
      (v_recipe_brownie, 'Mantequilla', '250 g', 1),
      (v_recipe_brownie, 'Azúcar', '400 g', 2),
      (v_recipe_brownie, 'Huevos', '6 unid', 3),
      (v_recipe_brownie, 'Harina', '150 g', 4);

    -- Pasos
    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
      (v_recipe_pomodoro, 1, 'Sofreír cebolla y ajo en aceite de oliva a fuego medio hasta pochar.'),
      (v_recipe_pomodoro, 2, 'Añadir los tomates triturados y mezclar bien.'),
      (v_recipe_pomodoro, 3, 'Cocinar a fuego bajo por 45 minutos removiendo constantemente.'),
      (v_recipe_pomodoro, 4, 'Añadir la albahaca en los últimos 5 minutos, rectificar sal y pimienta.'),
      
      (v_recipe_bechamel, 1, 'Derretir la mantequilla a fuego medio.'),
      (v_recipe_bechamel, 2, 'Añadir la harina y cocinar por 2 minutos formando un roux.'),
      (v_recipe_bechamel, 3, 'Incorporar la leche tibia poco a poco sin dejar de batir.'),
      (v_recipe_bechamel, 4, 'Cocinar hasta espesar, sazonar con sal, pimienta y nuez moscada.'),
      
      (v_recipe_pollo, 1, 'Limpiar las pechugas y cortarlas en cubos de 3x3 cm.'),
      (v_recipe_pollo, 2, 'Mezclar la salsa de soja con el jengibre rallado.'),
      (v_recipe_pollo, 3, 'Mezclar el pollo con la marinada y envasar al vacío.'),
      
      (v_recipe_carne, 1, 'Sellar la carne a fuego alto.'),
      (v_recipe_carne, 2, 'Sofreír los vegetales picados finamente.'),
      (v_recipe_carne, 3, 'Cocinar la carne junto con el sofrito y agua suficiente a presión por 1h.'),
      (v_recipe_carne, 4, 'Desmechar la carne una vez fría e incorporar de nuevo a la salsa.'),
      
      (v_recipe_veg, 1, 'Cortar los vegetales en rodajas o trozos parejos.'),
      (v_recipe_veg, 2, 'Mezclar con aceite de oliva, sal y pimienta.'),
      (v_recipe_veg, 3, 'Asar en horno a 200°C por 20 minutos hasta dorar.'),
      
      (v_recipe_pizza, 1, 'Disolver la levadura en el agua tibia.'),
      (v_recipe_pizza, 2, 'Mezclar la harina con la sal formando una corona.'),
      (v_recipe_pizza, 3, 'Verter el agua en el centro e integrar hasta formar una masa homogénea.'),
      (v_recipe_pizza, 4, 'Amasar por 10 minutos y dejar leudar 24h en refrigeración.'),
      
      (v_recipe_brownie, 1, 'Derretir el chocolate junto con la mantequilla a baño maría.'),
      (v_recipe_brownie, 2, 'Batir los huevos con el azúcar hasta blanquear ligeramente.'),
      (v_recipe_brownie, 3, 'Integrar la mezcla de chocolate a los huevos.'),
      (v_recipe_brownie, 4, 'Incorporar la harina con movimientos envolventes.'),
      (v_recipe_brownie, 5, 'Hornear a 180°C por 25-30 minutos en molde enmantecado.');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar la función por primera vez para tener los datos
SELECT reset_demo_data();

-- 6. Configurar pg_cron
-- Requiere que la extensión esté habilitada en Supabase (Database -> Extensions -> pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  -- Intenta remover el cron job anterior si existía para evitar duplicados
  PERFORM cron.unschedule('reset_demo_every_30_mins');
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar si no existe
END $$;

-- Programar el job para que se ejecute cada 30 minutos
SELECT cron.schedule('reset_demo_every_30_mins', '*/30 * * * *', 'SELECT reset_demo_data();');
