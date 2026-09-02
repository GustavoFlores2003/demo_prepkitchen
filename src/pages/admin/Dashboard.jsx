import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipes, getRecentRecipes } from '../../services/recipeService';
import { getCategories } from '../../services/categoryService';
import { getUsers } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RecipeCard from '../../components/shared/RecipeCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ recipes: 0, categories: 0, users: 0 });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

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

  const handleResetDemo = async () => {
    if (!window.confirm('¿Deseas restaurar todos los datos de demostración a su estado original?')) {
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.rpc('reset_demo_data');
      if (error) throw error;
      alert('Datos restaurados correctamente.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error al restaurar los datos demo.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <Spinner text="Cargando dashboard..." />;

  const isDemoAdmin = user?.email === 'demo_admin@prepkitchen.com';

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

      {isDemoAdmin && (
        <section className={styles.section} style={{ backgroundColor: '#fffbe1', padding: '16px', borderRadius: '8px', border: '1px solid #fde047' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: '#854d0e' }}>Entorno Demo</h2>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetDemo}
              disabled={resetting}
            >
              {resetting ? 'Restaurando...' : 'Restaurar datos demo'}
            </Button>
          </div>
          <p style={{ color: '#a16207', fontSize: '14px', margin: 0 }}>
            Puedes reiniciar la base de datos de pruebas a su estado inicial.
          </p>
        </section>
      )}

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
