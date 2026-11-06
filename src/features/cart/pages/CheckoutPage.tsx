import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useCart } from '../state/CartContext';
import { send, useResource } from '../../../shared/api';
import type { Business, Receipt } from '../../../shared/types';
import { calendarDate, money, shortId, unitLabel } from '../../../shared/types';
import { Empty, ErrorBox, Quantity } from '../../../shared/ui';
import { useAuth } from '../../account/state/AuthContext';

export interface CustomerFieldsValue {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  fulfillment: 'Delivery' | 'Pickup';
  requestedDeliveryDate: string | null;
}
export const emptyCustomer: CustomerFieldsValue = {
  name: '',
  phone: '',
  city: 'Skenderaj',
  address: '',
  notes: '',
  fulfillment: 'Delivery',
  requestedDeliveryDate: null,
};
export function CustomerFields({
  value,
  change,
  requireDeliveryDate = false,
}: {
  value: CustomerFieldsValue;
  change: (value: CustomerFieldsValue) => void;
  requireDeliveryDate?: boolean;
}) {
  const business = useResource<Business>('/catalog/business');
  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  const set = (key: keyof CustomerFieldsValue, text: string) => change({ ...value, [key]: text });
  return (
    <>
      <div className="form-grid">
        <label>
          Emri dhe mbiemri
          <input
            required
            maxLength={120}
            autoComplete="name"
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Emri juaj"
          />
        </label>
        <label>
          Numri i telefonit
          <input
            required
            type="tel"
            maxLength={25}
            pattern="\+?[0-9 ()\-]{6,25}"
            autoComplete="tel"
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+383 4x xxx xxx"
          />
        </label>
      </div>
      <fieldset className="fulfillment">
        <legend>Si dëshironi ta merrni?</legend>
        <label className={value.fulfillment === 'Delivery' ? 'selected' : ''}>
          <input
            type="radio"
            name="fulfillment"
            checked={value.fulfillment === 'Delivery'}
            onChange={() => set('fulfillment', 'Delivery')}
          />
          <Truck size={21} />
          <span>
            <strong>Dërgesë në adresë</strong>
            <small>Falas</small>
          </span>
        </label>
        <label className={value.fulfillment === 'Pickup' ? 'selected' : ''}>
          <input
            type="radio"
            name="fulfillment"
            checked={value.fulfillment === 'Pickup'}
            onChange={() => set('fulfillment', 'Pickup')}
          />
          <MapPin size={21} />
          <span>
            <strong>E marr vetë</strong>
            <small>Kur të jetë gati</small>
          </span>
        </label>
      </fieldset>
      {value.fulfillment === 'Delivery' && (
        <label>
          Data e dëshiruar e dërgesës{' '}
          {!requireDeliveryDate && <span className="optional">(opsionale)</span>}
          <input
            type="date"
            required={requireDeliveryDate}
            min={minimumDate}
            value={value.requestedDeliveryDate ?? ''}
            onChange={(e) => change({ ...value, requestedDeliveryDate: e.target.value || null })}
          />
          <small className="muted">
            Zgjidhni ditën kur e dëshironi porosinë. Do t’ju kontaktojmë për konfirmim.
          </small>
        </label>
      )}
      <label>
        Qyteti
        <input
          required
          maxLength={80}
          autoComplete="address-level2"
          value={value.city}
          onChange={(e) => set('city', e.target.value)}
        />
      </label>
      {value.fulfillment === 'Delivery' ? (
        <>
          <label>
            Adresa
            <input
              required
              maxLength={500}
              autoComplete="street-address"
              value={value.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rruga, fshati / lagjja"
            />
          </label>
          {value.city.trim().toLocaleLowerCase('sq') !== 'skenderaj' && (
            <p className="notice">
              Do t’ju kontaktojmë për të konfirmuar mundësinë dhe kohën e dërgesës.
            </p>
          )}
        </>
      ) : (
        <div className="notice">
          <MapPin size={18} />
          <div>
            <strong>Lokacioni i marrjes</strong>
            <p>{business.data?.pickupAddress ?? 'Do ta konfirmojmë me telefon.'}</p>
            {business.data?.mapUrl && (
              <a href={business.data.mapUrl} target="_blank" rel="noopener noreferrer">
                Hap hartën
              </a>
            )}
            <p>Ju konfirmojmë kur porosia është gati. Ju lutem prisni konfirmimin para nisjes.</p>
          </div>
        </div>
      )}
      <label>
        Udhëzime shtesë <span className="optional">(opsionale)</span>
        <textarea
          maxLength={1000}
          rows={2}
          value={value.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Si t’ju gjejmë ose ndonjë shënim për porosinë…"
        />
      </label>
    </>
  );
}
export function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const [fields, setFields] = useState<CustomerFieldsValue>(emptyCustomer);
  const [requestId] = useState(() => crypto.randomUUID());
  const [receipt, setReceipt] = useState<Receipt>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = cart.items.reduce(
    (sum, x) => sum + Math.round(x.quantity * x.product.effectivePrice * 100) / 100,
    0
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await send<Receipt>('/orders', {
        ...fields,
        requestId,
        items: cart.items.map((x) => ({ productId: x.product.id, quantity: x.quantity })),
      });
      setReceipt(result);
      cart.clear();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="wrap receipt-page">
        <span className="success-symbol">
          <Check size={36} />
        </span>
        <span className="eyebrow">FALEMINDERIT PËR BESIMIN</span>
        <h1>
          Porosia juaj
          <br />
          <em>u regjistrua.</em>
        </h1>
        <p>
          Numri i porosisë: <strong>{shortId(receipt.id)}</strong>
        </p>
        <p>
          Totali i porositur: <strong>{money(receipt.total)}</strong>
        </p>
        {fields.fulfillment === 'Delivery' && fields.requestedDeliveryDate && (
          <div className="notice">
            Data e dëshiruar e dërgesës:{' '}
            <strong>{calendarDate(fields.requestedDeliveryDate)}</strong>
          </div>
        )}
        <p>
          Do t’ju kontaktojmë për konfirmim. Për produktet me peshë, totali mund të përshtatet sipas
          peshës reale.
        </p>
        <div className="button-row">
          <Link className="button primary" to="/">
            Kthehu te produktet <ArrowRight size={18} />
          </Link>
          {user && (
            <Link className="button secondary" to="/llogaria">
              Porositë e mia
            </Link>
          )}
        </div>
      </div>
    );
  if (!cart.items.length)
    return (
      <div className="wrap cart-page">
        <Empty
          title="Shporta juaj po pret"
          text="Zgjidhni produktet e preferuara dhe ne kujdesemi për dërgesën."
        >
          <Link className="button primary" to="/">
            Shiko produktet <ArrowRight size={18} />
          </Link>
        </Empty>
      </div>
    );
  return (
    <div className="wrap cart-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> Vazhdo blerjen
      </Link>
      <div className="section-heading">
        <div>
          <span className="eyebrow">NJË HAP MË AFËR</span>
          <h1>Shporta juaj</h1>
        </div>
        <ShoppingBag size={29} />
      </div>
      <div className="checkout-grid">
        <section className="panel cart-items">
          <h2>
            Produktet e zgjedhura <span className="count">{cart.items.length}</span>
          </h2>
          {cart.items.map((item) => (
            <article className="cart-line" key={item.product.id}>
              <img src={item.product.imageUrl || '/brand.svg'} alt="" />
              <div>
                <h3>{item.product.name}</h3>
                <p>
                  {money(item.product.effectivePrice)} / {unitLabel[item.product.unit]}
                </p>
                <Quantity
                  value={item.quantity}
                  step={item.product.unit === 'Piece' ? 1 : 0.1}
                  max={item.product.stock}
                  label={item.product.name}
                  change={(quantity) => cart.update(item.product.id, quantity)}
                />
              </div>
              <div className="cart-line-end">
                <strong>{money(item.quantity * item.product.effectivePrice)}</strong>
                <button
                  className="icon-button muted"
                  aria-label={'Hiq ' + item.product.name}
                  onClick={() => cart.remove(item.product.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
          <div className="summary-line">
            <span>Dërgesa</span>
            <strong className="green-text">Falas</strong>
          </div>
          <div className="summary-line total">
            <span>Totali orientues</span>
            <strong>{money(total)}</strong>
          </div>
          <p className="muted small">
            Çmimi aktual dhe pesha përfundimtare konfirmohen nga biznesi.
          </p>
        </section>
        <form className="panel checkout-form" onSubmit={submit}>
          <span className="eyebrow">TË DHËNAT E POROSISË</span>
          <h2>Ku ta sjellim?</h2>
          <p className="muted small">Nuk ju duhet llogari për të porositur.</p>
          <fieldset disabled={busy} className="form-fields">
            <CustomerFields value={fields} change={setFields} requireDeliveryDate />
            <ErrorBox message={error} />
            <button
              disabled={busy || !navigator.onLine}
              className="button primary full"
              type="submit"
            >
              {busy ? 'Duke dërguar…' : 'Dërgo porosinë'} <ArrowRight size={18} />
            </button>
            <p className="secure-note">
              <ShieldCheck size={15} /> Pagesa dhe dërgesa konfirmohen nga biznesi.
            </p>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
