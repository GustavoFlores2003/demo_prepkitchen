import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRecipeById, createRecipe, updateRecipe } from '../../services/recipeService';
import { getCategories } from '../../services/categoryService';
import { Input, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { SHELF_LIFE_UNITS } from '../../lib/constants';
import styles from './RecipeForm.module.css';

const emptyIngredient = { ingredient: '', quantity: '' };
const emptyStep = { instruction: '' };

export default function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    shelf_life: '',
    shelf_life_unit: '',
    storage: '',
  });

  const [ingredients, setIngredients] = useState([{ ...emptyIngredient }]);
  const [steps, setSteps] = useState([{ ...emptyStep }]);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEdit) {
          const recipe = await getRecipeById(id);
          setForm({
            name: recipe.name || '',
            category_id: recipe.category_id || '',
            shelf_life: recipe.shelf_life?.toString() || '',
            shelf_life_unit: recipe.shelf_life_unit || '',
            storage: recipe.storage || '',
          });
          setIngredients(
            recipe.recipe_ingredients?.length
              ? recipe.recipe_ingredients.map((i) => ({
                  ingredient: i.ingredient,
                  quantity: i.quantity || '',
                }))
              : [{ ...emptyIngredient }]
          );
          setSteps(
            recipe.recipe_steps?.length
              ? recipe.recipe_steps.map((s) => ({
                  instruction: s.instruction,
                }))
              : [{ ...emptyStep }]
          );
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Ingredient handlers
  function updateIngredient(index, field, value) {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { ...emptyIngredient }]);
  }

  function removeIngredient(index) {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function moveIngredient(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= ingredients.length) return;
    setIngredients((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIdx]] = [copy[newIdx], copy[index]];
      return copy;
    });
  }

  // Step handlers
  function updateStep(index, value) {
    setSteps((prev) =>
      prev.map((item, i) => (i === index ? { instruction: value } : item))
    );
  }

  function addStep() {
    setSteps((prev) => [...prev, { ...emptyStep }]);
  }

  function removeStep(index) {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function moveStep(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= steps.length) return;
    setSteps((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIdx]] = [copy[newIdx], copy[index]];
      return copy;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!form.category_id) {
      setError('Selecciona una categoría.');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.ingredient.trim());
    const validSteps = steps.filter((s) => s.instruction.trim());

    setSaving(true);
    try {
      const data = {
        ...form,
        shelf_life: form.shelf_life ? parseInt(form.shelf_life, 10) : null,
        ingredients: validIngredients,
        steps: validSteps,
      };

      if (isEdit) {
        await updateRecipe(id, data, user.id);
      } else {
        await createRecipe(data, user.id);
      }

      navigate('/admin/recipes');
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner text="Cargando..." />;

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/recipes')}>
          ← Volver a recetas
        </Button>
      </div>

      <h1 style={{ marginBottom: 'var(--space-xl)' }}>
        {isEdit ? 'Editar Receta' : 'Nueva Receta'}
      </h1>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Basic info */}
        <div className={styles.fieldGroup}>
          <h3 className={styles.fieldGroupTitle}>Información general</h3>
          <div className={styles.fields}>
            <Input
              id="name"
              label="Nombre de la receta"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Ej: Huevos revueltos"
              required
            />

            <Select
              id="category"
              label="Categoría"
              value={form.category_id}
              onChange={(e) => updateForm('category_id', e.target.value)}
              required
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Select>

            <div className={styles.row}>
              <Input
                id="shelf_life"
                label="Vida útil"
                type="number"
                min="0"
                value={form.shelf_life}
                onChange={(e) => updateForm('shelf_life', e.target.value)}
                placeholder="Ej: 3"
              />
              <Select
                id="shelf_life_unit"
                label="Unidad"
                value={form.shelf_life_unit}
                onChange={(e) => updateForm('shelf_life_unit', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {SHELF_LIFE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </Select>
            </div>

            <Input
              id="storage"
              label="Almacenamiento"
              value={form.storage}
              onChange={(e) => updateForm('storage', e.target.value)}
              placeholder="Ej: Refrigeración 4°C"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className={styles.fieldGroup}>
          <h3 className={styles.fieldGroupTitle}>🧂 Ingredientes</h3>
          <div className={styles.fields}>
            {ingredients.map((ing, index) => (
              <div key={index} className={styles.listItem}>
                <div className={styles.fieldFlex}>
                  <Input
                    placeholder="Ingrediente"
                    value={ing.ingredient}
                    onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                  />
                </div>
                <div className={styles.fieldFlex}>
                  <Input
                    placeholder="Cantidad"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveIngredient(index, -1)}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveIngredient(index, 1)}
                    disabled={index === ingredients.length - 1}
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length <= 1}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={styles.addBtn}
              onClick={addIngredient}
              icon="+"
            >
              Agregar ingrediente
            </Button>
          </div>
        </div>

        {/* Steps */}
        <div className={styles.fieldGroup}>
          <h3 className={styles.fieldGroupTitle}>👨‍🍳 Preparación</h3>
          <div className={styles.fields}>
            {steps.map((step, index) => (
              <div key={index} className={styles.listItem}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', minWidth: '28px' }}>
                  {index + 1}.
                </span>
                <div className={styles.fieldFlex}>
                  <Input
                    placeholder={`Paso ${index + 1}...`}
                    value={step.instruction}
                    onChange={(e) => updateStep(index, e.target.value)}
                  />
                </div>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => removeStep(index)}
                    disabled={steps.length <= 1}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={styles.addBtn}
              onClick={addStep}
              icon="+"
            >
              Agregar paso
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.footer}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/recipes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Guardando...'
              : isEdit
              ? 'Guardar cambios'
              : 'Crear receta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
