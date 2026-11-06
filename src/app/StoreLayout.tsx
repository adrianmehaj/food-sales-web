import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Leaf, LogOut, MapPin, ShoppingBag, Truck, UserRound } from 'lucide-react';
import { useAuth } from '../features/account/AuthContext';
import { useCart } from '../features/cart/CartContext';
import { useToast } from '../shared/ui';
import { useResource } from '../shared/api';
import type { Business } from '../shared/types';
import { StoreMobileNav } from './StoreMobileNav';

export function StoreLayout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const toast = useToast();
  const business = useResource<Business>('/catalog/business');
  const location = useLocation();
  const catalogActive = location.pathname === '/';
  const offersActive = catalogActive && new URLSearchParams(location.search).get('oferta') === '1';
  return <div className="store-layout"><StoreMobileNav />
    <div className="delivery-strip"><Truck size={15} /><span>Dërgesë falas në Skenderaj</span><span className="strip-dot">·</span><span>Ose merreni vetë, kur të jetë gati</span></div>
    <header className="store-header wrap">
      <Link to="/" className="brand"><img src="/brand.svg" width="40" height="40" alt="" /><span>{business.data?.name ?? 'Tryeza'}<small>PAK MË AFËR NATYRËS</small></span></Link>
      <nav className="store-nav" aria-label="Navigimi kryesor">
        <Link to="/" className={catalogActive && !offersActive ? 'active' : undefined} aria-current={catalogActive && !offersActive ? 'page' : undefined}>Produktet</Link>
        <Link to="/?oferta=1" className={'offers-link' + (offersActive ? ' active' : '')} aria-current={offersActive ? 'page' : undefined}>Ofertat <span className="nav-dot" aria-hidden="true" /></Link>
        <NavLink to="/si-funksionon" end>Si funksionon</NavLink>
      </nav>
      <div className="header-actions">
        <Link to="/shporta" className="cart-button"><ShoppingBag size={19} /><span>Shporta</span><b>{items.length}</b></Link>
        <Link to={user?.isAdmin ? '/admin/profili' : '/llogaria'} className="account-link" aria-label={user?.isAdmin ? 'Profili im' : user ? 'Llogaria ime' : 'Hyr në llogari'}><UserRound size={20} /><span>{user?.isAdmin ? 'Profili im' : user ? 'Llogaria ime' : 'Hyr'}</span></Link>
      </div>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="store-footer"><div className="wrap footer-grid"><div><Link className="brand" to="/"><Leaf size={28} /><span>{business.data?.name ?? 'Tryeza'}</span></Link><p>Të freskëta për familjen.<br />Të zgjedhura për tryezën tuaj.</p></div><div><span className="eyebrow">KËTU PËR JU</span><Link to="/si-funksionon">Porosia dhe dërgesa <ArrowUpRight size={15} /></Link><Link to="/llogaria">Llogaria ime <ArrowUpRight size={15} /></Link>{user?.isAdmin && <Link to="/admin">Paneli i administrimit <ArrowUpRight size={15} /></Link>}</div><div><span className="eyebrow">NA GJENI NË</span><p><MapPin size={16} /> {business.data?.city ?? 'Skenderaj'}, Kosovë</p>{business.data?.phone && <a href={'tel:' + business.data.phone}>{business.data.phone}</a>}{user && <button className="text-button" onClick={() => logout().catch(e => toast(e.message))}><LogOut size={14} /> Dil nga llogaria</button>}</div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} {business.data?.name ?? 'Tryeza'}. Me kujdes, çdo ditë.</span><span>Pagesa regjistrohet në dorëzim ose marrje.</span></div></footer>
  </div>;
}
