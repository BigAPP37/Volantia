import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/new-entry', icon: Plus, label: 'Fichar', isMain: true },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

export function BottomNavigation() {
  const location = useLocation();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedDateStr = (() => {
    try { return localStorage.getItem('volantia-selected-date') || todayStr; } catch { return todayStr; }
  })();

  const mainTo = `/new-entry?date=${selectedDateStr}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div
        className="border-t"
        style={{
          background: 'linear-gradient(to top, rgba(7,15,30,0.98) 60%, rgba(7,15,30,0.88))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-around py-1.5 max-w-[430px] mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <Link key={item.path} to={mainTo} className="relative flex flex-col items-center" style={{ marginTop: -20 }}>
                  <div
                    className="flex h-13 w-13 items-center justify-center rounded-full text-white transition-transform active:scale-90"
                    style={{
                      width: 52, height: 52,
                      background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                      boxShadow: '0 0 0 6px rgba(59,130,246,0.08), 0 4px 24px rgba(59,130,246,0.45)',
                    }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-blue-400">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 transition-colors min-w-[60px]',
                  isActive ? 'text-blue-400' : 'text-slate-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
