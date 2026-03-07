import { Link, useLocation } from 'react-router-dom';
import { Calendar, Plus, BarChart3, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Calendar, label: 'Inicio' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/new-entry', icon: Plus, label: 'Fichar', isMain: true },
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
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 mx-0">
        <div className="flex items-center justify-around py-1.5 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <Link key={item.path} to={mainTo} className="relative -mt-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-90">
                    <Icon className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="block text-center text-[10px] font-semibold text-primary mt-0.5">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 transition-colors min-w-[64px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
