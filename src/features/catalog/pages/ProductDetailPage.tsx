import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Leaf, PackageCheck, Truck, ZoomIn } from 'lucide-react';
import { useResource } from '../../../shared/api';
import type { Product } from '../../../shared/types';
import { money, unitLabel } from '../../../shared/types';
import { ErrorBox, Loading, Modal, Quantity } from '../../../shared/ui';
import { AddToCartButton } from '../components/AddToCartButton';
import { useCart } from '../../cart/state/CartContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = useResource<Product>(`/catalog/products/${id}`);
  if (product.loading) return <Loading />;
  return (
    <div className="wrap product-detail-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={17} /> Kthehu te produktet
      </Link>
      <ErrorBox message={product.error} retry={product.reload} />
      {product.data && <ProductDetail key={product.data.id} product={product.data} />}
    </div>
  );
}
function ProductDetail({ product: p }: { product: Product }) {
  const [quantity, setQuantity] = useState(Math.min(1, p.stock));
  const [zoom, setZoom] = useState(false);
  const { items } = useCart();
  const available = Math.max(
    0,
    p.stock - (items.find((x) => x.product.id === p.id)?.quantity ?? 0)
  );
  return (
    <>
      <div className="product-detail-grid">
        <button
          type="button"
          className="product-detail-photo"
          onClick={() => setZoom(true)}
          aria-label="Zmadho fotografinë"
        >
          <img src={p.imageUrl || '/brand.svg'} alt={p.name} />
          <span>
            <ZoomIn size={18} /> Shiko më afër
          </span>
        </button>
        <section className="product-detail-copy">
          <span className="eyebrow">{p.category} · TRYEZA - PRODUKTE BIO</span>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {money(p.effectivePrice)}
            <small> / {unitLabel[p.unit]}</small>
            {p.effectivePrice < p.price && <del>{money(p.price)}</del>}
          </div>
          <p className="product-description">{p.description}</p>
          <span className={'availability ' + (p.stock > 0 ? 'available' : '')}>
            <PackageCheck size={17} />
            {p.stock > 0 ? 'Në dispozicion për porosi' : 'Përkohësisht pa stok'}
          </span>
          {available > 0 && (
            <div className="detail-purchase">
              <label>Sasia ({unitLabel[p.unit]})</label>
              <Quantity
                value={quantity}
                change={setQuantity}
                max={available}
                step={p.unit === 'Piece' ? 1 : Math.min(0.1, available)}
                label={p.name}
              />
              <strong>{money(quantity * p.effectivePrice)}</strong>
            </div>
          )}
          <AddToCartButton product={p} quantity={quantity} expanded />
          <div className="detail-assurances">
            <p>
              <Truck size={18} /> Dërgesë falas ose marrje vetë
            </p>
            <p>
              <Leaf size={18} />
              {p.unit === 'Kilogram'
                ? 'Pesha dhe totali përfundimtar konfirmohen gjatë përgatitjes.'
                : 'Porosia dhe data konfirmohen nga biznesi.'}
            </p>
          </div>
        </section>
      </div>
      {zoom && (
        <Modal title={p.name} close={() => setZoom(false)} wide>
          <img className="product-zoom" src={p.imageUrl || '/brand.svg'} alt={p.name} />
        </Modal>
      )}
    </>
  );
}
