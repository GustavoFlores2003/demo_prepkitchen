import { useState, useEffect, useCallback } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({
  placeholder = 'Buscar recetas...',
  onSearch,
  delay = 300,
  large = false,
  initialValue = '',
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value.trim());
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <div className={`${styles.wrapper} ${large ? styles.large : ''}`}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          className={styles.clear}
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  );
}
