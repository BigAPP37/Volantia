import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'Volantia', showProfile = true }: HeaderProps) {
  const { user } = useAuth();
  const isHome = title === 'Volantia';

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2">
      <div className="flex items-center justify-between max-w-[430px] mx-auto">
        {isHome ? (
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-widest">Buenos días</div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              {user?.email?.split('@')[0] ?? 'Conductor'}
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
          {showProfile && (
            <Link to={user ? '/profile' : '/auth'}>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                {user ? user.email?.charAt(0).toUpperCase() : 'V'}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
