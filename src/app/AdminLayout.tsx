import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { AdminSearch } from '../features/admin/components/AdminSearch';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Plus,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Users,
  Menu,
} from 'lucide-react';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import { useAuth } from '../features/account/state/AuthContext';
import { ErrorBox, Loading, Modal, useToast } from '../shared/ui';

const links = [
  { to: '/admin', label: 'Pasqyra kryesore', icon: LayoutDashboard, end: true },
  { to: '/admin/porosite', label: 'Porositë & shitjet', icon: ReceiptText },
  { to: '/admin/produktet', label: 'Produktet', icon: Package },
  { to: '/admin/klientet', label: 'Klientët', icon: Users },
  { to: '/admin/raportet', label: 'Raportet & borxhet', icon: ChartNoAxesCombined },
  { to: '/admin/ofertat', label: 'Banerat & ofertat', icon: Megaphone },
  { to: '/admin/administratoret', label: 'Administratorët', icon: ShieldCheck },
  { to: '/admin/profili', label: 'Profili im', icon: UserRound },
];
export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const { user, loading, error, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!user) return <Navigate to="/hyr" replace />;
  if (!user.isAdmin) return <Navigate to="/llogaria" replace />;
  return (
    <div className="admin-layout">
      <nav className="mobile-app-nav admin-mobile-nav" aria-label="Administrimi në telefon">
        <NavLink to="/admin" end>
          <LayoutDashboard size={22} />
          <span>Pasqyra</span>
        </NavLink>
        <NavLink to="/admin/porosite">
          <ReceiptText size={22} />
          <span>Porositë</span>
        </NavLink>
        <Link to="/admin/porosite?shitje=1" className="mobile-quick-sale">
          <Plus size={24} />
          <span>Shto shitje</span>
        </Link>
        {mobile && (
          <div className="mobile-nav-notifications">
            <NotificationBell key={user.id} />
            <span>Njoftimet</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Hap menynë e administrimit"
          aria-expanded={menuOpen}
        >
          <Menu size={22} />
          <span>Më shumë</span>
        </button>
      </nav>
      {menuOpen && (
        <Modal title="Administrimi" close={() => setMenuOpen(false)}>
          <div className="mobile-admin-menu">
            {links.map((link) => (
              <Link to={link.to} key={link.to} onClick={() => setMenuOpen(false)}>
                <link.icon size={21} />
                <span>{link.label}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <ArrowLeft size={21} />
              <span>Shiko dyqanin</span>
            </Link>
            <button
              type="button"
              onClick={() =>
                logout()
                  .then(() => {
                    setMenuOpen(false);
                    navigate('/hyr');
                  })
                  .catch((e) => toast(e.message))
              }
            >
              <LogOut size={21} />
              <span>Dil nga llogaria</span>
            </button>
          </div>
        </Modal>
      )}
      <aside className="admin-sidebar">
        <Link className="brand" to="/admin">
          <img src="/brand-mark.svg" width="39" height="39" alt="" />
          <span>
            Tryeza<small>PRODUKTE BIO · ADMIN</small>
          </span>
        </Link>
        <span className="sidebar-label">BIZNESI JUAJ</span>
        <nav aria-label="Paneli administrativ">
          {links.map((link) => (
            <NavLink end={link.end} to={link.to} key={link.to}>
              <link.icon size={19} />
              <span>{link.label}</span>
            </NavLink>
          ))}
          {!mobile && <NotificationBell key={user.id} variant="sidebar" />}
        </nav>
        <div className="sidebar-bottom">
          <Link className="sidebar-store" to="/">
            <ArrowLeft size={17} />
            <span>Kthehu te dyqani</span>
            <ArrowUpRight size={15} />
          </Link>
          <div className="sidebar-user">
            <Link to="/admin/profili" className="sidebar-identity" aria-label="Hap profilin tim">
              <span className="avatar">A</span>
              <span>
                <strong>Administratori</strong>
                <small title={user.email}>{user.email}</small>
              </span>
            </Link>
            <button
              className="icon-button"
              aria-label="Dil nga llogaria"
              onClick={() =>
                logout()
                  .then(() => navigate('/hyr'))
                  .catch((e) => toast(e.message))
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <AdminSearch />
        <main id="main" className="admin-content">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="admin-footer">
          © {new Date().getFullYear()} Tryeza - Produkte Bio · Adrian Mehaj
        </footer>
      </div>
    </div>
  );
}
