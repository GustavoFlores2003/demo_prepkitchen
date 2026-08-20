import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROLES } from './lib/constants';
import Spinner from './components/ui/Spinner';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import CookLayout from './components/layout/CookLayout';

// Auth
import Login from './pages/auth/Login';

// Cook pages
import CookDashboard from './pages/cook/Dashboard';
import CategoryRecipes from './pages/cook/CategoryRecipes';
import RecipeDetail from './pages/cook/RecipeDetail';
import SearchResults from './pages/cook/SearchResults';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import RecipeList from './pages/admin/RecipeList';
import RecipeForm from './pages/admin/RecipeForm';
import CategoryList from './pages/admin/CategoryList';
import UserList from './pages/admin/UserList';
import HistoryLog from './pages/admin/HistoryLog';

// Route guard: requires authentication
function ProtectedRoute() {
  const { session, profile, loading, isActive } = useAuth();

  if (loading) {
    return <Spinner fullPage text="Cargando..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !isActive) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div>
          <h2>Cuenta desactivada</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Tu cuenta ha sido desactivada. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// Route guard: requires admin role
function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage text="Cargando..." />;
  }

  if (!isAdmin) {
    return <Navigate to="/cook/dashboard" replace />;
  }

  return <AdminLayout />;
}

// Route guard: requires cook role (or admin previewing)
function CookRoute() {
  const { loading } = useAuth();

  if (loading) {
    return <Spinner fullPage text="Cargando..." />;
  }

  return <CookLayout />;
}

// Root redirect based on role
function RootRedirect() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) return <Spinner fullPage text="Cargando..." />;
  if (!session) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/cook/dashboard" replace />;
}

// Login redirect if already authenticated
function LoginRoute() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) return <Spinner fullPage text="Cargando..." />;
  if (session) {
    return isAdmin
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/cook/dashboard" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginRoute />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="recipes" element={<RecipeList />} />
              <Route path="recipes/new" element={<RecipeForm />} />
              <Route path="recipes/:id/edit" element={<RecipeForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="users" element={<UserList />} />
              <Route path="history" element={<HistoryLog />} />
            </Route>

            {/* Cook routes (admins can also access for preview) */}
            <Route path="/cook" element={<CookRoute />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CookDashboard />} />
              <Route path="category/:id" element={<CategoryRecipes />} />
              <Route path="recipe/:id" element={<RecipeDetail />} />
              <Route path="search" element={<SearchResults />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
