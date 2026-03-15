import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'Volantia', showProfile = true }: HeaderProps) {
  const { user } = useAuth();
  const isHome = title === 'Volantia';

  // Load display_name from profiles table
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (!user) { setDisplayName(''); return; }
    // First try user_metadata (set at signup)
    const metaName = user.user_metadata?.display_name;
    if (metaName) { setDisplayName(metaName); return; }
    // Then try profiles table
    supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name || user.email?.split('@')[0] || 'Conductor');
      });
  }, [user]);

  const nameToShow = displayName || (user ? user.email?.split('@')[0] : '') || 'Conductor';
  const initial = nameToShow.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2">
      <div className="flex items-center justify-between">
        {isHome ? (
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-widest">Buenos días</div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              {nameToShow}
            </h1>
          </div>
        ) : (
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h1>
        )}
        <div className="flex items-center gap-2">
          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors active:scale-95"
            style={{ background: 'rgba(13,22,45,0.7)', border: '1px solid rgba(59,130,246,0.1)' }}
          >
            <Bell className="h-4 w-4 text-slate-400" />
            <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
          <Link to="/settings">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform active:scale-95"
              style={{ background: 'rgba(13,22,45,0.7)', border: '1px solid rgba(59,130,246,0.1)' }}
            >
              <Settings className="h-4 w-4 text-slate-400" />
            </div>
          </Link>
          {showProfile && (
            <Link to={user ? '/profile' : '/auth'}>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                {initial}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
