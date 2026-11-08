import { useId, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './ui';

export function ConfirmButton({
  confirmationTitle,
  confirmationText,
  confirmLabel = 'Po, hiqe',
  onConfirm,
  children,
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  confirmationTitle: string;
  confirmationText: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  return (
    <>
      <button {...buttonProps} type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <Modal
          title={confirmationTitle}
          close={() => setOpen(false)}
          descriptionId={descriptionId}
          role="alertdialog"
        >
          <div className="confirmation-body">
            <span className="confirmation-icon" aria-hidden="true">
              <Trash2 size={23} />
            </span>
            <p id={descriptionId}>{confirmationText}</p>
          </div>
          <div className="modal-actions confirmation-actions">
            <button
              type="button"
              className="button secondary"
              autoFocus
              onClick={() => setOpen(false)}
            >
              Anulo
            </button>
            <button
              type="button"
              className="button danger"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
