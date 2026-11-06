export type Unit = 'Kilogram' | 'Liter' | 'Piece';
export type OrderStatus = 'New' | 'Confirmed' | 'Preparing' | 'Delivering' | 'ReadyForPickup' | 'Completed' | 'Cancelled';
export interface Page<T> { items: T[]; number: number; pageSize: number; totalCount: number; totalPages: number }
export interface Product {
  id: string; name: string; description: string; imageUrl: string; category: string; price: number;
  effectivePrice: number; stock: number; unit: Unit; isActive: boolean; offerPrice: number | null;
  offerStartsAt: string | null; offerEndsAt: string | null; version: string;
}
export interface Customer {
  id: string; name: string; phone: string; city: string; address: string; type: 'Individual' | 'Business';
  paymentTermDays: number; debt: number; version: string;
}
export interface OrderLine { id: string; productId: string; productName: string; unit: Unit; requestedQuantity: number; finalQuantity: number; unitPrice: number; total: number }
export interface Order {
  id: string; customerId: string; customerName: string; phone: string; city: string; address: string; notes: string;
  requestedDeliveryDate: string | null; fulfillment: 'Delivery' | 'Pickup'; source: 'Online' | 'Manual'; status: OrderStatus; createdAt: string;
  completedAt: string | null; dueAt: string | null; total: number; paid: number; debt: number;
  paymentStatus: 'Unpaid' | 'PartiallyPaid' | 'Paid'; version: string; lines: OrderLine[];
  payments: { id: string; amount: number; receivedAt: string; note: string }[];
  history: { status: OrderStatus; at: string }[];
}
export interface Banner { id: string; title: string; text: string; imageUrl: string; startsAt: string; endsAt: string; isActive: boolean }
export interface Account { id: string; email: string; isAdmin: boolean }
export interface Business { name: string; city: string; pickupAddress: string; phone: string; mapUrl: string | null }
export interface Dashboard { sales: number; collections: number; outstandingDebt: number; newOrders: number; pendingOrders: number; from: string; to: string; days: { date: string; sales: number; collections: number }[] }
export interface Receipt { id: string; total: number; status: OrderStatus }
export const unitLabel: Record<Unit, string> = { Kilogram: 'kg', Liter: 'l', Piece: 'copë' };
export const statusLabel: Record<OrderStatus, string> = { New: 'Porosi e re', Confirmed: 'E konfirmuar', Preparing: 'Në përgatitje', Delivering: 'Në dërgesë', ReadyForPickup: 'Gati për marrje', Completed: 'E përfunduar', Cancelled: 'E anuluar' };
export const paymentLabel = { Unpaid: 'E papaguar', PartiallyPaid: 'Pjesërisht e paguar', Paid: 'E paguar' };
export const money = (value: number) => new Intl.NumberFormat('sq-XK', { style: 'currency', currency: 'EUR' }).format(value);
export const date = (value: string) => new Intl.DateTimeFormat('sq-XK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
export const shortId = (id: string) => '#' + id.slice(0, 8).toUpperCase();

export const calendarDate = (value: string) => new Intl.DateTimeFormat('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value + 'T12:00:00'));
