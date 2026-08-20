import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchRecipes } from '../../services/recipeService';
import RecipeCard from '../../components/shared/RecipeCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function search() {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchRecipes(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [query]);

  function handleSearch(newQuery) {
    if (newQuery) {
      navigate(`/cook/search?q=${encodeURIComponent(newQuery)}`, { replace: true });
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '600px' }}>
        <SearchBar
          large
          placeholder="Buscar por nombre o ingrediente..."
          onSearch={handleSearch}
          initialValue={query}
        />
      </div>

      {query && (
        <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
          {loading
            ? 'Buscando...'
            : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`}
        </p>
      )}

      {loading ? (
        <Spinner text="Buscando..." />
      ) : results.length === 0 && query ? (
        <EmptyState
          icon="🔍"
          title="Sin resultados"
          description={`No se encontraron recetas para "${query}". Intenta con otro término.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {results.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={(id) => navigate(`/cook/recipe/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
