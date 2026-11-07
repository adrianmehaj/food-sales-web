import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, Wallet } from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { CustomerReport, Page } from '../../../shared/types';
import { date, money } from '../../../shared/types';
import { Empty, ErrorBox, Loading, Pager } from '../../../shared/ui';
import { ReportExportButtons } from '../../../shared/reports/ReportExportButtons';
import type { ExportReport } from '../../../shared/reports/reportExport';
import { customerHeaders, customerRow } from '../helpers/customerReportRows';

export function ReportsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const [debtOnly, setDebtOnly] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search]);
  const filter = `search=${encodeURIComponent(search)}&debtOnly=${debtOnly}`;
  const customers = useResource<Page<CustomerReport>>(
    `/admin/reports/customers?page=${page}&${filter}`
  );
  async function load(): Promise<ExportReport> {
    const { allReportPages } = await import('../../../shared/reports/reportExport');
    const all = await allReportPages<CustomerReport>('/admin/reports/customers?' + filter);
    return {
      title: 'Raporti i klientëve',
      subtitle: `Historiku i plotë · ${debtOnly ? 'Vetëm klientët me borxh' : 'Të gjithë klientët'}${search ? ' · Kërkimi: ' + search : ''} · Gjeneruar ${date(new Date().toISOString())}`,
      filename: 'Tryeza-Raporti-Klienteve',
      tables: [
        {
          title: 'Klientët',
          headers: customerHeaders,
          rows: all.map(customerRow),
          moneyColumns: [4, 5, 6, 7],
        },
      ],
    };
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">RAPORTET E BIZNESIT</span>
          <h1>Klientët, pagesat dhe borxhet</h1>
          <p>Pasqyra e plotë për secilin klient, në një vend.</p>
        </div>
        <ReportExportButtons load={load} disabled={customers.loading || !!customers.error} />
      </div>
      <div className="report-intro">
        <Wallet size={24} />
        <div>
          <strong>Çdo pagesë ka historikun e vet.</strong>
          <p>
            Shitjet përfshijnë vetëm porositë e përfunduara. Totali i porositur përjashton anulimet;
            borxhi llogaritet vetëm nga shitjet.
          </p>
        </div>
        <Link to="/admin" className="text-link">
          Shitjet sipas periudhës <ArrowUpRight size={16} />
        </Link>
      </div>
      <section className="panel report-list-panel">
        <div className="finance-section-heading">
          <div>
            <span className="eyebrow">PASQYRA FINANCIARE</span>
            <h2>Bilanci sipas klientit</h2>
            <p>Shitjet, pagesat dhe detyrimet e secilit klient.</p>
          </div>
          <span className="finance-count">{customers.data?.totalCount ?? '…'} klientë</span>
        </div>
        <div className="panel-heading">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              aria-label="Kërko klient në raport"
              placeholder="Kërko emrin ose telefonin…"
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setParams(next, { replace: true });
                setPage(1);
              }}
            />
          </label>
          <label className="check-label report-debt-filter">
            <input
              type="checkbox"
              checked={debtOnly}
              onChange={(e) => {
                setDebtOnly(e.target.checked);
                setPage(1);
              }}
            />{' '}
            Vetëm me borxh
          </label>
        </div>
        <ErrorBox message={customers.error} retry={customers.reload} />
        {customers.loading ? (
          <Loading />
        ) : customers.data?.items.length ? (
          <div className="table-scroll">
            <table role="table" className="report-table finance-table mobile-record-table">
              <thead>
                <tr>
                  <th>Klienti</th>
                  <th>Porosi</th>
                  <th className="money-cell">Shitje</th>
                  <th className="money-cell">Arkëtime</th>
                  <th className="money-cell">Borxhi</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.data.items.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Klienti" className="record-primary">
                      <Link to={'/admin/raportet/' + c.id} className="customer-report-name">
                        <span className="customer-initial">{(c.name || 'K')[0].toUpperCase()}</span>
                        <span>
                          <strong>{c.name}</strong>
                          <small>
                            {c.phone} · {c.city}
                          </small>
                        </span>
                      </Link>
                    </td>
                    <td data-label="Porosi">
                      <strong>{c.orderCount}</strong>
                      <small>{c.completedOrderCount} të përfunduara</small>
                    </td>
                    <td data-label="Shitje" className="money-cell">
                      <strong>{money(c.salesTotal)}</strong>
                    </td>
                    <td data-label="Arkëtime" className="money-cell collected-cell">
                      {money(c.paidTotal)}
                    </td>
                    <td data-label="Borxhi" className="money-cell">
                      <span className={'balance-pill ' + (c.debt > 0 ? 'has-debt' : '')}>
                        {money(c.debt)}
                      </span>
                    </td>
                    <td className="record-action">
                      <Link className="report-open" to={'/admin/raportet/' + c.id}>
                        Hap raportin <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !customers.error && (
            <Empty
              title="Nuk ka rezultate"
              text="Provoni një emër tjetër ose hiqni filtrin e borxhit."
            />
          )
        )}
        <Pager page={page} pages={customers.data?.totalPages ?? 0} change={setPage} />
      </section>
    </>
  );
}
