import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, ReceiptText, ShoppingBag, Wallet } from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { CustomerReport, Page, ReportOrder, ReportPayment } from '../../../shared/types';
import { date, money, shortId, statusLabel } from '../../../shared/types';
import { Badge, Empty, ErrorBox, Loading, Pager } from '../../../shared/ui';
import { ReportExportButtons } from '../../../shared/reports/ReportExportButtons';
import type { ExportReport } from '../../../shared/reports/reportExport';
import { customerHeaders, customerRow } from '../helpers/customerReportRows';

export function CustomerReportPage() {
  const { id } = useParams();
  const [orderPage, setOrderPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const path = '/admin/reports/customers/' + id;
  const customer = useResource<CustomerReport>(path);
  const orders = useResource<Page<ReportOrder>>(`${path}/orders?page=${orderPage}`);
  const payments = useResource<Page<ReportPayment>>(`${path}/payments?page=${paymentPage}`);
  const c = customer.data;
  async function load(): Promise<ExportReport> {
    if (!c) throw new Error('Raporti nuk është gati.');
    const { allReportPages } = await import('../../../shared/reports/reportExport');
    const [allOrders, allPayments] = await Promise.all([
      allReportPages<ReportOrder>(path + '/orders'),
      allReportPages<ReportPayment>(path + '/payments'),
    ]);
    return {
      title: 'Raporti i klientit: ' + c.name,
      subtitle: `${c.phone} · ${c.city} · Historiku i plotë · Gjeneruar ${date(new Date().toISOString())}`,
      filename: 'Tryeza-Klienti-' + c.id.slice(0, 8),
      tables: [
        {
          title: 'Përmbledhja',
          headers: customerHeaders,
          rows: [customerRow(c)],
          moneyColumns: [4, 5, 6, 7],
        },
        {
          title: 'Porositë',
          headers: ['Porosia', 'Data', 'Statusi', 'Totali', 'Paguar', 'Borxh'],
          rows: allOrders.map((o) => [
            shortId(o.id),
            date(o.createdAt),
            statusLabel[o.status],
            o.total,
            o.paid,
            o.debt,
          ]),
          moneyColumns: [3, 4, 5],
        },
        {
          title: 'Pagesat',
          headers: ['Pagesa', 'Porosia', 'Data', 'Shuma', 'Shënimi'],
          rows: allPayments.map((p) => [
            shortId(p.id),
            shortId(p.orderId),
            date(p.receivedAt),
            p.amount,
            p.note,
          ]),
          moneyColumns: [3],
        },
      ],
    };
  }
  return (
    <>
      <Link to="/admin/raportet" className="back-link">
        <ArrowLeft size={17} /> Të gjitha raportet
      </Link>
      <ErrorBox message={customer.error} retry={customer.reload} />
      {customer.loading ? (
        <Loading />
      ) : (
        c && (
          <>
            <div className="admin-page-heading">
              <div>
                <span className="eyebrow">PASQYRA E KLIENTIT</span>
                <h1>{c.name}</h1>
                <p>
                  {c.phone} · {c.city}
                </p>
              </div>
              <ReportExportButtons load={load} />
            </div>
            <div className="stats-grid customer-stats">
              {[
                {
                  label: 'Porosi gjithsej',
                  value: String(c.orderCount),
                  note: `${c.completedOrderCount} të përfunduara · ${c.pendingOrderCount} në pritje`,
                  icon: ShoppingBag,
                },
                {
                  label: 'Shitje të përfunduara',
                  value: money(c.salesTotal),
                  note: `Porositur gjithsej: ${money(c.orderedTotal)}`,
                  icon: ReceiptText,
                },
                {
                  label: 'Pagesa të pranuara',
                  value: money(c.paidTotal),
                  note: 'Të gjitha arkëtimet e regjistruara',
                  icon: Banknote,
                },
                {
                  label: 'Borxhi i mbetur',
                  value: money(c.debt),
                  note: c.debt > 0 ? 'Detyrim i hapur' : 'Pa detyrime të hapura',
                  icon: Wallet,
                },
              ].map((s) => (
                <article className="stat-card" key={s.label}>
                  <div>
                    <span>{s.label}</span>
                    <span className="stat-icon">
                      <s.icon size={20} />
                    </span>
                  </div>
                  <strong>{s.value}</strong>
                  <small>{s.note}</small>
                </article>
              ))}
            </div>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Historiku i porosive</h2>
                  <p className="muted small">Porositë në pritje nuk janë shitje të përfunduara.</p>
                </div>
                <span>{orders.data?.totalCount ?? 0} porosi</span>
              </div>
              <ErrorBox message={orders.error} retry={orders.reload} />
              {orders.loading ? (
                <Loading />
              ) : orders.data?.items.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Porosia</th>
                        <th>Data</th>
                        <th>Statusi</th>
                        <th>Totali</th>
                        <th>Paguar</th>
                        <th>Borxh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.data.items.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <Link className="table-link" to={'/admin/porosite/' + o.id}>
                              {shortId(o.id)}
                            </Link>
                          </td>
                          <td>{date(o.createdAt)}</td>
                          <td>
                            <Badge status={o.status} />
                          </td>
                          <td>{money(o.total)}</td>
                          <td>{money(o.paid)}</td>
                          <td className={o.debt ? 'debt-text' : ''}>{money(o.debt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !orders.error && (
                  <Empty
                    title="Ende pa porosi"
                    text="Porositë e këtij klienti do të shfaqen këtu."
                  />
                )
              )}
              <Pager page={orderPage} pages={orders.data?.totalPages ?? 0} change={setOrderPage} />
            </section>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Historiku i pagesave</h2>
                  <p className="muted small">Çdo arkëtim, me datën dhe porosinë përkatëse.</p>
                </div>
                <strong>{money(c.paidTotal)}</strong>
              </div>
              <ErrorBox message={payments.error} retry={payments.reload} />
              {payments.loading ? (
                <Loading />
              ) : payments.data?.items.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Data e pagesës</th>
                        <th>Porosia</th>
                        <th>Shuma</th>
                        <th>Shënimi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.data.items.map((p) => (
                        <tr key={p.id}>
                          <td>{date(p.receivedAt)}</td>
                          <td>
                            <Link className="table-link" to={'/admin/porosite/' + p.orderId}>
                              {shortId(p.orderId)}
                            </Link>
                          </td>
                          <td className="green-text">
                            <strong>{money(p.amount)}</strong>
                          </td>
                          <td>{p.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !payments.error && (
                  <Empty
                    title="Ende pa pagesa"
                    text="Arkëtimet e regjistruara do të shfaqen këtu."
                  />
                )
              )}
              <Pager
                page={paymentPage}
                pages={payments.data?.totalPages ?? 0}
                change={setPaymentPage}
              />
            </section>
          </>
        )
      )}
    </>
  );
}
