import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { MARKER_TYPES, MarkerType } from '@/types/dayMarker';
import { cn } from '@/lib/utils';

interface MultiSelectToolbarProps {
  selectedDates: string[];
  onApplyMarker: (type: MarkerType) => void;
  onClearMarkers: () => void;
  onCancel: () => void;
}

export function MultiSelectToolbar({
  selectedDates,
  onApplyMarker,
  onClearMarkers,
  onCancel,
}: MultiSelectToolbarProps) {
  if (selectedDates.length === 0) return null;

  return (
    <GlassCard className="animate-in slide-in-from-bottom-2 p-3 fixed bottom-20 left-4 right-4 z-50 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-sm font-medium">
          {selectedDates.length} día(s) seleccionado(s)
        </span>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 touch-manipulation">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {MARKER_TYPES.map((marker) => (
          <Button
            key={marker.value}
            variant="outline"
            size="default"
            onClick={() => onApplyMarker(marker.value)}
            className={cn(
              'justify-start gap-2 rounded-xl h-11 touch-manipulation active:scale-95 transition-transform',
              marker.bgColor,
              'border-transparent hover:border-current',
              marker.color
            )}
          >
            <div className={cn('h-3 w-3 rounded-full flex-shrink-0', marker.bgColor.replace('/20', ''))} />
            <span className="truncate">{marker.label}</span>
          </Button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={onClearMarkers}
          className="flex-1 rounded-xl h-11 text-destructive hover:bg-destructive/10 touch-manipulation active:scale-95 transition-transform"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Quitar marcadores
        </Button>
      </div>
    </GlassCard>
  );
}
