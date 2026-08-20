import styles from './CategoryCard.module.css';

export default function CategoryCard({ category, onClick }) {
  const recipeCount = category.recipes?.[0]?.count ?? 0;

  return (
    <div className={styles.card} onClick={() => onClick?.(category.id)}>
      <span className={styles.icon}>{category.icon || '📦'}</span>
      <span className={styles.name}>{category.name}</span>
      <span className={styles.count}>
        {recipeCount} {recipeCount === 1 ? 'receta' : 'recetas'}
      </span>
    </div>
  );
}
