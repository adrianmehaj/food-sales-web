import { MapPin, Truck } from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { Business } from '../../../shared/types';

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
