import { ImageUploadField } from '../../shared/ImageUploadField';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import { send, useResource } from '../../shared/api';
import type { Banner, Page } from '../../shared/types';
import { date } from '../../shared/types';
import { Empty, ErrorBox, Loading, Modal, Pager, useToast } from '../../shared/ui';

export function BannersPage() {
  const [page, setPage] = useState(1); const [editor, setEditor] = useState<Banner | 'new'>();
  const banners = useResource<Page<Banner>>(`/admin/banners?page=${page}`);
  return <><div className="admin-page-heading"><div><span className="eyebrow">DIÇKA E VEÇANTË PËR KLIENTËT</span><h1>Banerat & ofertat</h1><p>Reklamat që shfaqen në dyqan, në kohën e duhur.</p></div><button className="button primary" onClick={() => setEditor('new')}><Plus size={18} /> Shto baner</button></div><div className="notice">Zbritjet dhe datat e ofertave vendosen te <Link className="text-link" to="/admin/produktet">Produktet → Ndrysho</Link>. Këtu menaxhohen banerat me fotografi dhe tekst.</div><ErrorBox message={banners.error} retry={banners.reload} />{banners.loading ? <Loading /> : banners.data?.items.length ? <div className="banner-admin-grid">{banners.data.items.map(b => <article className="panel banner-admin" key={b.id}>{b.imageUrl && <img src={b.imageUrl} alt="" />}<span className={'badge ' + (b.isActive ? 'status-Completed' : 'status-Cancelled')}>{b.isActive ? 'Aktiv sipas periudhës' : 'Joaktiv'}</span><h2>{b.title}</h2><p>{b.text}</p><small className="muted">{date(b.startsAt)} — {date(b.endsAt)}</small><button className="button secondary" onClick={() => setEditor(b)}><Pencil size={16} /> Ndrysho</button></article>)}</div> : !banners.error && <Empty title="Ende pa banera" text="Shtoni një njoftim, ofertë sezonale ose reklamë për klientët tuaj." />}<Pager page={page} pages={banners.data?.totalPages ?? 0} change={setPage} />{editor && <BannerModal banner={editor === 'new' ? undefined : editor} close={() => setEditor(undefined)} saved={() => { setEditor(undefined); banners.reload(); }} />}</>;
}
function BannerModal({ banner, close, saved }: { banner?: Banner; close: () => void; saved: () => void }) {
  const [title, setTitle] = useState(banner?.title ?? ''); const [text, setText] = useState(banner?.text ?? ''); const [image, setImage] = useState(banner?.imageUrl ?? ''); const [start, setStart] = useState(banner?.startsAt.slice(0, 16) ?? ''); const [end, setEnd] = useState(banner?.endsAt.slice(0, 16) ?? ''); const [active, setActive] = useState(banner?.isActive ?? true);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [imageUploading, setImageUploading] = useState(false); const toast = useToast();
  async function submit(e: FormEvent) {
    e.preventDefault(); if (imageUploading) return; setBusy(true); setError('');
    try { await send('/admin/banners' + (banner ? '/' + banner.id : ''), { title, text, imageUrl: image, startsAt: start, endsAt: end, isActive: active }, banner ? 'PUT' : 'POST'); toast('Baneri u ruajt.'); saved(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <Modal title={banner ? 'Ndrysho banerin' : 'Baner i ri'} close={() => { if (!busy && !imageUploading) close(); }}><form onSubmit={submit}><fieldset disabled={busy || imageUploading} className="form-fields"><label>Titulli<input required maxLength={150} value={title} onChange={e => setTitle(e.target.value)} /></label><label>Teksti<textarea required maxLength={500} value={text} onChange={e => setText(e.target.value)} rows={3} /></label><ImageUploadField value={image} change={setImage} onBusyChange={setImageUploading} /><div className="form-grid"><label>Fillimi<input required type="datetime-local" value={start} onChange={e => setStart(e.target.value)} /></label><label>Përfundimi<input required type="datetime-local" min={start} value={end} onChange={e => setEnd(e.target.value)} /></label></div><label className="check-label"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Baneri është aktiv brenda periudhës</label><ErrorBox message={error} /><div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Anulo</button><button className="button primary" disabled={busy || imageUploading}>{busy ? 'Duke ruajtur…' : 'Ruaj banerin'}</button></div></fieldset></form></Modal>;
}
