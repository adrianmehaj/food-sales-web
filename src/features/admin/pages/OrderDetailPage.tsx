import { calendarDate } from '../../../shared/types';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Banknote, Check, MapPin, Phone, Save } from 'lucide-react';
import { send, useResource } from '../../../shared/api';
import type { Order, OrderLine, OrderStatus } from '../../../shared/types';
import { date, money, paymentLabel, shortId, statusLabel, unitLabel } from '../../../shared/types';
import { Badge, ErrorBox, Loading, Modal, useToast } from '../../../shared/ui';

export function OrderDetailPage() {
  const { id } = useParams();
  const order = useResource<Order>('/admin/orders/' + id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<'pay' | 'complete' | 'cancel'>();
  const toast = useToast();
  const o = order.data;
  async function mutate(path: string, body: unknown, method = 'POST') {
    setBusy(true);
    setError('');
    try {
      await send(`/admin/orders/${id}/${path}`, body, method);
      toast('Ndryshimi u ruajt.');
      setDialog(undefined);
      order.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (order.loading) return <Loading />;
  if (!o) return <ErrorBox message={order.error} retry={order.reload} />;
  const next: OrderStatus | undefined = (
    {
      New: 'Confirmed',
      Confirmed: 'Preparing',
      Preparing: o.fulfillment === 'Delivery' ? 'Delivering' : 'ReadyForPickup',
    } as Partial<Record<OrderStatus, OrderStatus>>
  )[o.status];
  const closed = o.status === 'Completed' || o.status === 'Cancelled';
  const canComplete =
    !closed &&
    (o.source === 'Manual' || o.status === 'Delivering' || o.status === 'ReadyForPickup');
  return (
    <>
      <Link className="back-link" to="/admin/porosite">
        <ArrowLeft size={16} /> Porositë & shitjet
      </Link>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">
            {o.source === 'Online' ? 'POROSI ONLINE' : 'REGJISTRIM MANUAL'} · {date(o.createdAt)}
          </span>
          <h1>Porosia {shortId(o.id)}</h1>
          <Badge status={o.status} />
        </div>
        <div className="button-row">
          {next && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => mutate('status', { status: next, version: o.version }, 'PUT')}
            >
              {statusLabel[next]} <ArrowRight size={17} />
            </button>
          )}
          {canComplete && (
            <button
              className="button primary"
              disabled={busy}
              onClick={() => setDialog('complete')}
            >
              <Check size={17} /> Përfundo shitjen
            </button>
          )}
          {o.debt > 0 && (
            <button className="button primary" disabled={busy} onClick={() => setDialog('pay')}>
              <Banknote size={17} /> Regjistro pagesë
            </button>
          )}
        </div>
      </div>
      <ErrorBox message={error} />
      <div className="detail-grid finance-order-detail">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <h2>Produktet dhe pesha</h2>
              <span className="muted small">{o.lines.length} artikuj</span>
            </div>
            {o.lines.map((line) => (
              <LineEditor
                key={line.id}
                line={line}
                closed={closed}
                busy={busy}
                save={(quantity) =>
                  mutate('quantity', { lineId: line.id, quantity, version: o.version }, 'PUT')
                }
              />
            ))}
            <p className="small muted">
              Sasia përfundimtare përcakton totalin. Stoku zbritet vetëm një herë, kur shitja
              përfundon.
            </p>
            <div className="summary-line total">
              <span>Totali</span>
              <strong>{money(o.total)}</strong>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Historiku i pagesave</h2>
              <span className={'payment-badge payment-' + o.paymentStatus}>
                {paymentLabel[o.paymentStatus]}
              </span>
            </div>
            <div className="payment-summary">
              <div>
                <small>Totali i arkëtuar</small>
                <strong>{money(o.paid)}</strong>
              </div>
              <div>
                <small>Borxhi i mbetur</small>
                <strong className="debt-text">{money(o.debt)}</strong>
              </div>
              {o.dueAt && (
                <div>
                  <small>Afati</small>
                  <strong>{date(o.dueAt)}</strong>
                </div>
              )}
            </div>
            {o.payments.length ? (
              o.payments.map((p) => (
                <div className="summary-line payment-history" key={p.id}>
                  <span>
                    {date(p.receivedAt)}
                    <small>{p.note}</small>
                  </span>
                  <strong className="green-text">+{money(p.amount)}</strong>
                </div>
              ))
            ) : (
              <p className="muted small">Nuk ka pagesa të regjistruara.</p>
            )}
          </section>
        </div>
        <aside>
          <section className="panel">
            <h2>{o.customerName}</h2>
            <p className="inline-note">
              <Phone size={16} />
              <a href={'tel:' + o.phone}>{o.phone}</a>
            </p>
            <p className="inline-note">
              <MapPin size={16} />
              {o.city} · {o.fulfillment === 'Delivery' ? 'Dërgesë falas' : 'Marrje vetë'}
            </p>
            {o.requestedDeliveryDate && (
              <div className="notice">
                <strong>Data e dëshiruar e dërgesës</strong>
                <p>{calendarDate(o.requestedDeliveryDate)}</p>
              </div>
            )}
            {o.address && <p className="muted">{o.address}</p>}
            {o.notes && <div className="notice">{o.notes}</div>}
            <Link className="text-link" to={'/admin/porosite?klienti=' + o.customerId}>
              Historiku i klientit <ArrowRight size={16} />
            </Link>
          </section>
          <section className="panel">
            <h2>Rrjedha e porosisë</h2>
            <ol className="timeline">
              {o.history.map((event, i) => (
                <li key={i}>
                  <Badge status={event.status} />
                  <time>{date(event.at)}</time>
                </li>
              ))}
            </ol>
            {!closed && (
              <button
                className="text-button danger-text"
                disabled={busy}
                onClick={() => setDialog('cancel')}
              >
                Anulo porosinë
              </button>
            )}
          </section>
        </aside>
      </div>
      {(dialog === 'pay' || dialog === 'complete') && (
        <PaymentDialog
          order={o}
          complete={dialog === 'complete'}
          busy={busy}
          error={error}
          close={() => {
            if (!busy) {
              setDialog(undefined);
              setError('');
            }
          }}
          save={(amount, approve, requestId, note) =>
            dialog === 'complete'
              ? mutate('complete', {
                  initialPayment: amount,
                  approveCredit: approve,
                  paymentRequestId: requestId,
                  version: o.version,
                })
              : mutate('payments', { amount, requestId, note })
          }
        />
      )}
      {dialog === 'cancel' && (
        <Modal title="Anulo porosinë?" close={() => setDialog(undefined)}>
          <p>Porosia do të shënohet si e anuluar dhe nuk do të përfshihet te shitjet.</p>
          <ErrorBox message={error} />
          <div className="modal-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setDialog(undefined)}
            >
              Mbaje porosinë
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => mutate('status', { status: 'Cancelled', version: o.version }, 'PUT')}
            >
              Po, anuloje
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function LineEditor({
  line,
  closed,
  busy,
  save,
}: {
  line: OrderLine;
  closed: boolean;
  busy: boolean;
  save: (q: number) => void;
}) {
  const [quantity, setQuantity] = useState(line.finalQuantity);
  return (
    <div className="detail-line">
      <div>
        <h3>{line.productName}</h3>
        <p className="muted small">
          Kërkuar: {line.requestedQuantity} {unitLabel[line.unit]} · {money(line.unitPrice)} /{' '}
          {unitLabel[line.unit]}
        </p>
      </div>
      <div className="line-quantity">
        {closed ? (
          <span>
            {line.finalQuantity} {unitLabel[line.unit]}
          </span>
        ) : (
          <>
            <label className="sr-only" htmlFor={line.id}>
              Sasia përfundimtare për {line.productName}
            </label>
            <input
              id={line.id}
              type="number"
              min={line.unit === 'Piece' ? 1 : 0.001}
              max="10000"
              step={line.unit === 'Piece' ? 1 : 0.001}
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
            />
            <span>{unitLabel[line.unit]}</span>
            <button
              className="icon-button"
              disabled={busy || quantity === line.finalQuantity || quantity <= 0}
              onClick={() => save(quantity)}
              aria-label={'Ruaj sasinë për ' + line.productName}
            >
              <Save size={17} />
            </button>
          </>
        )}
      </div>
      <strong>{money(line.total)}</strong>
    </div>
  );
}
function PaymentDialog({
  order,
  complete,
  busy,
  error,
  close,
  save,
}: {
  order: Order;
  complete: boolean;
  busy: boolean;
  error: string;
  close: () => void;
  save: (amount: number, approve: boolean, id: string, note: string) => void;
}) {
  const [amount, setAmount] = useState(complete ? order.total : order.debt);
  const [approve, setApprove] = useState(false);
  const [note, setNote] = useState('');
  const [id] = useState(() => crypto.randomUUID());
  function submit(e: FormEvent) {
    e.preventDefault();
    save(amount, approve, id, note);
  }
  return (
    <Modal title={complete ? 'Përfundo shitjen' : 'Regjistro pagesë'} close={close}>
      <form onSubmit={submit}>
        <fieldset disabled={busy} className="form-fields">
          <p className="muted">
            {complete
              ? 'Konfirmoni shumën e paguar dhe çdo borxh të mbetur.'
              : 'Kjo pagesë zvogëlon borxhin dhe nuk krijon shitje të re.'}
          </p>
          <div className="summary-line">
            <span>{complete ? 'Totali i shitjes' : 'Borxhi aktual'}</span>
            <strong>{money(complete ? order.total : order.debt)}</strong>
          </div>
          <label>
            Shuma e paguar (€)
            <input
              type="number"
              required
              autoFocus
              min={complete ? 0 : 0.01}
              max={complete ? order.total : order.debt}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
            />
          </label>
          {complete && amount < order.total && (
            <label className="check-label credit-approval">
              <input
                type="checkbox"
                required
                checked={approve}
                onChange={(e) => setApprove(e.target.checked)}
              />{' '}
              Miratoj borxhin prej {money(order.total - amount)}.
            </label>
          )}
          {!complete && (
            <label>
              Shënim (opsional)
              <input maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          )}
          <ErrorBox message={error} />
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={close}>
              Anulo
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? 'Duke ruajtur…' : complete ? 'Përfundo dhe ruaj' : 'Ruaj pagesën'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
