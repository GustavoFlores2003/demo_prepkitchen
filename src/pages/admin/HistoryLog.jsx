import { useState, useEffect } from 'react';
import { getHistory } from '../../services/historyService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

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

const CHANGE_BADGE = {
  creada: { variant: 'success', label: 'Creada' },
  editada: { variant: 'accent', label: 'Editada' },
  eliminada: { variant: 'danger', label: 'Eliminada' },
};

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHistory({ limit: 100 });
        setHistory(data);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) return <Spinner text="Cargando historial..." />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon="📜"
        title="Sin historial"
        description="Los cambios en recetas aparecerán aquí."
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Receta</th>
              <th style={thStyle}>Acción</th>
              <th style={thStyle}>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => {
              const badge = CHANGE_BADGE[entry.change_type] || CHANGE_BADGE.editada;
              return (
                <tr key={entry.id}>
                  <td style={tdStyle}>{formatDate(entry.created_at)}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {entry.recipes?.name || 'Receta eliminada'}
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </td>
                  <td style={tdStyle}>{entry.users?.name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
