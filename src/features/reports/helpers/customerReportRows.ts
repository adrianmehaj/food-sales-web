import type { CustomerReport } from '../../../shared/types';

export const customerHeaders = [
  'Klienti',
  'Telefoni',
  'Porosi',
  'Të përfunduara',
  'Totali i porositur',
  'Shitje të përfunduara',
  'Paguar',
  'Borxh',
];
export const customerRow = (c: CustomerReport) => [
  c.name,
  c.phone,
  c.orderCount,
  c.completedOrderCount,
  c.orderedTotal,
  c.salesTotal,
  c.paidTotal,
  c.debt,
];
