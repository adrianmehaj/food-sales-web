import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Plus, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../account/state/AuthContext';
import { send, useResource } from '../../../shared/api';
import type { Page } from '../../../shared/types';
import { Empty, ErrorBox, Loading, Modal, Pager, useToast } from '../../../shared/ui';
import { PasswordField } from '../../../shared/forms/PasswordField';
import { getEmailError, getPasswordError } from '../../../shared/accountValidation';

interface Administrator {
  id: string;
  email: string;
}

export function AdministratorsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const administrators = useResource<Page<Administrator>>(
    `/admin/administrators?page=${page}&search=${encodeURIComponent(search.trim())}`
  );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">QASJA NË BIZNESIN TUAJ</span>
          <h1>Administratorët</h1>
          <p>Vetëm administratorët mund të shtojnë administratorë të tjerë.</p>
        </div>
        <button className="button primary" onClick={() => setAdding(true)}>
          <Plus size={18} /> Shto administrator
        </button>
      </div>
      <div className="notice">
        <ShieldCheck size={19} />
        <span>
          Administratorët kanë qasje te produktet, porositë, pagesat dhe menaxhimi i
          administratorëve. Regjistrimi publik krijon vetëm llogari klienti.
        </span>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <span className="muted">{administrators.data?.totalCount ?? '…'} administratorë</span>
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              maxLength={254}
              aria-label="Kërko administrator sipas emailit"
              placeholder="Kërko sipas emailit…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <ErrorBox message={administrators.error} retry={administrators.reload} />
        {administrators.loading ? (
          <Loading />
        ) : administrators.data?.items.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Llogaria</th>
                  <th>Roli</th>
                  <th>Gjendja</th>
                </tr>
              </thead>
              <tbody>
                {administrators.data.items.map((administrator) => (
                  <tr key={administrator.id}>
                    <td>
                      <div className="administrator-account">
                        <span className="stat-icon">
                          <ShieldCheck size={17} />
                        </span>
                        <strong>{administrator.email}</strong>
                      </div>
                    </td>
                    <td>Administrator</td>
                    <td>
                      {administrator.id === user?.id ? (
                        <span className="badge status-Completed">Llogaria juaj</span>
                      ) : (
                        <span className="badge status-Confirmed">Me qasje në panel</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !administrators.error && (
            <Empty
              title="Nuk u gjetën administratorë"
              text="Provoni një email tjetër ose shtoni një administrator të ri."
            />
          )
        )}
        <Pager page={page} pages={administrators.data?.totalPages ?? 0} change={setPage} />
      </section>
      {adding && (
        <AddAdministratorModal
          close={() => setAdding(false)}
          saved={() => {
            setAdding(false);
            setPage(1);
            administrators.reload();
          }}
        />
      )}
    </>
  );
}

function AddAdministratorModal({ close, saved }: { close: () => void; saved: () => void }) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const emailError = getEmailError(email);
  const passwordError = mode === 'new' ? getPasswordError(password, true) : '';
  const visibleEmailError = touched.email || submitted ? emailError : '';
  const visiblePasswordError = touched.password || submitted ? passwordError : '';

  function changeMode(value: 'new' | 'existing') {
    setMode(value);
    setPassword('');
    setTouched({ email: false, password: false });
    setSubmitted(false);
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError('');
    if (emailError || passwordError) {
      (emailError ? emailInput : passwordInput).current?.focus();
      return;
    }
    setBusy(true);
    try {
      if (mode === 'new')
        await send<Administrator>('/admin/administrators', { email: email.trim(), password });
      else await send<Administrator>('/admin/administrators/grant', { email: email.trim() });
      toast(
        mode === 'new'
          ? 'Administratori u krijua.'
          : 'Llogarisë iu dha rol administrator. Duhet të dalë dhe të hyjë përsëri.'
      );
      saved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Shto administrator"
      close={() => {
        if (!busy) close();
      }}
    >
      <form onSubmit={submit} noValidate aria-busy={busy}>
        <fieldset disabled={busy} className="auth-fields">
          <div className="segmented admin-account-modes" role="group" aria-label="Mënyra e shtimit">
            <button
              type="button"
              className={mode === 'new' ? 'selected' : ''}
              aria-pressed={mode === 'new'}
              onClick={() => changeMode('new')}
            >
              Llogari e re
            </button>
            <button
              type="button"
              className={mode === 'existing' ? 'selected' : ''}
              aria-pressed={mode === 'existing'}
              onClick={() => changeMode('existing')}
            >
              Llogari ekzistuese
            </button>
          </div>
          <p className="small muted">
            {mode === 'new'
              ? 'Krijoni një llogari të re me email dhe fjalëkalim. Kjo llogari do të ketë rol administrator.'
              : 'Jepini rol administrator një llogarie që është regjistruar tashmë. Fjalëkalimi dhe historiku i saj ruhen.'}
          </p>
          <div className="auth-field">
            <label htmlFor="administrator-email">Emaili i administratorit</label>
            <input
              ref={emailInput}
              id="administrator-email"
              type="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              value={email}
              placeholder="emri@shembull.com"
              aria-invalid={!!visibleEmailError}
              aria-describedby={visibleEmailError ? 'administrator-email-error' : undefined}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            {visibleEmailError && (
              <p id="administrator-email-error" className="field-error" aria-live="polite">
                <AlertCircle size={14} aria-hidden="true" />
                {visibleEmailError}
              </p>
            )}
          </div>
          {mode === 'new' && (
            <PasswordField
              id="administrator-password"
              label="Fjalëkalimi i llogarisë së re"
              inputRef={passwordInput}
              value={password}
              showRequirements
              error={visiblePasswordError}
              blur={() => setTouched((current) => ({ ...current, password: true }))}
              change={(value) => {
                setPassword(value);
                setError('');
              }}
            />
          )}
          {mode === 'existing' && (
            <p className="notice">
              <ShieldCheck size={17} />
              Pas ndryshimit, përdoruesi duhet të dalë dhe të hyjë përsëri për ta hapur panelin
              administrativ.
            </p>
          )}
          <ErrorBox message={error} />
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={close}>
              Anulo
            </button>
            <button type="submit" className="button primary" disabled={busy}>
              <UserPlus size={17} />
              {busy
                ? 'Duke ruajtur…'
                : mode === 'new'
                  ? 'Krijo administratorin'
                  : 'Jep qasje admin'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
