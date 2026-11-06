import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Save, UserRound } from 'lucide-react';
import { useAuth } from './AuthContext';
import { send, useResource } from '../../shared/api';
import { ErrorBox, Loading, useToast } from '../../shared/ui';
import { PasswordField } from '../../shared/PasswordField';

interface Profile { name: string; email: string; phone: string; city: string; address: string; version: string | null }
export function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const profile = useResource<Profile>(user ? '/account/profile' : null);
  const [form, setForm] = useState<Profile>();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  useEffect(() => { if (profile.data) setForm(profile.data); }, [profile.data]);
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/hyr" replace />;
  const emailChanged = form?.email.trim().toLowerCase() !== profile.data?.email.toLowerCase();
  function field(key: keyof Profile, value: string) { setForm(current => current ? { ...current, [key]: value } : current); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!form || !user || busy) return;
    setBusy(true); setError('');
    try {
      const saved = await send<Profile>('/account/profile', { ...form, currentPassword: emailChanged ? password : null }, 'PUT');
      setForm(saved); setPassword(''); setUser({ ...user, email: saved.email }); profile.reload(); toast('Profili u ruajt me sukses.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <section className="profile-page"><div className="section-heading"><div><span className="eyebrow">LLOGARIA JUAJ</span><h1>Profili im</h1><p className="muted">Përditësoni të dhënat tuaja personale dhe të kontaktit.</p></div><UserRound size={28} /></div>
    <ErrorBox message={profile.error} retry={profile.reload} />
    {profile.loading ? <Loading /> : form && <form className="panel profile-panel" onSubmit={submit}><fieldset disabled={busy} className="form-fields">
      <div className="profile-section-title"><h2>Të dhënat personale</h2><p className="muted">Këto të dhëna i përkasin vetëm llogarisë suaj.</p></div>
      <label>Emri dhe mbiemri<input autoComplete="name" required maxLength={120} value={form.name} onChange={e => field('name', e.target.value)} /></label>
      <div className="form-grid"><label>Emaili<input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={e => field('email', e.target.value)} /></label><label>Telefoni<input type="tel" autoComplete="tel" required maxLength={25} value={form.phone} onChange={e => field('phone', e.target.value)} placeholder="+383 44 123 456" /></label></div>
      <label>Qyteti<input autoComplete="address-level2" required maxLength={80} value={form.city} onChange={e => field('city', e.target.value)} /></label>
      <label>Adresa <span className="optional">(opsionale)</span><textarea autoComplete="street-address" maxLength={500} rows={3} value={form.address} onChange={e => field('address', e.target.value)} placeholder="Rruga, fshati ose lagjja…" /></label>
      {emailChanged && <div className="profile-email-confirm"><p>Për të ndryshuar emailin e hyrjes, konfirmoni fjalëkalimin aktual.</p><PasswordField id="profile-password" value={password} change={setPassword} label="Fjalëkalimi aktual" /></div>}
      <ErrorBox message={error} /><div className="profile-actions"><span className="muted small">Ndryshimet ruhen kur shtypni butonin.</span><button className="button primary" disabled={busy}><Save size={17} />{busy ? 'Duke ruajtur…' : 'Ruaj ndryshimet'}</button></div>
    </fieldset></form>}
  </section>;
}
