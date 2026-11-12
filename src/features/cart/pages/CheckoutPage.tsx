import { CustomerFields, emptyCustomer } from '../components/CustomerFields';
import type { CustomerFieldsValue } from '../components/CustomerFields';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useCart } from '../state/CartContext';
import { send } from '../../../shared/api';
import type { Receipt } from '../../../shared/types';
import { calendarDate, money, shortId, unitLabel } from '../../../shared/types';
import { Empty, ErrorBox, Quantity } from '../../../shared/ui';
import { useAuth } from '../../account/state/AuthContext';
import { ConfirmButton } from '../../../shared/ConfirmButton';

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
      <Link className="back-link continue-shopping" to="/">
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
          <div className="cart-panel-heading">
            <div>
              <span className="eyebrow">POROSIA JUAJ</span>
              <h2>Produktet e zgjedhura</h2>
            </div>
            <span className="cart-item-count">
              {cart.items.length} {cart.items.length === 1 ? 'artikull' : 'artikuj'}
            </span>
          </div>
          {cart.items.map((item) => (
            <article className="cart-line" key={item.product.id}>
              <img src={item.product.imageUrl || '/brand-mark.svg'} alt="" />
              <div className="cart-line-details">
                <h3>{item.product.name}</h3>
                <p>
                  {money(item.product.effectivePrice)} / {unitLabel[item.product.unit]}
                </p>
              </div>
              <div className="cart-line-quantity">
                <Quantity
                  value={item.quantity}
                  step={item.product.unit === 'Piece' ? 1 : 0.5}
                  max={item.product.stock}
                  stockMessage={`Nuk ka më shumë stok për momentin. Në dispozicion: ${item.product.stock} ${unitLabel[item.product.unit]}.`}
                  label={item.product.name}
                  change={(quantity) => cart.update(item.product.id, quantity)}
                />
              </div>
              <div className="cart-line-end">
                <strong>{money(item.quantity * item.product.effectivePrice)}</strong>
                <ConfirmButton
                  className="icon-button cart-remove"
                  aria-label={'Hiq ' + item.product.name}
                  confirmationTitle="Ta hiqni produktin nga shporta?"
                  confirmationText={
                    <>
                      Produkti <strong>{item.product.name}</strong> do të hiqet nga shporta juaj.
                    </>
                  }
                  onConfirm={() => cart.remove(item.product.id)}
                >
                  <Trash2 size={17} />
                </ConfirmButton>
              </div>
            </article>
          ))}
          <div className="cart-summary">
            <div className="summary-line cart-shipping-summary">
              <span className="cart-shipping-label">
                <Truck size={17} /> Dërgesa
              </span>
              <strong className="green-text">Falas</strong>
            </div>
            <div className="summary-line total">
              <span>Totali</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="muted small">
              Çmimi aktual dhe pesha përfundimtare konfirmohen nga biznesi.
            </p>
          </div>
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
