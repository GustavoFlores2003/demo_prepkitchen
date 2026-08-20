import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipes, getRecentRecipes } from '../../services/recipeService';
import { getCategories } from '../../services/categoryService';
import { getUsers } from '../../services/userService';
import RecipeCard from '../../components/shared/RecipeCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ recipes: 0, categories: 0, users: 0 });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [recipes, cats, users, recent] = await Promise.all([
          getRecipes(),
          getCategories(),
          getUsers(),
          getRecentRecipes(5),
        ]);
        setStats({
          recipes: recipes.length,
          categories: cats.length,
          users: users.length,
        });
        setRecentRecipes(recent);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner text="Cargando dashboard..." />;

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statValue}>{stats.recipes}</div>
          <div className={styles.statLabel}>Recetas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📁</div>
          <div className={styles.statValue}>{stats.categories}</div>
          <div className={styles.statLabel}>Categorías</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statValue}>{stats.users}</div>
          <div className={styles.statLabel}>Usuarios</div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimas actualizaciones</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/recipes')}
          >
            Ver todas
          </Button>
        </div>
        <div className={styles.recentList}>
          {recentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={(id) => navigate(`/admin/recipes/${id}/edit`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
