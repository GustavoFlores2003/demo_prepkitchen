import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCategories } from '../../services/categoryService';
import { getRecentRecipes } from '../../services/recipeService';
import CategoryCard from '../../components/shared/CategoryCard';
import RecipeCard from '../../components/shared/RecipeCard';
import Spinner from '../../components/ui/Spinner';
import styles from './Dashboard.module.css';

export default function CookDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, recent] = await Promise.all([
          getCategories(),
          getRecentRecipes(8),
        ]);
        setCategories(cats);
        setRecentRecipes(recent);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <Spinner text="Cargando..." />;
  }

  const firstName = profile?.name?.split(' ')[0] || 'Chef';

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>¡Hola, {firstName}! 👋</h1>
        <p className={styles.greetingSub}>
          Consulta las preparaciones actualizadas
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categorías</h2>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={(id) => navigate(`/cook/category/${id}`)}
            />
          ))}
        </div>
      </section>

      {recentRecipes.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Actualizadas recientemente</h2>
          </div>
          <div className={styles.recipeList}>
            {recentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={(id) => navigate(`/cook/recipe/${id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
