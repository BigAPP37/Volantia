import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trash2, AlertTriangle, Calendar, Utensils, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { VolantiaNotification } from '@/hooks/useNotifications';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: VolantiaNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onRequestPermission: () => void;
  permission: string;
}

const typeIcon: Record<string, React.ElementType> = {
  missing_entry:    Clock,
  weekly_summary:   TrendingUp,
  diet_missing:     Utensils,
  consecutive_days: AlertTriangle,
  month_closing:    Calendar,
  extra_hours:      TrendingUp,
};

const typeColor: Record<string, string> = {
  missing_entry:    '#3b82f6',
  weekly_summary:   '#22c55e',
  diet_missing:     '#f59e0b',
  consecutive_days: '#ef4444',
  month_closing:    '#8b5cf6',
  extra_hours:      '#f97316',
};

export function NotificationsPanel({
  open, onClose, notifications, onMarkRead, onMarkAllRead, onClearAll, onRequestPermission, permission,
}: NotificationsPanelProps) {
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed', top: 60, right: 12, left: 12,
              maxWidth: 400, marginLeft: 'auto', zIndex: 201,
              background: 'rgba(10,18,38,0.98)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(59,130,246,0.18)', borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell style={{ width: 16, height: 16, color: '#60a5fa' }} />
                <span style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>Notificaciones</span>
                {unread > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#3b82f6', color: 'white', borderRadius: 99, padding: '2px 6px' }}>{unread}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {unread > 0 && (
                  <button onClick={onMarkAllRead} style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Marcar leído
                  </button>
                )}
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* Permission */}
            {permission !== 'granted' && permission !== 'denied' && (
              <div style={{ margin: '10px 12px 0', borderRadius: 12, padding: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 8, lineHeight: 1.5 }}>Activa las notificaciones para recibir alertas aunque la app esté cerrada.</p>
                <button
                  onClick={async () => {
                    if (typeof Notification !== 'undefined') {
                      const result = await Notification.requestPermission();
                      try { localStorage.setItem('volantia_notif_permission_asked', 'true'); } catch { /* ignore */ }
                      if (result === 'granted') {
                        new Notification('✅ Notificaciones activadas', { body: 'Recibirás alertas de Volantia aunque la app esté cerrada.', icon: '/pwa-192x192.png' });
                      }
                      onRequestPermission();
                    }
                  }}
                  style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
                >
                  Activar notificaciones
                </button>
              </div>
            )}

            {/* List */}
            <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#334155' }}>
                  <Bell style={{ width: 28, height: 28, marginBottom: 10, opacity: 0.3 }} />
                  <p style={{ fontSize: 13 }}>Sin notificaciones</p>
                </div>
              ) : (
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {notifications.map((n) => {
                    const Icon = typeIcon[n.type] || Bell;
                    const color = typeColor[n.type] || '#3b82f6';
                    return (
                      <div key={n.id} onClick={() => onMarkRead(n.id)}
                        style={{ display: 'flex', gap: 12, borderRadius: 12, padding: 12, cursor: 'pointer',
                          background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                          border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.12)'}` }}>
                        <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, marginTop: 2 }}>
                          <Icon style={{ width: 15, height: 15, color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: n.read ? '#64748b' : 'white', lineHeight: 1.3 }}>{n.title}</p>
                            {!n.read && <div style={{ flexShrink: 0, width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', marginTop: 4 }} />}
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>{n.body}</p>
                          <p style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                            {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button onClick={onClearAll}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 style={{ width: 12, height: 12 }} />
                  Borrar todas
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}
