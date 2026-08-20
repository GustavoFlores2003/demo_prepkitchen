import styles from './Input.module.css';

export function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          id={id}
          type={type}
          className={styles.input}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  id,
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select
        id={id}
        className={`${styles.input} ${styles.select}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
