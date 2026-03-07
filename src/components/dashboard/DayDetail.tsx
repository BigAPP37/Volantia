import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Clock, Utensils, Moon, Route, Plus, Coins } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { WorkEntry } from '@/types';
import { cn } from '@/lib/utils';

interface DayDetailProps {
  date: Date;
  entries: WorkEntry[];
}

const serviceTypeLabels = {
  regular: 'Jornada Regular',
  extra: 'Jornada Extra',
  rest: 'Descanso',
  sick: 'Baja',
};

const serviceTypeColors = {
  regular: 'bg-primary/10 text-primary',
  extra: 'bg-warning/10 text-warning',
  rest: 'bg-success/10 text-success',
  sick: 'bg-destructive/10 text-destructive',
};

export function DayDetail({ date, entries }: DayDetailProps) {
  const navigate = useNavigate();
  const dateStr = format(date, "EEEE, d 'de' MMMM", { locale: es });
  const formattedDate = format(date, 'yyyy-MM-dd');

  const handleAddEntry = () => {
    navigate(`/new-entry?date=${formattedDate}`);
  };

  const handleEditEntry = (entry: WorkEntry) => {
    navigate(`/new-entry?id=${entry.id}&date=${entry.date}`);
  };

  if (entries.length === 0) {
    return (
      <GlassCard className="animate-slide-up">
        <p className="mb-2 text-sm font-medium capitalize text-muted-foreground">
          {dateStr}
        </p>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-1 text-lg font-medium text-foreground">Sin registros</p>
          <p className="mb-4 text-sm text-muted-foreground">
            No hay servicios registrados para este día
          </p>
          <Button className="rounded-xl" onClick={handleAddEntry}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir servicio
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium capitalize text-muted-foreground">
          {dateStr}
        </p>
        <Button variant="ghost" size="sm" className="rounded-xl" onClick={handleAddEntry}>
          <Plus className="mr-1 h-4 w-4" />
          Añadir
        </Button>
      </div>

      {entries.map((entry, index) => (
        <GlassCard
          key={entry.id}
          onClick={() => handleEditEntry(entry)}
          className="animate-slide-up cursor-pointer hover:border-primary/50 transition-colors"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        >
          <div className="flex items-start justify-between">
            <div>
              <span
                className={cn(
                  'inline-block rounded-lg px-2 py-0.5 text-xs font-medium',
                  serviceTypeColors[entry.serviceType]
                )}
              >
                {serviceTypeLabels[entry.serviceType]}
              </span>
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {entry.startTime} - {entry.endTime}
                </span>
                {entry.breakMinutes > 0 && (
                  <span className="text-muted-foreground">
                    ({entry.breakMinutes}min descanso)
                  </span>
                )}
              </div>
            </div>
            <span
              className={cn(
                'rounded-lg px-2 py-0.5 text-xs font-medium',
                entry.scope === 'international'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {entry.scope === 'international' ? 'INT' : 'NAC'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(entry.fullDietsNational + entry.fullDietsInternational) > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
                <Utensils className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">
                  {entry.fullDietsNational + entry.fullDietsInternational} dieta{(entry.fullDietsNational + entry.fullDietsInternational) > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {entry.overnights > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
                <Moon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{entry.overnights} pernocta{entry.overnights > 1 ? 's' : ''}</span>
              </div>
            )}
            {entry.kilometers > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
                <Route className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{entry.kilometers} km</span>
              </div>
            )}
            {entry.extraHours > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1">
                <Clock className="h-3 w-3 text-warning" />
                <span className="text-xs text-warning">{entry.extraHours}h extra</span>
              </div>
            )}
            {entry.tips > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1">
                <Coins className="h-3 w-3 text-success" />
                <span className="text-xs text-success">{entry.tips}€</span>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
