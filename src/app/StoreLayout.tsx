import { Suspense } from 'react';
import { Loading } from '../shared/ui';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Leaf, Mail, MapPin, Phone, ShoppingBasket, UserRound } from 'lucide-react';
import { useAuth } from '../features/account/state/AuthContext';
import { useCart } from '../features/cart/state/CartContext';
import { StoreMobileNav } from './StoreMobileNav';
import { NotificationBell } from '../features/notifications/components/NotificationBell';

export function StoreLayout() {
  const { user } = useAuth();
  const { items } = useCart();
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
            <img src="/brand-mark.svg" width="40" height="40" alt="" />
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
            <Link
              to="/shporta"
              className="cart-button"
              aria-label={`Shporta, ${items.length} produkte`}
            >
              <ShoppingBasket size={21} strokeWidth={1.75} />
              <span>Shporta</span>
              {items.length > 0 && (
                <b aria-hidden="true">{items.length > 99 ? '99+' : items.length}</b>
              )}
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
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="store-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <img src="/brand-mark.svg" width="42" height="42" alt="" />
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
          <div className="footer-contact">
            <span className="eyebrow">LLOGARIA & KONTAKTI</span>
            <Link to="/llogaria">
              Llogaria ime <ArrowUpRight size={15} />
            </Link>
            {user?.isAdmin && (
              <Link to="/admin">
                Paneli i administrimit <ArrowUpRight size={15} />
              </Link>
            )}
            <a href="tel:+38349194677">
              <Phone size={15} /> +383 49 194 677
            </a>
            <a href="mailto:adrianmehaj123@gmail.com">
              <Mail size={15} /> adrianmehaj123@gmail.com
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Skenderaj%2C%20Kosovo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Skenderaj — hape në Google Maps"
            >
              <MapPin size={15} /> Skenderaj
              <ArrowUpRight size={13} />
            </a>
            <p className="footer-contact-note">Për çdo porosi, ju kontaktojmë për konfirmim.</p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} Tryeza - Produkte Bio · Adrian Mehaj. Të gjitha të drejtat
            e rezervuara.
          </span>
        </div>
      </footer>
    </div>
  );
}
