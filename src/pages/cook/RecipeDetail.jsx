import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById } from '../../services/recipeService';
import IngredientList from '../../components/shared/IngredientList';
import StepList from '../../components/shared/StepList';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import styles from './RecipeDetail.module.css';

function isRecent(dateStr) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (err) {
        console.error('Error loading recipe:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <Spinner text="Cargando receta..." />;
  if (!recipe) return <div>Receta no encontrada</div>;

  const recent = isRecent(recipe.updated_at);

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
      </div>

      <div className={styles.header}>
        <div className={styles.category}>
          {recipe.categories?.icon} {recipe.categories?.name}
        </div>
        <h1 className={styles.title}>{recipe.name}</h1>
        <div className={styles.metaRow}>
          {recipe.shelf_life && (
            <span className={styles.metaItem}>
              <span className={styles.metaIcon}>⏱</span>
              Vida útil: {recipe.shelf_life} {recipe.shelf_life_unit}
            </span>
          )}
          {recipe.storage && (
            <span className={styles.metaItem}>
              <span className={styles.metaIcon}>🗄️</span>
              {recipe.storage}
            </span>
          )}
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>📅</span>
            {formatDate(recipe.updated_at)}
          </span>
        </div>
      </div>

      {recent && (
        <div className={styles.recentBanner}>
          🔄 Esta receta fue actualizada recientemente
          {recipe.updated_by_user?.name && ` por ${recipe.updated_by_user.name}`}
        </div>
      )}

      {recipe.recipe_ingredients?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🧂 Ingredientes</h2>
          <div className={styles.card}>
            <IngredientList ingredients={recipe.recipe_ingredients} />
          </div>
        </section>
      )}

      {recipe.recipe_steps?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>👨‍🍳 Preparación</h2>
          <div className={styles.card}>
            <StepList steps={recipe.recipe_steps} />
          </div>
        </section>
      )}
    </div>
  );
}
