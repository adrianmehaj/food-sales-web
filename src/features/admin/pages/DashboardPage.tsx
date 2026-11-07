import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  Plus,
  ReceiptText,
  Wallet,
} from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { Dashboard, Order, Page } from '../../../shared/types';
import { date, money, shortId } from '../../../shared/types';
import { Badge, Empty, ErrorBox, Loading } from '../../../shared/ui';
import { ReportExportButtons } from '../../../shared/reports/ReportExportButtons';
import type { ExportReport } from '../../../shared/reports/reportExport';
import { FinancialStat } from '../../reports/components/FinancialStat';

function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function preset(period: string) {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (period === 'week') from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  if (period === 'month') from.setDate(1);
  return { from: localDate(from), to: localDate(today) };
}
export function DashboardPage() {
  const [period, setPeriod] = useState('week');
  const [range, setRange] = useState(() => preset('week'));
  const end = new Date(range.to + 'T12:00:00');
  end.setDate(end.getDate() + 1);
  const valid =
    !!range.from && !!range.to && range.from <= range.to && !Number.isNaN(end.getTime());
  const report = useResource<Dashboard>(
    valid ? `/admin/dashboard?from=${range.from}&to=${localDate(end)}` : null
  );
  const orders = useResource<Page<Order>>('/admin/orders?pageSize=6&status=New');
  const data = report.data;
  const max = Math.max(1, ...(data?.days.flatMap((d) => [d.sales, d.collections]) ?? []));
  function exportReport(): ExportReport {
    if (!data) throw new Error('Raporti nuk është gati.');
    return {
      title: 'Shitjet dhe arkëtimet',
      subtitle: `${range.from} — ${range.to} (përfshirë) · Borxhi dhe porositë në pritje janë gjendje aktuale.`,
      filename: 'Tryeza-Raporti-' + range.from + '-' + range.to,
      tables: [
        {
          title: 'Përmbledhja',
          headers: ['Treguesi', 'Vlera'],
          rows: [
            ['Shitje të përfunduara (€)', data.sales],
            ['Arkëtime në periudhë (€)', data.collections],
            ['Borxhi aktual (€)', data.outstandingDebt],
            ['Porosi të reja', data.newOrders],
            ['Porosi në pritje', data.pendingOrders],
          ],
        },
        {
          title: 'Sipas ditëve',
          headers: ['Data', 'Shitje', 'Arkëtime'],
          rows: data.days.map((d) => [d.date.slice(0, 10), d.sales, d.collections]),
          moneyColumns: [1, 2],
        },
      ],
    };
  }
  return (
    <>
      <div className="admin-page-heading dashboard-title">
        <div>
          <span className="eyebrow">TRYEZA · HAPËSIRA E BIZNESIT</span>
          <h1>Pasqyra e biznesit</h1>
          <p>Një vështrim i qartë mbi porositë, arkëtimet dhe detyrimet.</p>
        </div>
        <Link to="/admin/porosite?shitje=1" className="button primary">
          <Plus size={18} /> Shto shitje
        </Link>
      </div>
      <section className="report-filter-bar" aria-label="Periudha dhe eksportimi i raportit">
        <div className="segmented">
          {[
            { key: 'day', label: 'Sot' },
            { key: 'week', label: 'Këtë javë' },
            { key: 'month', label: 'Këtë muaj' },
          ].map((p) => (
            <button
              key={p.key}
              className={period === p.key ? 'selected' : ''}
              aria-pressed={period === p.key}
              onClick={() => {
                setPeriod(p.key);
                setRange(preset(p.key));
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="report-date-inputs">
          <CalendarDays size={18} />
          <label>
            Nga
            <input
              type="date"
              aria-label="Data e fillimit"
              value={range.from}
              max={range.to}
              onChange={(e) => {
                setPeriod('custom');
                setRange({ ...range, from: e.target.value });
              }}
            />
          </label>
          <label>
            Deri më
            <input
              type="date"
              aria-label="Data e fundit, përfshirë"
              value={range.to}
              min={range.from}
              onChange={(e) => {
                setPeriod('custom');
                setRange({ ...range, to: e.target.value });
              }}
            />
          </label>
        </div>
        <ReportExportButtons load={exportReport} disabled={!data || report.loading || !valid} />
      </section>
      <ErrorBox
        message={!valid ? 'Zgjidhni një periudhë të vlefshme.' : report.error}
        retry={valid ? report.reload : undefined}
      />
      {report.loading ? (
        <Loading />
      ) : (
        data && (
          <>
            <div className="finance-grid">
              {[
                {
                  title: 'Shitje të përfunduara',
                  value: money(data.sales),
                  note: 'Sipas datës së përfundimit',
                  icon: ReceiptText,
                  tone: 'green' as const,
                },
                {
                  title: 'Paratë e arkëtuara',
                  value: money(data.collections),
                  note: 'Pagesat e pranuara në periudhë',
                  icon: Banknote,
                  tone: 'blue' as const,
                },
                {
                  title: 'Borxhi aktual',
                  value: money(data.outstandingDebt),
                  note: 'Gjendja në të gjitha datat',
                  icon: Wallet,
                  tone: 'orange' as const,
                },
                {
                  title: 'Porosi në pritje',
                  value: String(data.pendingOrders),
                  note: `${data.newOrders} të reja për konfirmim`,
                  icon: Clock3,
                  tone: 'purple' as const,
                },
              ].map((stat) => (
                <FinancialStat key={stat.title} label={stat.title} {...stat} />
              ))}
            </div>
            <div className="dashboard-analytics">
              <section className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">ECURIA E BIZNESIT</span>
                    <h2>Shitjet dhe arkëtimet</h2>
                    <p className="muted small">
                      Dy lëvizje të ndryshme, të krahasuara sipas ditës.
                    </p>
                  </div>
                  <span className="chart-legend">
                    <i /> Shitje <i /> Arkëtime
                  </span>
                </div>
                {data.sales === 0 && data.collections === 0 ? (
                  <div className="chart-zero">
                    <ChartNoAxesCombined size={42} />
                    <strong>Periudha është ende pa aktivitet financiar.</strong>
                    <p>
                      Shitjet shfaqen pas përfundimit të porosive; arkëtimet kur regjistrohet
                      pagesa.
                    </p>
                  </div>
                ) : (
                  <div className="analytics-chart">
                    <div className="chart-scale">
                      <span>{money(max)}</span>
                      <span>{money(max / 2)}</span>
                      <span>0 €</span>
                    </div>
                    <div
                      className="bar-chart"
                      role="img"
                      aria-label={`Shitje ${money(data.sales)}, arkëtime ${money(data.collections)}`}
                      style={{ minWidth: Math.max(0, data.days.length * 26) }}
                    >
                      {data.days.map((day) => (
                        <div className="chart-day" key={day.date}>
                          <div
                            className="bar-pair"
                            title={`${day.date.slice(0, 10)}: Shitje ${money(day.sales)}, arkëtime ${money(day.collections)}`}
                          >
                            <span style={{ height: `${(day.sales / max) * 100}%` }} />
                            <span style={{ height: `${(day.collections / max) * 100}%` }} />
                          </div>
                          <small>{new Date(day.date).getDate()}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
              <section className="finance-summary-card">
                <Wallet size={27} />
                <span className="eyebrow">KLIENTËT & DETYRIMET</span>
                <h2>Kontroll mbi çdo bilanc.</h2>
                <p>
                  Shikoni porositë, pagesat dhe borxhin e secilit klient. Shkarkoni pasqyrën e plotë
                  në PDF ose Excel.
                </p>
                <Link to="/admin/raportet" className="button secondary">
                  Hap raportet <ArrowRight size={17} />
                </Link>
                <div>
                  <small>Borxhi aktual</small>
                  <strong>{money(data.outstandingDebt)}</strong>
                </div>
              </section>
            </div>
          </>
        )
      )}
      <section className="panel new-orders-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">NË PRITJE TË KONFIRMIMIT</span>
            <h2>Porositë e reja</h2>
          </div>
          <Link className="text-link" to="/admin/porosite">
            Të gjitha porositë <ArrowRight size={16} />
          </Link>
        </div>
        <ErrorBox message={orders.error} retry={orders.reload} />
        {orders.loading ? (
          <Loading />
        ) : orders.data?.items.length ? (
          <div className="table-scroll">
            <table role="table" className="finance-table mobile-record-table">
              <thead>
                <tr>
                  <th>Porosia</th>
                  <th>Klienti</th>
                  <th>Marrja</th>
                  <th className="money-cell">Totali i porositur</th>
                  <th>Statusi</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.items.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Porosia" className="record-primary">
                      <Link className="table-link" to={'/admin/porosite/' + o.id}>
                        {shortId(o.id)}
                      </Link>
                      <small>{date(o.createdAt)}</small>
                    </td>
                    <td data-label="Klienti">
                      <strong>{o.customerName}</strong>
                      <small>{o.phone}</small>
                    </td>
                    <td data-label="Marrja">
                      {o.fulfillment === 'Delivery' ? 'Dërgesë në adresë' : 'Marrje vetë'}
                      <small>{o.requestedDeliveryDate ?? '—'}</small>
                    </td>
                    <td data-label="Totali" className="money-cell">
                      <strong>{money(o.total)}</strong>
                    </td>
                    <td data-label="Statusi">
                      <Badge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !orders.error && (
            <Empty
              title="Asnjë porosi e re"
              text="Kur një klient porosit, porosia dhe njoftimi do të shfaqen në platformë."
            />
          )
        )}
      </section>
      <p className="report-footnote">
        Shitjet, arkëtimet dhe borxhet raportohen veçmas. Porositë e pakonfirmuara nuk llogariten si
        shitje.
      </p>
    </>
  );
}
