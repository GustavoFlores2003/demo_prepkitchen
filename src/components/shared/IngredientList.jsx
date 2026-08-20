import styles from './IngredientList.module.css';

export default function IngredientList({ ingredients = [] }) {
  if (!ingredients.length) return null;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Ingrediente</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {ingredients.map((ing) => (
          <tr key={ing.id || ing.ingredient}>
            <td className={styles.ingredient}>{ing.ingredient}</td>
            <td className={styles.quantity}>{ing.quantity || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
