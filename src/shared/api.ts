import { useCallback, useEffect, useState } from 'react';
import type { Account } from './types';

export const SESSION_CHANGED_EVENT = 'foodsales:session-changed';
let sessionRefresh: Promise<Account | null> | null = null;
function refreshSession() {
  sessionRefresh ??= fetch('/api/account/me', { credentials: 'same-origin', cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) return null;
      const text = await response.text();
      const user: Account | null = text ? JSON.parse(text) : null;
      window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT, { detail: user }));
      return user;
    })
    .finally(() => {
      sessionRefresh = null;
    });
  return sessionRefresh;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
  retrySession = true
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (options.method && options.method !== 'GET') {
    const tokenResponse = await fetch('/api/account/csrf', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!tokenResponse.ok)
      throw new ApiError('Lidhja me shërbimin dështoi. Provoni përsëri.', tokenResponse.status);
    const { token } = await tokenResponse.json();
    headers.set('X-CSRF-TOKEN', token);
  }
  let response: Response;
  try {
    response = await fetch('/api' + path, {
      ...options,
      headers,
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(
      'Nuk ka lidhje me shërbimin. Kontrolloni internetin dhe provoni përsëri.',
      0
    );
  }
  if (!response.ok) {
    if (response.status === 403 && path.startsWith('/admin/') && retrySession) {
      const user = await refreshSession();
      if (user?.isAdmin) return api<T>(path, options, false);
    }
    const problem = await response.json().catch(() => null);
    const validation = problem?.errors ? Object.values(problem.errors).flat().join(' ') : null;
    throw new ApiError(
      validation ||
        problem?.title ||
        ({
          401: 'Ju lutem hyni në llogari.',
          403: 'Nuk keni qasje në këtë veprim.',
          429: 'Shumë kërkesa. Prisni disa minuta.',
        }[response.status] ??
          'Veprimi dështoi. Provoni përsëri.'),
      response.status
    );
  }
  if (options.method && options.method !== 'GET' && !path.startsWith('/notifications/'))
    window.dispatchEvent(new Event('foodsales:notifications-refresh'));
  if (response.status === 204 || response.headers.get('content-length') === '0')
    return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
export const send = <T>(path: string, body: unknown, method = 'POST') =>
  api<T>(path, { method, body: JSON.stringify(body) });
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!path || !/^\/(orders|admin\/(orders|dashboard|reports))/.test(path)) return;
    window.addEventListener('foodsales:orders-refresh', reload);
    return () => window.removeEventListener('foodsales:orders-refresh', reload);
  }, [path, reload]);
  useEffect(() => {
    if (!path) {
      setData(undefined);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(undefined);
    // Let React's development effect replay finish before starting the request.
    const scheduled = window.setTimeout(() => {
      api<T>(path, { signal: controller.signal })
        .then((result) => {
          if (!controller.signal.aborted) setData(result);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      window.clearTimeout(scheduled);
      controller.abort();
    };
  }, [path, version]);
  return { data, error, loading, reload };
}
