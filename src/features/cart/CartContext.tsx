import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../../shared/types';

export interface CartItem { product: Product; quantity: number }
const CartContext = createContext<{ items: CartItem[]; add: (product: Product) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void }>({ items: [], add: () => {}, update: () => {}, remove: () => {}, clear: () => {} });
function readCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('tryeza-cart') ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x.quantity === 'number' && x.quantity > 0 && x.quantity <= 10000 && typeof x.product?.id === 'string' && typeof x.product?.name === 'string' && typeof x.product?.effectivePrice === 'number').slice(0, 50);
  } catch { return []; }
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  useEffect(() => { try { localStorage.setItem('tryeza-cart', JSON.stringify(items)); } catch { /* Cart remains usable when storage is unavailable. */ } }, [items]);
  function add(product: Product) {
    setItems(current => {
      const found = current.find(x => x.product.id === product.id);
      if (found) return current.map(x => x.product.id === product.id ? { product, quantity: Math.min(product.stock, x.quantity + 1) } : x);
      return [...current, { product, quantity: Math.min(1, product.stock) }];
    });
  }
  const update = (id: string, quantity: number) => setItems(current => current.map(x => x.product.id === id ? { ...x, quantity } : x));
  const remove = (id: string) => setItems(current => current.filter(x => x.product.id !== id));
  return <CartContext.Provider value={{ items, add, update, remove, clear: () => setItems([]) }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
