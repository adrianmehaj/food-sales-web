import { calendarDate } from '../../../shared/types';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Plus } from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { Order, OrderStatus, Page } from '../../../shared/types';
import { date, money, paymentLabel, shortId, statusLabel } from '../../../shared/types';
import { Badge, Empty, ErrorBox, Loading, Pager } from '../../../shared/ui';
import { ManualSaleModal } from '../components/ManualSaleModal';

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const orders = useResource<Page<Order>>(
    `/admin/orders?page=${page}&status=${status}${params.get('klienti') ? '&customerId=' + encodeURIComponent(params.get('klienti')!) : ''}`
  );
  const manual = params.get('shitje') === '1';
  function close() {
    const next = new URLSearchParams(params);
    next.delete('shitje');
    setParams(next, { replace: true });
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">NGA POROSIA TE DORËZIMI</span>
          <h1>Porositë & shitjet</h1>
          <p>Porositë online dhe shitjet manuale, në të njëjtin vend.</p>
        </div>
        <button
          className="button primary"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set('shitje', '1');
            setParams(next);
          }}
        >
          <Plus size={18} /> Shto shitje
        </button>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <span className="muted">
            {orders.data?.totalCount ?? '…'} porosi{' '}
            {params.has('klienti') && (
              <Link className="text-link" to="/admin/porosite">
                · Hiq filtrin e klientit
              </Link>
            )}
          </span>
          <label className="inline-filter">
            <Filter size={16} />
            <select
              aria-label="Filtro sipas statusit"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Të gjitha statuset</option>
              {Object.entries(statusLabel).map(([key, label]) => (
                <option key={key} value={key as OrderStatus}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ErrorBox message={orders.error} retry={orders.reload} />
        {orders.loading ? (
          <Loading />
        ) : orders.data?.items.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Porosia / Burimi</th>
                  <th>Klienti</th>
                  <th>Statusi</th>
                  <th>Totali</th>
                  <th>Pagesa</th>
                  <th>Borxhi</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.data.items.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link className="table-link" to={'/admin/porosite/' + o.id}>
                        {shortId(o.id)}
                      </Link>
                      <small>
                        {o.source === 'Online' ? 'Online' : 'Manual'} · {date(o.createdAt)}
                      </small>
                    </td>
                    <td>
                      <strong>{o.customerName}</strong>
                      <small>{o.phone}</small>
                      {o.requestedDeliveryDate && (
                        <small>Dërgesa: {calendarDate(o.requestedDeliveryDate)}</small>
                      )}
                    </td>
                    <td>
                      <Badge status={o.status} />
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <span className={'payment-badge payment-' + o.paymentStatus}>
                        {paymentLabel[o.paymentStatus]}
                      </span>
                      <small>{money(o.paid)} arkëtuar</small>
                    </td>
                    <td className={o.debt > 0 ? 'debt-text' : 'muted'}>{money(o.debt)}</td>
                    <td>
                      <Link className="text-link" to={'/admin/porosite/' + o.id}>
                        Hap →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !orders.error && (
            <Empty
              title="Nuk ka porosi për këtë filtër"
              text="Shitjet e reja mund t’i regjistroni me butonin “Shto shitje”."
            />
          )
        )}
        <Pager page={page} pages={orders.data?.totalPages ?? 0} change={setPage} />
      </div>
      {manual && (
        <ManualSaleModal
          close={close}
          saved={() => {
            close();
            orders.reload();
          }}
        />
      )}
    </>
  );
}
