import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import type { VolantiaNotification } from '@/hooks/useNotifications';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'Volantia', showProfile = true }: HeaderProps) {
  const { user } = useAuth();
  const { entries } = useWorkEntries();
  const { settings } = useUserSettings();
  const isHome = title === 'Volantia';

  const [displayName, setDisplayName] = useState<string>('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<VolantiaNotification[]>([]);
  const [permissionState, setPermissionState] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const { getNotifications, markAllRead, markRead, clearAll } = useNotifications(entries, settings);

  const refreshNotifs = useCallback(() => {
    setNotifications(getNotifications());
    setPermissionState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  }, [getNotifications]);

  useEffect(() => {
    refreshNotifs();
    const interval = setInterval(refreshNotifs, 3000);
    return () => clearInterval(interval);
  }, [refreshNotifs, notifOpen]);

  const handleMarkRead = useCallback((id: string) => { markRead(id); refreshNotifs(); }, [markRead, refreshNotifs]);
  const handleMarkAllRead = useCallback(() => { markAllRead(); refreshNotifs(); }, [markAllRead, refreshNotifs]);
  const handleClearAll = useCallback(() => { clearAll(); refreshNotifs(); }, [clearAll, refreshNotifs]);
  const handlePermissionRefresh = useCallback(() => { refreshNotifs(); }, [refreshNotifs]);

  useEffect(() => {
    if (!user) { setDisplayName(''); return; }
    const metaName = user.user_metadata?.display_name;
    if (metaName) { setDisplayName(metaName); return; }
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || user.email?.split('@')[0] || 'Conductor'));
  }, [user]);

  const nameToShow = displayName || (user ? user.email?.split('@')[0] : '') || 'Conductor';
  const initial = nameToShow.charAt(0).toUpperCase();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    if (!notifOpen) { markAllRead(); refreshNotifs(); }
    setNotifOpen(v => !v);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          {isHome ? (
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-widest">Buenos días</div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{nameToShow}</h1>
            </div>
          ) : (
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h1>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleBellClick} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-transform active:scale-95"
              style={{ background: 'rgba(13,22,45,0.7)', border: `1px solid ${notifOpen ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.1)'}` }}>
              <Bell className="h-4 w-4 text-slate-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </button>
            <Link to="/settings">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform active:scale-95"
                style={{ background: 'rgba(13,22,45,0.7)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Settings className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
            {showProfile && (
              <Link to={user ? '/profile' : '/auth'}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  {initial}
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>
      <NotificationsPanel
        open={notifOpen} onClose={() => setNotifOpen(false)}
        notifications={notifications} onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead} onClearAll={handleClearAll}
        onRequestPermission={handlePermissionRefresh} permission={permissionState}
      />
    </>
  );
}
