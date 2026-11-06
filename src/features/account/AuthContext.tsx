import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, send, SESSION_CHANGED_EVENT } from '../../shared/api';
import type { Account } from '../../shared/types';

const AuthContext = createContext<{ user: Account | null; loading: boolean; error: string; setUser: (user: Account | null) => void; logout: () => Promise<void> }>({ user: null, loading: true, error: '', setUser: () => {}, logout: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const changed = (event: Event) => { setUser((event as CustomEvent<Account | null>).detail); setError(''); };
    window.addEventListener(SESSION_CHANGED_EVENT, changed);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, changed);
  }, []);
  useEffect(() => { api<Account | null>('/account/me').then(setUser).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  async function logout() { await send('/account/logout', {}); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, error, setUser, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
