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
      style={{
        background: 'rgba(13,22,45,0.72)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        border: '1px solid rgba(59,130,246,0.1)',
        borderRadius: 18,
        ...style,
      }}
      className={cn(
        'p-4',
        animate && 'animate-fade-in',
        onClick && 'cursor-pointer transition-transform active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}
