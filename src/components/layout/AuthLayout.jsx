import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>👨‍🍳</div>
          <h1 className={styles.logoTitle}>Demo Kitchen</h1>
          <p className={styles.logoSub}>Gestión de preparaciones</p>
        </div>
        {children}
      </div>
    </div>
  );
}
