import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, AlertTriangle, Calendar, Utensils, TrendingUp, Clock } from 'lucide-react';
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed z-50"
            style={{
              top: 60, right: 12, left: 12,
              maxWidth: 400, marginLeft: 'auto',
              background: 'rgba(10,18,38,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white text-sm">Notificaciones</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={onMarkAllRead} className="text-[11px] text-blue-400 font-medium">
                    Marcar todo leído
                  </button>
                )}
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Permission request */}
            {permission !== 'granted' && permission !== 'denied' && (
              <div className="mx-3 mt-3 rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p className="text-xs text-slate-300 mb-2">Activa las notificaciones para recibir alertas aunque la app esté cerrada.</p>
                <button
                  onClick={onRequestPermission}
                  className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg"
                >
                  Activar notificaciones
                </button>
              </div>
            )}

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <Bell className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm">Sin notificaciones</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map((n) => {
                    const Icon = typeIcon[n.type] || Bell;
                    const color = typeColor[n.type] || '#3b82f6';
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onMarkRead(n.id)}
                        className="flex gap-3 rounded-xl p-3 cursor-pointer transition-all active:scale-[0.98]"
                        style={{
                          background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                          border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.1)'}`,
                        }}
                      >
                        <div
                          className="flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center mt-0.5"
                          style={{ background: `${color}18` }}
                        >
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold leading-tight ${n.read ? 'text-slate-400' : 'text-white'}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-400 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex justify-center px-4 py-2 border-t border-white/[0.04]">
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Borrar todas
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
