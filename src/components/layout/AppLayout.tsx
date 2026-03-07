import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
}

export function AppLayout({ 
  children, 
  title,
  showHeader = true, 
  showNavigation = true 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} />}
      
      <main className={`px-4 ${showHeader ? 'pt-4' : 'pt-8'} ${showNavigation ? 'pb-28' : 'pb-8'}`}>
        {children}
      </main>
      
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
