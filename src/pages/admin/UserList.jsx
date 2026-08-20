import { useState, useEffect } from 'react';
import { getUsers, toggleUserActive, createUser } from '../../services/userService';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { ROLES } from '../../lib/constants';

const tableWrapStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-sm)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle = {
  textAlign: 'left',
  padding: 'var(--space-md) var(--space-lg)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
};

const tdStyle = {
  padding: 'var(--space-md) var(--space-lg)',
  borderBottom: '1px solid var(--color-border)',
  fontSize: 'var(--font-size-sm)',
};

const formStyle = {
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  padding: 'var(--space-lg)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  marginBottom: 'var(--space-lg)',
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'cocinero' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(user) {
    try {
      await toggleUserActive(user.id, !user.active);
      await loadUsers();
    } catch (err) {
      console.error('Error toggling user:', err);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (newUser.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await createUser(newUser.email, newUser.password, newUser.name, newUser.role);
      setNewUser({ name: '', email: '', password: '', role: 'cocinero' });
      setShowForm(false);
      setSuccessMessage('El cocinero fue creado correctamente.');
      await loadUsers();
      
      // Limpiar mensaje de éxito después de unos segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  if (loading) return <Spinner text="Cargando usuarios..." />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-lg)' }}>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </Button>
      </div>

      {successMessage && (
        <div style={{ marginBottom: 'var(--space-lg)', padding: '12px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', border: '1px solid #10B981' }}>
          ✅ {successMessage}
        </div>
      )}

      {showForm && (
        <form style={formStyle} onSubmit={handleCreateUser}>
          {error && (
            <div style={{ width: '100%', background: 'var(--color-danger-light)', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: 'var(--font-size-sm)' }}>
              {error}
            </div>
          )}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <Input
              label="Nombre"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="juan@prepkitchen.cl"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <Input
              label="Contraseña temporal"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="••••••"
              required
            />
          </div>
          <div style={{ minWidth: '130px' }}>
            <Select
              label="Rol"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="cocinero">Cocinero</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creando...' : 'Crear'}
          </Button>
        </form>
      )}

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Creado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <Badge variant={u.role === 'admin' ? 'primary' : 'default'}>
                    {u.role === 'admin' ? 'Admin' : 'Cocinero'}
                  </Badge>
                </td>
                <td style={tdStyle}>
                  <Badge variant={u.active ? 'success' : 'danger'}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td style={tdStyle}>{formatDate(u.created_at)}</td>
                <td style={tdStyle}>
                  <Button
                    variant={u.active ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleActive(u)}
                  >
                    {u.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
