import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pencil, Plus, Search, Store } from 'lucide-react';
import { send, useResource } from '../../../shared/api';
import type { Customer, Page, Product } from '../../../shared/types';
import { money } from '../../../shared/types';
import { Empty, ErrorBox, Loading, Modal, Pager, useToast } from '../../../shared/ui';

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<Customer | 'new'>();
  const customers = useResource<Page<Customer>>(
    `/admin/customers?page=${page}&search=${encodeURIComponent(search)}`
  );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">MARRËDHËNIE QË ZGJASIN</span>
          <h1>Klientët & borxhet</h1>
          <p>Individët, bizneset dhe detyrimet e tyre të hapura.</p>
        </div>
        <button className="button primary" onClick={() => setEditor('new')}>
          <Plus size={18} /> Shto klient
        </button>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <span className="muted">{customers.data?.totalCount ?? '…'} klientë</span>
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Kërko klient"
              placeholder="Emri ose telefoni…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <ErrorBox message={customers.error} retry={customers.reload} />
        {customers.loading ? (
          <Loading />
        ) : customers.data?.items.length ? (
          <div className="table-scroll">
            <table role="table" className="finance-table mobile-record-table">
              <thead>
                <tr>
                  <th>Klienti</th>
                  <th>Kontakti</th>
                  <th>Lloji / Afati</th>
                  <th className="money-cell">Borxhi</th>
                  <th>Historiku</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.data.items.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Klienti" className="record-primary">
                      <strong>{c.name}</strong>
                      <small>{c.city}</small>
                    </td>
                    <td data-label="Kontakti">
                      <a href={'tel:' + c.phone}>{c.phone}</a>
                      <small>{c.address}</small>
                    </td>
                    <td data-label="Lloji / Afati">
                      {c.type === 'Business' ? 'Dyqan / biznes' : 'Individ'}
                      {c.type === 'Business' && <small>{c.paymentTermDays} ditë afat</small>}
                    </td>
                    <td
                      data-label="Borxhi"
                      className={'money-cell ' + (c.debt > 0 ? 'debt-text' : 'muted')}
                    >
                      <strong>{money(c.debt)}</strong>
                    </td>
                    <td className="record-action">
                      <Link className="text-link" to={'/admin/raportet/' + c.id}>
                        Raporti i klientit <ArrowRight size={15} />
                      </Link>
                    </td>
                    <td className="record-action">
                      <button
                        className="icon-button"
                        aria-label={'Ndrysho ' + c.name}
                        onClick={() => setEditor(c)}
                      >
                        <Pencil size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !customers.error && (
            <Empty
              title="Nuk u gjetën klientë"
              text="Shtoni klientë ose regjistroni shitjen e parë."
            />
          )
        )}
        <Pager page={page} pages={customers.data?.totalPages ?? 0} change={setPage} />
      </section>
      {editor && (
        <CustomerModal
          customer={editor === 'new' ? undefined : editor}
          close={() => setEditor(undefined)}
          saved={() => {
            setEditor(undefined);
            customers.reload();
          }}
        />
      )}
    </>
  );
}
function CustomerModal({
  customer,
  close,
  saved,
}: {
  customer?: Customer;
  close: () => void;
  saved: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [city, setCity] = useState(customer?.city ?? 'Skenderaj');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [type, setType] = useState(customer?.type ?? 'Individual');
  const [days, setDays] = useState(customer?.paymentTermDays ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await send(
        '/admin/customers' + (customer ? '/' + customer.id : ''),
        { name, phone, city, address, type, paymentTermDays: days, version: customer?.version },
        customer ? 'PUT' : 'POST'
      );
      toast('Klienti u ruajt.');
      saved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={customer ? 'Ndrysho klientin' : 'Klient i ri'}
      close={() => {
        if (!busy) close();
      }}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy} className="form-fields">
          <label>
            Emri / emri i biznesit
            <input
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Telefoni
            <input
              required
              type="tel"
              maxLength={25}
              pattern="\+?[0-9 ()\-]{6,25}"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              Qyteti
              <input
                required
                maxLength={80}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label>
              Lloji
              <select value={type} onChange={(e) => setType(e.target.value as Customer['type'])}>
                <option value="Individual">Individ</option>
                <option value="Business">Dyqan / biznes</option>
              </select>
            </label>
          </div>
          <label>
            Adresa
            <input maxLength={500} value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          {type === 'Business' && (
            <label>
              Afati i pagesës (ditë)
              <input
                type="number"
                min="0"
                max="365"
                required
                value={days}
                onChange={(e) => setDays(+e.target.value)}
              />
            </label>
          )}
          <ErrorBox message={error} />
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={close}>
              Anulo
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? 'Duke ruajtur…' : 'Ruaj klientin'}
            </button>
          </div>
        </fieldset>
      </form>
      {customer?.type === 'Business' && <BusinessPrices customer={customer} />}
      {!customer && type === 'Business' && (
        <p className="notice">
          Ruajeni klientin, pastaj hapeni përsëri për të vendosur çmimet e veçanta.
        </p>
      )}
    </Modal>
  );
}
function BusinessPrices({ customer }: { customer: Customer }) {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const products = useResource<Page<Product>>(
    '/admin/products?pageSize=20&search=' + encodeURIComponent(search)
  );
  const prices = useResource<{ productId: string; productName: string; price: number }[]>(
    `/admin/customers/${customer.id}/prices`
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await send(`/admin/customers/${customer.id}/prices`, { productId, price }, 'PUT');
      prices.reload();
      toast('Çmimi i veçantë u ruajt.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="business-prices">
      <h3>
        <Store size={18} /> Çmimet e veçanta
      </h3>
      <p className="small muted">Çmimi i biznesit ka përparësi ndaj çmimit publik dhe ofertave.</p>
      {prices.data?.map((p) => (
        <div key={p.productId} className="summary-line">
          <span>{p.productName}</span>
          <strong>{money(p.price)}</strong>
        </div>
      ))}
      <form onSubmit={submit}>
        <label>
          Kërko produkt
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Emri i produktit…"
          />
        </label>
        <div className="form-grid">
          <label>
            Produkti
            <select required value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Zgjidh produktin</option>
              {products.data?.items.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Çmimi (€)
            <input
              required
              type="number"
              min="0.01"
              max="100000"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(+e.target.value)}
            />
          </label>
        </div>
        <ErrorBox message={error || prices.error || products.error} />
        <button className="button secondary" disabled={busy}>
          {busy ? 'Duke ruajtur…' : 'Ruaj çmimin'}
        </button>
      </form>
    </section>
  );
}
