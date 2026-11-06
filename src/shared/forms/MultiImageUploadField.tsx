import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { api } from '../api';

export function MultiImageUploadField({
  value,
  change,
  onBusyChange,
}: {
  value: string[];
  change: (value: string[]) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function upload(files: File[]) {
    if (!files.length) return;
    setError('');
    if (value.length + files.length > 10) {
      setError('Mund të shtoni deri në 10 fotografi për baner.');
      return;
    }
    if (
      files.some(
        (f) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
          f.size > 5242880 ||
          f.size === 0
      )
    ) {
      setError('Çdo fotografi duhet të jetë JPG, PNG ose WebP, deri në 5 MB.');
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    onBusyChange(true);
    const next = [...value];
    try {
      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        const image = await api<{ url: string }>('/admin/images', {
          method: 'POST',
          body,
          signal: abort.signal,
        });
        if (abort.signal.aborted) return;
        next.push(image.url);
        change([...next]);
      }
    } catch (e) {
      if (!abort.signal.aborted) setError((e as Error).message);
    } finally {
      if (!abort.signal.aborted) {
        setBusy(false);
        onBusyChange(false);
      }
    }
  }
  function move(index: number, direction: number) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    change(next);
  }
  return (
    <div className="gallery-upload">
      <div className="gallery-heading">
        <strong>Fotografitë e reklamës</strong>
        <span>{value.length} / 10</span>
      </div>
      <p className="muted small">Shfaqen sipas kësaj renditjeje dhe ndërrohen çdo 5 sekonda.</p>
      <div className="gallery-thumbnails">
        {value.map((url, index) => (
          <div className="gallery-thumbnail" key={url + index}>
            <img src={url} alt={'Fotografia ' + (index + 1)} />
            <span>{index + 1}</span>
            <button
              className="gallery-remove"
              type="button"
              disabled={busy}
              aria-label={'Hiq fotografinë ' + (index + 1)}
              onClick={() => change(value.filter((_, i) => i !== index))}
            >
              <X size={15} />
            </button>
            <div className="gallery-reorder">
              <button
                type="button"
                disabled={busy || index === 0}
                aria-label="Zhvendos majtas"
                onClick={() => move(index, -1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={busy || index === value.length - 1}
                aria-label="Zhvendos djathtas"
                onClick={() => move(index, 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <input
        className="image-file-input"
        type="file"
        id={id}
        multiple
        accept="image/jpeg,image/png,image/webp"
        disabled={busy || value.length >= 10}
        onChange={(e) => {
          void upload(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <label className="button secondary gallery-upload-trigger" htmlFor={id}>
        {busy ? <LoaderCircle className="spin" size={18} /> : <ImagePlus size={18} />}
        {busy ? 'Duke ngarkuar fotografitë…' : 'Zgjidh fotografitë'}
      </label>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
