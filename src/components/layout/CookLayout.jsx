import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../ui/SearchBar';
import DemoBanner from './DemoBanner';
import styles from './CookLayout.module.css';

export default function CookLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  function handleSearch(query) {
    if (query) {
      navigate(`/cook/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <DemoBanner />
      <div className={styles.layout}>
        <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/cook/dashboard" className={styles.logo}>
            <span className={styles.logoIcon}>👨‍🍳</span>
            <span className={styles.logoText}>Demo Kitchen</span>
          </Link>

          <div className={styles.searchWrapper}>
            <SearchBar
              placeholder="Buscar recetas o ingredientes..."
              onSearch={handleSearch}
            />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userBtn}>
              <div className={styles.avatar}>{initials}</div>
              <span className={styles.userName}>{profile?.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={signOut}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
    </>
  );
}
