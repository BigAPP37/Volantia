import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function SplashScreen({ onFinish, minDuration = 1500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 500); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onFinish, minDuration]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-6 transition-all duration-500',
          isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
          <img
            src={logoImg}
            alt="Volantia Logo"
            className="relative h-28 w-28 rounded-3xl object-cover shadow-2xl animate-[scale-in_0.6s_ease-out]"
          />
        </div>

        {/* App name */}
        <div className="text-center animate-[fade-in_0.8s_ease-out_0.3s_both]">
          <h1 className="text-3xl font-bold text-foreground">Volantia</h1>
          <p className="text-sm text-muted-foreground mt-1">Control Horario Pro</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1 animate-[fade-in_0.8s_ease-out_0.6s_both]">
          <div className="h-2 w-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
