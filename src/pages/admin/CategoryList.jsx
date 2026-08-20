import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  padding: 'var(--space-md) var(--space-lg)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
};

const formStyle = {
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'flex-end',
  padding: 'var(--space-lg)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  marginBottom: 'var(--space-lg)',
};

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, { name: name.trim(), icon });
      } else {
        await createCategory({ name: name.trim(), icon });
      }
      setName('');
      setIcon('📦');
      setEditId(null);
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(cat) {
    setEditId(cat.id);
    setName(cat.name);
    setIcon(cat.icon || '📦');
  }

  function cancelEdit() {
    setEditId(null);
    setName('');
    setIcon('📦');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('No se puede eliminar una categoría que tiene recetas asignadas.');
      setDeleteTarget(null);
    }
  }

  if (loading) return <Spinner text="Cargando categorías..." />;

  return (
    <div className="animate-fade-in">
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={{ width: '80px' }}>
          <Input
            label="Ícono"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="📦"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Preparaciones calientes"
            required
          />
        </div>
        <Button type="submit" disabled={saving}>
          {editId ? 'Actualizar' : 'Crear'}
        </Button>
        {editId && (
          <Button variant="ghost" onClick={cancelEdit}>
            Cancelar
          </Button>
        )}
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Sin categorías"
          description="Crea la primera categoría para organizar las recetas."
        />
      ) : (
        <div style={listStyle}>
          {categories.map((cat) => {
            const count = cat.recipes?.[0]?.count ?? 0;
            return (
              <div key={cat.id} style={itemStyle}>
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{cat.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {count} {count === 1 ? 'receta' : 'recetas'}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                  ✏️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(cat)}
                >
                  🗑
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar Categoría"
        onConfirm={handleDelete}
        confirmText="Eliminar"
        confirmVariant="danger"
      >
        ¿Eliminar la categoría <strong>{deleteTarget?.name}</strong>?
        Solo se puede eliminar si no tiene recetas asignadas.
      </Modal>
    </div>
  );
}
