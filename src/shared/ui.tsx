import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import type { OrderStatus } from './types';
import { statusLabel } from './types';

export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  if (!message) return null;
  return (
    <div className="error-box" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {retry && (
        <button className="text-button" onClick={retry}>
          Provo përsëri
        </button>
      )}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} /> Duke ngarkuar…
    </div>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-mark">✧</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Badge({ status }: { status: OrderStatus }) {
  return <span className={'badge status-' + status}>{statusLabel[status]}</span>;
}
export function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={'modal' + (wide ? ' modal-wide' : '')}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="icon-button" aria-label="Mbyll" onClick={close}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Pager({
  page,
  pages,
  change,
}: {
  page: number;
  pages: number;
  change: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Faqet">
      <button
        className="icon-button"
        disabled={page === 1}
        aria-label="Faqja para"
        onClick={() => change(page - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <span>
        Faqja {page} nga {pages}
      </span>
      <button
        className="icon-button"
        disabled={page >= pages}
        aria-label="Faqja tjetër"
        onClick={() => change(page + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
export function Quantity({
  value,
  change,
  step = 1,
  max = 10000,
  label,
}: {
  value: number;
  change: (n: number) => void;
  step?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label={'Zvogëlo ' + label}
        disabled={value <= step}
        onClick={() => change(Math.max(step, +(value - step).toFixed(3)))}
      >
        <Minus size={14} />
      </button>
      <input
        aria-label={'Sasia për ' + label}
        type="number"
        min={step}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = +e.target.value;
          if (n > 0 && n <= max) change(n);
        }}
      />
      <button
        type="button"
        aria-label={'Shto ' + label}
        disabled={value + step > max}
        onClick={() => change(+(value + step).toFixed(3))}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
const ToastContext = createContext<(message: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <ToastContext.Provider value={setMessage}>
      {children}
      <div className={'toast' + (message ? ' visible' : '')} role="status">
        {message && (
          <>
            <Check size={18} />
            {message}
          </>
        )}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
