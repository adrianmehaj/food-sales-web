import { Link, useLocation } from 'react-router-dom';
import { House, ShoppingBag, Tags, UserRound } from 'lucide-react';
import { useAuth } from '../features/account/AuthContext';
import { useCart } from '../features/cart/CartContext';

export function StoreMobileNav() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const { items } = useCart();
  const offers = pathname === '/' && new URLSearchParams(search).get('oferta') === '1';
  const links = [
    { to: '/', label: 'Produktet', icon: House, active: pathname === '/' && !offers },
    { to: '/?oferta=1', label: 'Ofertat', icon: Tags, active: offers },
    { to: '/shporta', label: 'Shporta', icon: ShoppingBag, active: pathname === '/shporta', count: items.length },
    { to: user?.isAdmin ? '/admin/profili' : user ? '/llogaria' : '/hyr', label: user ? 'Profili im' : 'Hyr', icon: UserRound, active: ['/llogaria', '/hyr'].includes(pathname) },
  ];
  return <nav className="mobile-app-nav" aria-label="Navigimi në telefon">{links.map(link => <Link key={link.to} to={link.to} className={link.active ? 'active' : ''} aria-current={link.active ? 'page' : undefined}><span className="mobile-nav-icon"><link.icon size={22} />{'count' in link && !!link.count && <b>{link.count > 99 ? '99+' : link.count}</b>}</span><span>{link.label}</span></Link>)}</nav>;
}
