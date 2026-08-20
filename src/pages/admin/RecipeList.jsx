import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRecipes, deleteRecipe } from '../../services/recipeService';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import styles from './RecipeList.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
  });
}

export default function RecipeList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      const data = await getRecipes();
      setRecipes(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(query) {
    if (!query) {
      setFiltered(recipes);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        recipes.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.categories?.name?.toLowerCase().includes(q)
        )
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecipe(deleteTarget.id, user.id);
      setDeleteTarget(null);
      loadRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  }

  if (loading) return <Spinner text="Cargando recetas..." />;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchBar placeholder="Buscar recetas..." onSearch={handleSearch} />
        </div>
        <Button
          icon="+"
          onClick={() => navigate('/admin/recipes/new')}
        >
          Nueva Receta
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No hay recetas"
          description="Crea tu primera receta para comenzar."
        >
          <Button onClick={() => navigate('/admin/recipes/new')}>
            Crear Receta
          </Button>
        </EmptyState>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Vida útil</th>
                <th>Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipe) => (
                <tr key={recipe.id}>
                  <td className={styles.recipeName}>{recipe.name}</td>
                  <td>
                    {recipe.categories?.icon} {recipe.categories?.name}
                  </td>
                  <td>
                    {recipe.shelf_life
                      ? `${recipe.shelf_life} ${recipe.shelf_life_unit}`
                      : '—'}
                  </td>
                  <td>{formatDate(recipe.updated_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/cook/recipe/${recipe.id}`)}
                        title="Ver"
                      >
                        👁
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin/recipes/${recipe.id}/edit`)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => setDeleteTarget(recipe)}
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar Receta"
        onConfirm={handleDelete}
        confirmText="Eliminar"
        confirmVariant="danger"
      >
        ¿Estás seguro de que deseas eliminar <strong>{deleteTarget?.name}</strong>?
        Esta acción no se puede deshacer.
      </Modal>
    </div>
  );
}
