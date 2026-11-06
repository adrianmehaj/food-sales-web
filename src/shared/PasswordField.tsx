import { useState } from 'react';
import type { Ref } from 'react';
import { AlertCircle, Check, Circle, Eye, EyeOff } from 'lucide-react';
import { passwordRequirements } from './accountValidation';

interface PasswordFieldProps {
  id: string;
  value: string;
  change: (value: string) => void;
  blur?: () => void;
  error?: string;
  showRequirements?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  label?: string;
}

export function PasswordField({ id, value, change, blur, error, showRequirements = false, inputRef, label = 'Fjalëkalimi' }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const requirements = passwordRequirements.map(rule => ({ label: rule.label, met: rule.matches(value) }));
  const fulfilled = requirements.filter(rule => rule.met).length;
  const description = [showRequirements && `${id}-rules`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return <>
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={'password-input' + (error ? ' has-error' : '')}>
        <input ref={inputRef} id={id} type={visible ? 'text' : 'password'} autoComplete={showRequirements ? 'new-password' : 'current-password'} autoCapitalize="none" spellCheck={false}
          required minLength={showRequirements ? 12 : undefined} maxLength={128} value={value} placeholder={showRequirements ? 'Krijoni një fjalëkalim' : 'Shkruani fjalëkalimin'}
          aria-invalid={!!error} aria-describedby={description} onBlur={blur} onChange={e => change(e.target.value)} />
        <button className="password-toggle" type="button" aria-label={visible ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'} aria-pressed={visible} aria-controls={id}
          onMouseDown={e => e.preventDefault()} onClick={() => setVisible(current => !current)}>
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
      {error && <p className="field-error" id={`${id}-error`} aria-live="polite"><AlertCircle size={14} aria-hidden="true" />{error}</p>}
    </div>
    {showRequirements && <div className={'password-requirements' + (fulfilled === requirements.length ? ' complete' : '')} id={`${id}-rules`}>
      <div className="password-requirements-heading"><span>Kërkesat e fjalëkalimit</span><span className="password-requirements-count" aria-live="polite" aria-atomic="true">{fulfilled} nga {requirements.length} të plotësuara</span></div>
      <div className="password-progress" aria-hidden="true">{requirements.map((rule, index) => <span key={rule.label} className={index < fulfilled ? 'filled' : ''} />)}</div>
      <ul>{requirements.map(rule => <li className={rule.met ? 'met' : ''} key={rule.label}>{rule.met ? <Check size={13} aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}<span>{rule.label}</span><span className="sr-only"> — {rule.met ? 'E plotësuar' : 'Në pritje'}</span></li>)}</ul>
    </div>}
  </>;
}
