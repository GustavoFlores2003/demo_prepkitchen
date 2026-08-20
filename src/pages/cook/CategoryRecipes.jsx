import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipes } from '../../services/recipeService';
import { getCategoryById } from '../../services/categoryService';
import RecipeCard from '../../components/shared/RecipeCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function CategoryRecipes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cat, recs] = await Promise.all([
          getCategoryById(id),
          getRecipes({ categoryId: id }),
        ]);
        setCategory(cat);
        setRecipes(recs);
      } catch (err) {
        console.error('Error loading category:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <Spinner text="Cargando recetas..." />;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/cook/dashboard')}>
          ← Volver
        </Button>
      </div>

      <h1 style={{ marginBottom: 'var(--space-sm)' }}>
        {category?.icon} {category?.name}
      </h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
        {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
      </p>

      {recipes.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin recetas"
          description="Aún no hay recetas en esta categoría."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={(recipeId) => navigate(`/cook/recipe/${recipeId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
