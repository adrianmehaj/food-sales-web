import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react';
import { send } from '../../../shared/api';
import type { Account } from '../../../shared/types';
import { ErrorBox } from '../../../shared/ui';
import { useAuth } from '../state/AuthContext';
import { PasswordField } from '../../../shared/forms/PasswordField';
import { getEmailError, getPasswordError } from '../../../shared/accountValidation';

export function LoginPage() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const emailError = getEmailError(email);
  const passwordError = getPasswordError(password, register);
  const visibleEmailError = touched.email || submitted ? emailError : '';
  const visiblePasswordError = touched.password || submitted ? passwordError : '';

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
      const user = await send<Account>(register ? '/account/register' : '/account/login', {
        email: email.trim(),
        password,
      });
      setUser(user);
      navigate(user.isAdmin ? '/admin' : '/', { replace: true });
    } catch (e) {
      setError(
        e instanceof TypeError
          ? 'Lidhja me serverin dështoi. Kontrolloni internetin dhe provoni përsëri.'
          : (e as Error).message
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setRegister(!register);
    setPassword('');
    setTouched({ email: false, password: false });
    setSubmitted(false);
    setError('');
  }

  return (
    <div className="login-page wrap">
      <div className="login-intro">
        <span className="eyebrow">MIRË SE VINI NË TRYEZË</span>
        <h1>
          Gjithçka e juaja,
          <br />
          <em>në një vend.</em>
        </h1>
        <p>
          Porositë, statuset dhe pagesat tuaja —<br />
          gjithmonë pranë jush.
        </p>
        <span className="inline-note">
          <ShieldCheck size={18} /> Vetëm ju keni qasje në të dhënat tuaja.
        </span>
      </div>
      <form className="panel login-form" noValidate onSubmit={submit} aria-busy={busy}>
        <h2>{register ? 'Krijo llogari' : 'Hyr në llogari'}</h2>
        <p className="muted">
          {register
            ? 'Për porositë tuaja të ardhshme.'
            : 'Mirë se u kthyet. Na vjen mirë që jeni këtu.'}
        </p>
        <fieldset disabled={busy} className="auth-fields">
          <div className="auth-field">
            <label htmlFor="account-email">Emaili</label>
            <input
              ref={emailInput}
              id="account-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              placeholder="emri@shembull.com"
              value={email}
              aria-invalid={!!visibleEmailError}
              aria-describedby={visibleEmailError ? 'account-email-error' : undefined}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            {visibleEmailError && (
              <p className="field-error" id="account-email-error" aria-live="polite">
                <AlertCircle size={14} aria-hidden="true" />
                {visibleEmailError}
              </p>
            )}
          </div>
          <PasswordField
            key={register ? 'register-password' : 'login-password'}
            id="account-password"
            inputRef={passwordInput}
            value={password}
            showRequirements={register}
            error={visiblePasswordError}
            blur={() => setTouched((current) => ({ ...current, password: true }))}
            change={(value) => {
              setPassword(value);
              setError('');
            }}
          />
          <ErrorBox message={error} />
          <button className="button primary full" disabled={busy} type="submit">
            {busy ? (
              <>
                <LoaderCircle size={17} className="spin" aria-hidden="true" />
                {register ? 'Duke krijuar llogarinë…' : 'Duke hyrë…'}
              </>
            ) : (
              <>
                {register ? 'Krijo llogari' : 'Hyr'}
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </fieldset>
        <button className="text-button centered" type="button" disabled={busy} onClick={switchMode}>
          {register ? 'Keni llogari? Hyni këtu' : 'Nuk keni llogari? Regjistrohuni'}
        </button>
        <Link className="back-link centered" to="/">
          Mund të porositni edhe pa llogari
        </Link>
      </form>
    </div>
  );
}
