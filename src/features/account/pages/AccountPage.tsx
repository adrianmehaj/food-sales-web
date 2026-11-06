import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, LogOut, Package, ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { ProfilePage } from './ProfilePage';
import { useResource } from '../../../shared/api';
import type { Order, Page } from '../../../shared/types';
import { calendarDate, date, money, paymentLabel, shortId, unitLabel } from '../../../shared/types';
import { Badge, Empty, ErrorBox, Loading, Modal, Pager, useToast } from '../../../shared/ui';

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const profileTab = params.get('tab') === 'profili';
  const requestedOrder = params.get('porosia');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order>();
  const toast = useToast();
  const orders = useResource<Page<Order>>(user && !profileTab ? `/orders/mine?page=${page}` : null);
  const notified = useResource<Order>(
    user && requestedOrder ? `/orders/mine/${requestedOrder}` : null
  );
  useEffect(() => {
    if (notified.data) setSelected(notified.data);
  }, [notified.data]);
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/hyr" replace />;
  function close() {
    setSelected(undefined);
    const next = new URLSearchParams(params);
    next.delete('porosia');
    setParams(next, { replace: true });
  }
  return (
    <div className="wrap account-page account-redesign">
      <section className="account-welcome">
        <div>
          <span className="eyebrow">HAPËSIRA JUAJ NË TRYEZË</span>
          <h1>Mirë se erdhët.</h1>
          <p>{user.email}</p>
        </div>
        <div className="button-row">
          <Link to="/" className="button primary">
            <ShoppingBag size={17} /> Vazhdo blerjen
          </Link>
          <button
            className="button secondary"
            onClick={() => logout().catch((e) => toast(e.message))}
          >
            <LogOut size={17} /> Dil
          </button>
        </div>
      </section>
      <nav className="account-tabs" aria-label="Llogaria ime">
        <button className={!profileTab ? 'active' : ''} onClick={() => setParams({})}>
          <Package size={18} /> Porositë e mia
        </button>
        <button
          className={profileTab ? 'active' : ''}
          onClick={() => setParams({ tab: 'profili' })}
        >
          <UserRound size={18} /> Profili im
        </button>
      </nav>
      {profileTab ? (
        <ProfilePage embedded />
      ) : (
        <>
          <div className="account-orders-heading">
            <h2>Porositë e mia</h2>
            <p className="muted">
              Ndiqni përgatitjen, datën, pagesat dhe detyrimet e porosive tuaja.
            </p>
          </div>
          <ErrorBox message={orders.error} retry={orders.reload} />
          <ErrorBox message={notified.error} retry={notified.reload} />
          {orders.loading ? (
            <Loading />
          ) : orders.data?.items.length ? (
            <div className="customer-order-grid">
              {orders.data.items.map((order) => (
                <button
                  className="customer-order-card"
                  key={order.id}
                  onClick={() => setSelected(order)}
                >
                  <div className="customer-order-top">
                    <strong>{shortId(order.id)}</strong>
                    <Badge status={order.status} />
                  </div>
                  <time>{date(order.createdAt)}</time>
                  <p>{order.lines.map((x) => x.productName).join(', ')}</p>
                  {order.requestedDeliveryDate && (
                    <span className="order-delivery-label">
                      {order.status === 'New' ? 'Data e kërkuar' : 'Data e dërgesës'}:{' '}
                      {calendarDate(order.requestedDeliveryDate)}
                    </span>
                  )}
                  <div className="customer-order-money">
                    <div>
                      <small>Totali</small>
                      <strong>{money(order.total)}</strong>
                    </div>
                    <div>
                      <small>Paguar</small>
                      <strong>{money(order.paid)}</strong>
                    </div>
                    <div>
                      <small>{order.status === 'Completed' ? 'Borxhi' : 'Statusi'}</small>
                      <strong className={order.debt ? 'debt-text' : ''}>
                        {order.status === 'Completed' ? money(order.debt) : 'Në proces'}
                      </strong>
                    </div>
                  </div>
                  <span className="customer-order-open">
                    Shiko detajet <ArrowRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            !orders.error && (
              <Empty
                title="Porosia juaj e parë ju pret"
                text="Zgjidhni produktet që ju pëlqejnë. Ne kujdesemi për pjesën tjetër."
              >
                <Link to="/" className="button primary">
                  Shiko produktet
                </Link>
              </Empty>
            )
          )}
          <Pager page={page} pages={orders.data?.totalPages ?? 0} change={setPage} />
          <p className="account-guest-note">
            Porositë pa llogari nuk lidhen automatikisht me llogarinë tuaj vetëm nga numri i
            telefonit.
          </p>
        </>
      )}
      {selected && (
        <Modal title={'Porosia ' + shortId(selected.id)} close={close}>
          <Badge status={selected.status} />
          {selected.requestedDeliveryDate && (
            <div className="notice">
              Data e porosisë: <strong>{calendarDate(selected.requestedDeliveryDate)}</strong>
            </div>
          )}
          <div className="detail-lines">
            {selected.lines.map((line) => (
              <div className="summary-line" key={line.id}>
                <span>
                  {line.productName}
                  <small>
                    {line.finalQuantity} {unitLabel[line.unit]} × {money(line.unitPrice)}
                  </small>
                </span>
                <strong>{money(line.total)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-line total">
            <span>Totali</span>
            <strong>{money(selected.total)}</strong>
          </div>
          <div className="summary-line">
            <span>{paymentLabel[selected.paymentStatus]}</span>
            <strong>Paguar: {money(selected.paid)}</strong>
          </div>
          {selected.debt > 0 && (
            <div className="notice">
              Borxhi: {money(selected.debt)} {selected.dueAt && `· Afati: ${date(selected.dueAt)}`}
            </div>
          )}
          <h3>Historiku i porosisë</h3>
          <ol className="timeline">
            {selected.history.map((event, i) => (
              <li key={i}>
                <Badge status={event.status} />
                <time>{date(event.at)}</time>
              </li>
            ))}
          </ol>
          <h3>Pagesat</h3>
          {selected.payments.length ? (
            selected.payments.map((payment) => (
              <div className="summary-line" key={payment.id}>
                <span>
                  {date(payment.receivedAt)}
                  <small>{payment.note}</small>
                </span>
                <strong>{money(payment.amount)}</strong>
              </div>
            ))
          ) : (
            <p className="muted">Nuk ka pagesa të regjistruara.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
