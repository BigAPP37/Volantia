import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function SplashScreen({ onFinish, minDuration = 800 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 300);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [onFinish, minDuration]);

  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300',
      isExiting ? 'opacity-0' : 'opacity-100'
    )}>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Volantia</h1>
        <p className="text-xs text-muted-foreground mt-1">Control Horario Pro</p>
      </div>
    </div>
  );
}
