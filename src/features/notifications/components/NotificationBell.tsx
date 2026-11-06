import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../account/state/AuthContext';
import { api, send } from '../../../shared/api';
import type { NotificationInbox, PlatformNotification } from '../../../shared/types';
import { date } from '../../../shared/types';
import { Empty, ErrorBox, Loading, Modal, Pager, useToast } from '../../../shared/ui';

export function NotificationBell({ variant = 'icon' }: { variant?: 'icon' | 'sidebar' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [inbox, setInbox] = useState<NotificationInbox>();
  const [error, setError] = useState('');
  const refreshInbox = useRef<() => void>(() => {});
  const [busy, setBusy] = useState(false);
  const unread = useRef<number | null>(null);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      try {
        const data = await api<NotificationInbox>(`/notifications?page=${page}&pageSize=10`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (unread.current !== null && data.unreadCount > unread.current) {
          toast('Keni njoftime të reja për porositë.');
          window.dispatchEvent(new Event('foodsales:orders-refresh'));
        }
        unread.current = data.unreadCount;
        setInbox(data);
        setError('');
      } catch (e) {
        if (!controller.signal.aborted) setError((e as Error).message);
      } finally {
        pending = false;
      }
    }
    const refresh = () => {
      if (!document.hidden) void load();
    };
    refreshInbox.current = refresh;
    // React's development effect replay must finish before the first HTTP read.
    const initial = window.setTimeout(refresh, 0);
    const timer = setInterval(refresh, 15000);
    window.addEventListener('foodsales:notifications-refresh', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearTimeout(initial);
      clearInterval(timer);
      refreshInbox.current = () => {};
      window.removeEventListener('foodsales:notifications-refresh', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [user?.id, page, toast]);
  if (!user) return null;
  async function visit(item: PlatformNotification) {
    if (busy) return;
    setBusy(true);
    try {
      if (!item.isRead) {
        await send(`/notifications/${item.id}/read`, {}, 'PUT');
        setInbox((current) => {
          if (!current) return current;
          const wasUnread = current.notifications.items.some(
            (entry) => entry.id === item.id && !entry.isRead
          );
          const unreadCount = Math.max(0, current.unreadCount - (wasUnread ? 1 : 0));
          unread.current = unreadCount;
          return {
            ...current,
            unreadCount,
            notifications: {
              ...current.notifications,
              items: current.notifications.items.map((entry) =>
                entry.id === item.id ? { ...entry, isRead: true } : entry
              ),
            },
          };
        });
      }
      setOpen(false);
      navigate(
        user?.isAdmin ? `/admin/porosite/${item.orderId}` : `/llogaria?porosia=${item.orderId}`
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className={variant === 'sidebar' ? 'sidebar-notification-button' : 'notification-bell'}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Njoftimet${inbox?.unreadCount ? ', ' + inbox.unreadCount + ' të palexuara' : ''}`}
        onClick={() => {
          setOpen(true);
          refreshInbox.current();
        }}
      >
        <Bell size={21} />
        {variant === 'sidebar' && <span>Njoftimet</span>}
        {!!inbox?.unreadCount && <b>{inbox.unreadCount > 99 ? '99+' : inbox.unreadCount}</b>}
      </button>
      {open && (
        <Modal title="Njoftimet" close={() => setOpen(false)}>
          <div className="notification-heading">
            <span>{inbox?.unreadCount ?? 0} të palexuara</span>
            <span>
              <CheckCheck size={16} /> Porositë tuaja, të përditësuara
            </span>
          </div>
          <ErrorBox message={error} retry={() => refreshInbox.current()} />
          {!inbox && !error ? (
            <Loading />
          ) : inbox?.notifications.items.length ? (
            <div className="notification-list">
              {inbox.notifications.items.map((item) => (
                <button
                  disabled={busy}
                  className={'notification-item' + (!item.isRead ? ' unread' : '')}
                  key={item.id}
                  onClick={() => void visit(item)}
                >
                  <span className="notification-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <time>{date(item.createdAt)}</time>
                  </div>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            !error && (
              <Empty
                title="Ende pa njoftime"
                text="Këtu do të gjeni lajmet për porositë dhe konfirmimet."
              />
            )
          )}
          <Pager page={page} pages={inbox?.notifications.totalPages ?? 0} change={setPage} />
        </Modal>
      )}
    </>
  );
}
