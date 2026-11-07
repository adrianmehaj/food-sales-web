import { useEffect, useId, useRef, useState } from 'react';
import { Check, Plus, ShoppingBasket } from 'lucide-react';
import type { Product } from '../../../shared/types';
import { useCart } from '../../cart/state/CartContext';
import { useToast } from '../../../shared/ui';

export function AddToCartButton({
  product,
  quantity,
  expanded = false,
}: {
  product: Product;
  quantity?: number;
  expanded?: boolean;
}) {
  const { add, items } = useCart();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const [stockNotice, setStockNotice] = useState(false);
  const noticeId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const current = items.find((x) => x.product.id === product.id)?.quantity ?? 0;
  const amount = quantity ?? Math.min(1, Math.max(0, product.stock - current));
  const disabled =
    product.stock <= 0 ||
    current + amount > product.stock ||
    amount <= 0 ||
    (items.length >= 50 && current === 0);
  const unavailable = product.stock <= 0 || (items.length >= 50 && current === 0);
  useEffect(() => setStockNotice(false), [current, product.stock, quantity]);
  function onAdd() {
    if (disabled) {
      if (!unavailable) setStockNotice(true);
      return;
    }
    setStockNotice(false);
    add(product, amount);
    setAdded(true);
    toast(`${product.name} u shtua në shportë.`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }
  return (
    <>
      <button
        type="button"
        className={
          (expanded ? 'button primary detail-add' : 'add-product') + (added ? ' just-added' : '')
        }
        disabled={unavailable}
        aria-disabled={disabled || undefined}
        aria-describedby={stockNotice ? noticeId : undefined}
        onClick={onAdd}
        aria-label={'Shto ' + product.name + ' në shportë'}
      >
        {added ? <Check size={20} /> : expanded ? <ShoppingBasket size={20} /> : <Plus size={20} />}
        {expanded && (added ? 'U shtua në shportë' : 'Shto në shportë')}
      </button>
      {stockNotice && (
        <span id={noticeId} className="stock-limit-note" role="status">
          Nuk ka më shumë stok për momentin. Zvogëloni sasinë ose kontrolloni shportën tuaj.
        </span>
      )}
    </>
  );
}
