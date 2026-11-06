import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, Leaf, Milk, Package, Plus, Search, ShieldCheck, Sparkles, Truck, X } from 'lucide-react';
import { useResource } from '../../shared/api';
import type { Banner, Page, Product } from '../../shared/types';
import { money, unitLabel } from '../../shared/types';
import { Empty, ErrorBox, Loading, Pager, useToast } from '../../shared/ui';
import { useCart } from '../cart/CartContext';
import dairyHero from '../../assets/hero-milk-cheese.png';

const categories = [{ name: 'Të gjitha', icon: Package }, { name: 'Djathë', icon: Sparkles }, { name: 'Qumësht', icon: Milk }, { name: 'Kos & ajkë', icon: Leaf }];
export function CatalogPage() {
  const [params] = useSearchParams();
  const offers = params.get('oferta') === '1';
  const [category, setCategory] = useState('Të gjitha');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { setPage(1); }, [offers]);
  const products = useResource<Page<Product>>(`/catalog/products?page=${page}&pageSize=12&search=${encodeURIComponent(debounced)}&category=${category === 'Të gjitha' ? '' : encodeURIComponent(category)}&offersOnly=${offers}`);
  const banners = useResource<Page<Banner>>('/catalog/banners?pageSize=5');
  return <>
    <section className="hero wrap"><div className="hero-copy"><span className="eyebrow"><span className="tiny-line" /> NGA VENDI YNË, PËR JU</span><h1>E mira nis<br />nga <em>tryeza.</em></h1><p>Djathë, qumësht dhe shije të përditshme.<br className="desktop-break" /> Produkte të freskëta, të sjella te dera juaj.</p><a href="#produktet" className="button primary">Zgjidh produktet <ArrowDown size={18} /></a><div className="hero-note"><span className="leaf-circle"><Leaf size={18} /></span><span>Shije e thjeshtë.<br /><strong>Kujdes në çdo porosi.</strong></span></div></div><div className="hero-image"><img src={dairyHero} alt="Qumësht i freskët në kanë qelqi dhe djathë i bardhë në tryezë" width={1448} height={1086} fetchPriority="high" /><div className="hero-image-shade" /><span className="image-caption">PËR MOMENTET RRETH TRYEZËS</span><div className="fresh-stamp"><Leaf size={22} /><span>Të freskëta<strong>çdo ditë</strong></span></div></div></section>
    <div className="benefits wrap"><div><Truck size={22} /><span><strong>Dërgesa është nga ne</strong><small>Falas, deri te dera juaj</small></span></div><div><ShieldCheck size={22} /><span><strong>Porositni me lehtësi</strong><small>Edhe pa krijuar llogari</small></span></div><div><Package size={22} /><span><strong>Ju duhet më shpejt?</strong><small>Zgjidhni ta merrni vetë</small></span></div></div>
    {banners.data?.items.map(banner => <section key={banner.id} className="promo wrap">{banner.imageUrl && <img src={banner.imageUrl} alt="" loading="lazy" />}<div><span className="eyebrow">NJË ARSYE MË SHUMË</span><h2>{banner.title}</h2><p>{banner.text}</p></div><Sparkles size={30} /></section>)}
    <section className="catalog-section wrap" id="produktet"><div className="section-heading"><div><span className="eyebrow">TË ZGJEDHURA PËR JU</span><h2>{offers ? 'Ofertat e momentit' : 'Çfarë sjellim në tryezë?'}</h2></div><span className="section-note"><span className="green-dot" /> {products.data ? `${products.data.totalCount} produkte` : 'Produkte të freskëta'}</span></div>
      <div className="catalog-tools"><div className="category-tabs" aria-label="Kategoritë">{categories.map(c => <button key={c.name} className={category === c.name ? 'selected' : ''} aria-pressed={category === c.name} onClick={() => { setCategory(c.name); setPage(1); }}><c.icon size={16} />{c.name}</button>)}</div>
        <div className="search-field" role="search"><Search size={18} aria-hidden="true" /><input ref={searchInput} type="search" aria-label="Kërko produkt" placeholder="Kërko një produkt…" maxLength={120} value={search} onChange={e => setSearch(e.target.value)} />{search && <button type="button" className="search-clear" aria-label="Pastro kërkimin" onClick={() => { setSearch(''); searchInput.current?.focus(); }}><X size={15} /></button>}</div>
      </div>
      <ErrorBox message={products.error} retry={products.reload} />
      {products.loading ? <Loading /> : products.data?.items.length ? <div className="product-grid">{products.data.items.map(product => <ProductCard key={product.id} product={product} />)}</div> : !products.error && <Empty title="Nuk u gjetën produkte" text="Provoni një kategori ose emër tjetër." />}
      <Pager page={page} pages={products.data?.totalPages ?? 0} change={setPage} />
      <div className="weight-note"><Leaf size={16} /><p>Për produktet me peshë, totali përfundimtar llogaritet sipas peshës reale gjatë përgatitjes.</p></div>
    </section>
    <section className="bottom-callout wrap"><div><span className="eyebrow">NGA SHPORTA, NË SHTËPI</span><h2>Porosia juaj e radhës?<br /><em>Vetëm disa klikime larg.</em></h2></div><div><p>Zgjidhni çfarë ju pëlqen. Ne kujdesemi për pjesën tjetër dhe ju kontaktojmë për konfirmim.</p><Link className="text-link" to="/si-funksionon">Shikoni si funksionon <ArrowRight size={18} /></Link></div></section>
  </>;
}
function ProductCard({ product }: { product: Product }) {
  const { add, items } = useCart(); const toast = useToast();
  const inCart = items.some(x => x.product.id === product.id);
  const onAdd = () => { add(product); toast(`${product.name} u shtua në shportë.`); };
  return <article className="product-card"><div className="product-photo"><img src={product.imageUrl || '/brand.svg'} alt={product.name} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/brand.svg'; }} />
    {product.effectivePrice < product.price && <span className="offer-tag">Ofertë −{Math.round((1 - product.effectivePrice / product.price) * 100)}%</span>}
    {product.stock <= 0 && <span className="unavailable-tag">Përkohësisht pa stok</span>}
  </div><div className="product-info"><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="product-bottom"><span className="product-price">{money(product.effectivePrice)}<small> / {unitLabel[product.unit]}</small>{product.effectivePrice < product.price && <del>{money(product.price)}</del>}</span><button className={'add-product' + (inCart ? ' in-cart' : '')} disabled={product.stock <= 0 || (items.find(x => x.product.id === product.id)?.quantity ?? 0) >= product.stock} onClick={onAdd} aria-label={'Shto ' + product.name}>{inCart ? <Check size={20} /> : <Plus size={20} />}</button></div></div></article>;
}
