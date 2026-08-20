import styles from './RecipeCard.module.css';

function isRecent(dateStr) {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function RecipeCard({ recipe, onClick }) {
  const recent = isRecent(recipe.updated_at);
  const categoryIcon = recipe.categories?.icon || '📦';

  return (
    <div className={styles.card} onClick={() => onClick?.(recipe.id)}>
      <span className={styles.icon}>{categoryIcon}</span>

      <div className={styles.info}>
        <div className={styles.name}>{recipe.name}</div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            {recipe.categories?.name}
          </span>
          {recipe.shelf_life && (
            <span className={styles.metaItem}>
              ⏱ {recipe.shelf_life} {recipe.shelf_life_unit}
            </span>
          )}
          {recent && (
            <span className={styles.recentBadge}>
              🔄 Actualizada
            </span>
          )}
        </div>
        {recipe.matchedIngredient && (
          <div className={styles.matchInfo}>
            Contiene: {recipe.matchedIngredient}
          </div>
        )}
      </div>

      <span className={styles.arrow}>›</span>
    </div>
  );
}
