import { User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'Volantia', showProfile = true }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-1">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        <div className="flex items-center gap-1">
          <Link to="/settings">
            <button className="p-2.5 rounded-full hover:bg-muted/50 transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>
          {showProfile && user && (
            <Link to="/profile">
              <button className="p-2.5 rounded-full hover:bg-muted/50 transition-colors">
                <User className="h-5 w-5 text-muted-foreground" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
