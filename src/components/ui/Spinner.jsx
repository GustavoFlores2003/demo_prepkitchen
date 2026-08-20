import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', text, fullPage = false }) {
  if (text || fullPage) {
    return (
      <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
        <div className={`${styles.spinner} ${styles[size]}`} />
        {text && <p className={styles.text}>{text}</p>}
      </div>
    );
  }

  return <div className={`${styles.spinner} ${styles[size]}`} />;
}
