import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className, onClick, animate = true, style }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'glass-card rounded-2xl p-4',
        animate && 'animate-fade-in',
        onClick && 'cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}
