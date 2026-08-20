import styles from './Card.module.css';

export default function Card({
  children,
  onClick,
  padding = true,
  className = '',
  header,
}) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${padding ? styles.padding : ''} ${className}`}
      onClick={onClick}
    >
      {header && <div className={styles.header}>{header}</div>}
      {children}
    </div>
  );
}
