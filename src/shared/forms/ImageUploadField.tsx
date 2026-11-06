import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { api } from '../api';
import { isSupportedImage } from './imageFile';

export function ImageUploadField({
  value,
  change,
  onBusyChange,
}: {
  value: string;
  change: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (!isSupportedImage(file)) {
      setError('Zgjidhni një fotografi JPG, JPEG, JFIF, PNG ose WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024 || file.size === 0) {
      setError('Fotografia duhet të jetë deri në 5 MB.');
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    onBusyChange(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const image = await api<{ url: string }>('/admin/images', {
        method: 'POST',
        body,
        signal: abort.signal,
      });
      if (!abort.signal.aborted) change(image.url);
    } catch (e) {
      if (!abort.signal.aborted) setError((e as Error).message);
    } finally {
      if (!abort.signal.aborted) {
        setBusy(false);
        onBusyChange(false);
      }
    }
  }
  return (
    <div className="image-upload-field">
      <span>Fotografia</span>
      <div className="image-upload-box">
        {value ? (
          <img className="image-upload-preview" src={value} alt="Fotografia e zgjedhur" />
        ) : (
          <div className="image-upload-placeholder">
            <ImagePlus size={32} />
            <span>Shtoni një fotografi nga pajisja juaj</span>
          </div>
        )}
        <div className="image-upload-actions">
          <input
            className="image-file-input"
            id={id}
            type="file"
            accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp"
            disabled={busy}
            aria-describedby={id + '-hint'}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <label
            htmlFor={id}
            className={'button secondary image-upload-trigger' + (busy ? ' is-busy' : '')}
          >
            {busy ? <LoaderCircle size={18} className="spin" /> : <ImagePlus size={18} />}
            {busy ? 'Duke ngarkuar…' : value ? 'Ndrysho fotografinë' : 'Zgjidh fotografinë'}
          </label>
          {value && (
            <button
              type="button"
              className="icon-button"
              disabled={busy}
              aria-label="Hiq fotografinë"
              onClick={() => change('')}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <small id={id + '-hint'} className="muted">
          JPG, JPEG, JFIF, PNG ose WebP · Deri në 5 MB
        </small>
        {busy && (
          <span role="status" className="muted">
            Prisni të përfundojë ngarkimi para ruajtjes.
          </span>
        )}
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
