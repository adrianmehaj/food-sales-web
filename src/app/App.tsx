import { Component, useEffect } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { StoreLayout } from './StoreLayout';
import { AdminLayout } from './AdminLayout';
import { PwaStatus } from './PwaStatus';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { HowItWorks } from '../features/catalog/pages/HowItWorks';
import { CheckoutPage } from '../features/cart/pages/CheckoutPage';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { CustomerReportPage } from '../features/reports/pages/CustomerReportPage';
import { AccountPage } from '../features/account/pages/AccountPage';
import { ProfilePage } from '../features/account/pages/ProfilePage';
import { LoginPage } from '../features/account/pages/LoginPage';
import { DashboardPage } from '../features/admin/pages/DashboardPage';
import { OrdersPage } from '../features/admin/pages/OrdersPage';
import { OrderDetailPage } from '../features/admin/pages/OrderDetailPage';
import { ProductsPage } from '../features/admin/pages/ProductsPage';
import { CustomersPage } from '../features/admin/pages/CustomersPage';
import { BannersPage } from '../features/admin/pages/BannersPage';
import { AdministratorsPage } from '../features/admin/pages/AdministratorsPage';
import { Empty } from '../shared/ui';

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
