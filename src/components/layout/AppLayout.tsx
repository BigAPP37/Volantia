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
  showNavigation = true,
}: AppLayoutProps) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: '#070f1e' }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 400, height: 280, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.055) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />
      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        {showHeader && <Header title={title} />}
        <main className={`px-4 ${showHeader ? 'pt-3' : 'pt-8'} ${showNavigation ? 'pb-28' : 'pb-8'}`}>
          {children}
        </main>
        {showNavigation && <BottomNavigation />}
      </div>
    </div>
  );
}
