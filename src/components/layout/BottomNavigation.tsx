import { Link, useLocation } from 'react-router-dom';
import { Calendar, Plus, Settings, MessageSquare, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Calendar, label: 'Inicio' },
  { path: '/stats', icon: BarChart3, label: 'Estadísticas' },
  { path: '/new-entry', icon: Plus, label: 'Nuevo', isMain: true },
  { path: '/assistant', icon: MessageSquare, label: 'Asistente' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

export function BottomNavigation() {
  const location = useLocation();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedDateStr = (() => {
    try {
      return localStorage.getItem('volantia-selected-date') || todayStr;
    } catch {
      return todayStr;
    }
  })();

  const mainTo = `/new-entry?date=${selectedDateStr}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glass-card mx-4 mb-4 rounded-3xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <Link
                  key={item.path}
                  to={mainTo}
                  className="relative -mt-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
