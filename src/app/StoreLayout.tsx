import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Leaf, Phone, ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '../features/account/state/AuthContext';
import { useCart } from '../features/cart/state/CartContext';
import { useResource } from '../shared/api';
import type { Business } from '../shared/types';
import { StoreMobileNav } from './StoreMobileNav';
import { NotificationBell } from '../features/notifications/components/NotificationBell';

export function StoreLayout() {
  const { user } = useAuth();
  const { items } = useCart();
  const business = useResource<Business>('/catalog/business');
  const location = useLocation();
  const catalogActive = location.pathname === '/' || location.pathname.startsWith('/produktet/');
  const offersActive =
    location.pathname === '/' && new URLSearchParams(location.search).get('oferta') === '1';
  return (
    <div className="store-layout">
      <StoreMobileNav />
      <header className="store-header-shell">
        <div className="store-header wrap">
          <Link to="/" className="brand">
            <img src="/brand.svg" width="40" height="40" alt="" />
            <span>
              Tryeza<small>PRODUKTE BIO</small>
            </span>
          </Link>
          <nav className="store-nav" aria-label="Navigimi kryesor">
            <Link
              to="/"
              className={catalogActive && !offersActive ? 'active' : undefined}
              aria-current={catalogActive && !offersActive ? 'page' : undefined}
            >
              Produktet
            </Link>
            <Link
              to="/?oferta=1"
              className={offersActive ? 'active' : undefined}
              aria-current={offersActive ? 'page' : undefined}
            >
              Ofertat
            </Link>
            <NavLink to="/si-funksionon" end>
              Si funksionon
            </NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/shporta" className="cart-button">
              <ShoppingBag size={19} />
              <span>Shporta</span>
              <b>{items.length}</b>
            </Link>
            {user && <NotificationBell key={user.id} />}
            <Link
              to={user?.isAdmin ? '/admin/profili' : user ? '/llogaria' : '/hyr'}
              className="account-link"
              aria-label={user ? 'Llogaria ime' : 'Hyr në llogari'}
            >
              <UserRound size={20} />
              <span>{user?.isAdmin ? 'Paneli im' : user ? 'Llogaria ime' : 'Hyr'}</span>
            </Link>
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="store-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <img src="/brand.svg" width="42" height="42" alt="" />
              <span>
                Tryeza<small>PRODUKTE BIO</small>
              </span>
            </Link>
            <p>
              Djathë, qumësht dhe produkte bio për tryezën tuaj. Shije të përditshme, të zgjedhura
              me kujdes.
            </p>
            <span className="footer-leaf">
              <Leaf size={16} /> Pak më afër natyrës.
            </span>
          </div>
          <div>
            <span className="eyebrow">ZBULONI TRYEZËN</span>
            <Link to="/">
              Produktet <ArrowUpRight size={15} />
            </Link>
            <Link to="/?oferta=1">
              Ofertat <ArrowUpRight size={15} />
            </Link>
            <Link to="/si-funksionon">
              Si funksionon <ArrowUpRight size={15} />
            </Link>
          </div>
          <div>
            <span className="eyebrow">LLOGARIA & KONTAKTI</span>
            <Link to="/llogaria">
              Llogaria ime <ArrowUpRight size={15} />
            </Link>
            {user?.isAdmin && (
              <Link to="/admin">
                Paneli i administrimit <ArrowUpRight size={15} />
              </Link>
            )}
            {business.data?.phone && (
              <a href={'tel:' + business.data.phone}>
                <Phone size={15} /> {business.data.phone}
              </a>
            )}
            <p className="footer-contact-note">Për çdo porosi, ju kontaktojmë për konfirmim.</p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} Tryeza - Produkte Bio. Të gjitha të drejtat e rezervuara.
          </span>
        </div>
      </footer>
    </div>
  );
}
