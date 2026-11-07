import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export function AdminSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue(
      location.pathname === '/admin/raportet'
        ? (new URLSearchParams(location.search).get('search') ?? '')
        : ''
    );
  }, [location.pathname, location.search]);
  return (
    <div className="admin-search-bar">
      <form
        role="search"
        className="admin-global-search"
        onSubmit={(event) => {
          event.preventDefault();
          const search = value.trim();
          navigate('/admin/raportet' + (search ? '?search=' + encodeURIComponent(search) : ''));
        }}
      >
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          aria-label="Kërko klientin ose telefonin në raportet financiare"
          placeholder="Kërko klientin ose telefonin…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {value && (
          <button
            type="button"
            className="admin-search-clear"
            aria-label="Fshij kërkimin"
            onClick={() => setValue('')}
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" className="admin-search-submit">
          Kërko
        </button>
      </form>
      <span className="admin-search-caption">
        Tryeza <span>/</span> Administrimi
      </span>
    </div>
  );
}
