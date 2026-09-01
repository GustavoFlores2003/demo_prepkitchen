import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/recipes', icon: '📋', label: 'Recetas' },
  { to: '/admin/categories', icon: '📁', label: 'Categorías' },
  { to: '/admin/users', icon: '👥', label: 'Usuarios' },
  { to: '/admin/history', icon: '📜', label: 'Historial' },
];

function getPageTitle(pathname) {
  const item = NAV_ITEMS.find((i) => pathname.startsWith(i.to));
  if (pathname.includes('/recipes/new')) return 'Nueva Receta';
  if (pathname.includes('/edit')) return 'Editar Receta';
  return item?.label || 'Admin';
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <span className={styles.sidebarIcon}>👨‍🍳</span>
            <span className={styles.sidebarTitle}>Demo Kitchen</span>
            <span className={styles.sidebarBadge}>Admin</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <div className={styles.userName}>{profile?.name}</div>
              <div className={styles.userRole}>Administrador</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <h2 className={styles.pageTitle}>{getPageTitle(location.pathname)}</h2>
          <div />
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
