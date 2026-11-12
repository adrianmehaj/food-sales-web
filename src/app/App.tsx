import { Component, lazy, Suspense, useEffect } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { StoreLayout } from './StoreLayout';
import { PwaStatus } from './PwaStatus';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { Empty, Loading } from '../shared/ui';

const AdminLayout = lazy(() =>
  import('./AdminLayout').then((module) => ({ default: module.AdminLayout }))
);
const HowItWorks = lazy(() =>
  import('../features/catalog/pages/HowItWorks').then((module) => ({ default: module.HowItWorks }))
);
const CheckoutPage = lazy(() =>
  import('../features/cart/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage }))
);
const ProductDetailPage = lazy(() =>
  import('../features/catalog/pages/ProductDetailPage').then((module) => ({
    default: module.ProductDetailPage,
  }))
);
const ReportsPage = lazy(() =>
  import('../features/reports/pages/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  }))
);
const CustomerReportPage = lazy(() =>
  import('../features/reports/pages/CustomerReportPage').then((module) => ({
    default: module.CustomerReportPage,
  }))
);
const AccountPage = lazy(() =>
  import('../features/account/pages/AccountPage').then((module) => ({
    default: module.AccountPage,
  }))
);
const ProfilePage = lazy(() =>
  import('../features/account/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const LoginPage = lazy(() =>
  import('../features/account/pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('../features/admin/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const OrdersPage = lazy(() =>
  import('../features/admin/pages/OrdersPage').then((module) => ({ default: module.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('../features/admin/pages/OrderDetailPage').then((module) => ({
    default: module.OrderDetailPage,
  }))
);
const ProductsPage = lazy(() =>
  import('../features/admin/pages/ProductsPage').then((module) => ({
    default: module.ProductsPage,
  }))
);
const CustomersPage = lazy(() =>
  import('../features/admin/pages/CustomersPage').then((module) => ({
    default: module.CustomersPage,
  }))
);
const BannersPage = lazy(() =>
  import('../features/admin/pages/BannersPage').then((module) => ({ default: module.BannersPage }))
);
const AdministratorsPage = lazy(() =>
  import('../features/admin/pages/AdministratorsPage').then((module) => ({
    default: module.AdministratorsPage,
  }))
);

export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Kalo te përmbajtja
      </a>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="produktet/:id" element={<ProductDetailPage />} />
            <Route path="shporta" element={<CheckoutPage />} />
            <Route path="hyr" element={<LoginPage />} />
            <Route path="llogaria" element={<AccountPage />} />
            <Route path="si-funksionon" element={<HowItWorks />} />
            <Route
              path="*"
              element={
                <Empty title="Kjo faqe nuk u gjet" text="Kthehuni te produktet për të vazhduar.">
                  <Link to="/" className="button primary">
                    Shiko produktet
                  </Link>
                </Empty>
              }
            />
          </Route>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profili" element={<ProfilePage />} />
            <Route path="porosite" element={<OrdersPage />} />
            <Route path="porosite/:id" element={<OrderDetailPage />} />
            <Route path="produktet" element={<ProductsPage />} />
            <Route path="klientet" element={<CustomersPage />} />
            <Route path="ofertat" element={<BannersPage />} />
            <Route path="raportet" element={<ReportsPage />} />
            <Route path="raportet/:id" element={<CustomerReportPage />} />
            <Route path="administratoret" element={<AdministratorsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <PwaStatus />
    </>
  );
}
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Do not expose personal data or internal errors. */
  }
  render() {
    return this.state.failed ? (
      <div className="wrap receipt-page">
        <h1>Diçka nuk shkoi si duhet.</h1>
        <p>Rifreskoni faqen për të vazhduar.</p>
        <button className="button primary" onClick={() => location.reload()}>
          Rifresko
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
