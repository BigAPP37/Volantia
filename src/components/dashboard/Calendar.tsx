import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { WorkEntry, UserSettings } from '@/types';
import { DayMarker, MarkerType, getMarkerConfig, MARKER_TYPES } from '@/types/dayMarker';
import { calculateDayValue } from '@/lib/calculations';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  entries: WorkEntry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  settings: UserSettings;
  markers?: DayMarker[];
  multiSelectMode?: boolean;
  selectedDates?: string[];
  onToggleMultiSelect?: () => void;
  onToggleDateSelection?: (date: string) => void;
  getEntryCustomRatesValue?: (entryId: string) => number;
}

const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export function Calendar({
  entries,
  selectedDate,
  onSelectDate,
  onMonthChange,
  settings,
  markers = [],
  multiSelectMode = false,
  selectedDates = [],
  onToggleMultiSelect,
  onToggleDateSelection,
  getEntryCustomRatesValue,
}: CalendarProps) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, WorkEntry[]>();
    entries.forEach((entry) => {
      const key = entry.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });
    return map;
  }, [entries]);

  const markersByDate = useMemo(() => {
    const map = new Map<string, DayMarker>();
    markers.forEach((marker) => {
      map.set(marker.date, marker);
    });
    return map;
  }, [markers]);

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entriesByDate.get(dateStr) || [];
    const marker = markersByDate.get(dateStr);
    
    let totalValue = 0;
    let hasInternational = false;
    let hasRest = false;
    
    dayEntries.forEach(entry => {
      totalValue += calculateDayValue(entry, settings);
      // Add custom rates value for this entry
      if (getEntryCustomRatesValue) {
        totalValue += getEntryCustomRatesValue(entry.id);
      }
      if (entry.scope === 'international') hasInternational = true;
      if (entry.serviceType === 'rest') hasRest = true;
    });
    
    return {
      value: totalValue,
      hasInternational,
      hasRest,
      hasEntries: dayEntries.length > 0,
      marker,
    };
  };

  return (
    <GlassCard className="animate-slide-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Calendario</h2>
          {onToggleMultiSelect && (
            <Button
              variant={multiSelectMode ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleMultiSelect}
              className={cn(
                'h-8 rounded-lg',
                multiSelectMode && 'bg-primary text-primary-foreground'
              )}
            >
              <CheckSquare className="mr-1.5 h-4 w-4" />
              {multiSelectMode ? 'Seleccionando' : 'Seleccionar'}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="min-w-[100px] text-center text-sm font-medium capitalize">
            {format(currentMonth, 'MMM yyyy', { locale: es })}
          </span>
          
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-2 text-center text-xs font-medium',
              index >= 5 ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isWeekendDay = isWeekend(day);
          const dayInfo = getDayInfo(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const isMultiSelected = selectedDates.includes(dateStr);
          const markerConfig = dayInfo.marker ? getMarkerConfig(dayInfo.marker.marker_type as MarkerType) : null;

          const handleDayClick = () => {
            if (multiSelectMode && isCurrentMonth) {
              onToggleDateSelection?.(dateStr);
              return;
            }

            onSelectDate(day);

            // Persist selection for the global "+" button (bottom navigation)
            try {
              localStorage.setItem('volantia-selected-date', dateStr);
            } catch {
              // ignore storage failures (private mode, etc.)
            }

            if (!isCurrentMonth) return;

            // If there are entries for this day, navigate to edit the first one.
            // Otherwise, start a new entry prefilled with this date.
            const dayEntries = entriesByDate.get(dateStr) || [];
            if (dayEntries.length > 0) {
              navigate(`/new-entry?id=${dayEntries[0].id}&date=${dateStr}`);
              return;
            }

            navigate(`/new-entry?date=${dateStr}`);
          };

          // Determine background color based on marker type
          const getBackgroundClass = () => {
            if (!isCurrentMonth) return '';
            if (markerConfig) return markerConfig.bgColor;
            if (dayInfo.hasRest) return 'bg-success/10 border-success/30';
            if (dayInfo.hasEntries) return 'bg-warning/10 border-warning/30';
            if (isWeekendDay) return 'bg-muted/30';
            return '';
          };

          return (
            <button
              key={day.toISOString()}
              onClick={handleDayClick}
              className={cn(
                'relative flex min-h-[60px] flex-col items-start justify-start rounded-lg border p-1.5 text-left transition-all',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                !isCurrentMonth && 'opacity-30',
                isCurrentMonth && 'border-border',
                getBackgroundClass(),
                isToday && 'ring-2 ring-primary',
                isSelected && !multiSelectMode && 'border-primary bg-primary/10',
                isMultiSelected && 'border-primary border-2 bg-primary/20'
              )}
            >
              {/* Multi-select indicator */}
              {multiSelectMode && isCurrentMonth && (
                <div className={cn(
                  'absolute right-1 top-1 h-4 w-4 rounded border-2 transition-colors',
                  isMultiSelected ? 'border-primary bg-primary' : 'border-muted-foreground/50 bg-background'
                )}>
                  {isMultiSelected && (
                    <svg className="h-full w-full text-primary-foreground" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              )}

              {/* Day number */}
              <span className={cn(
                'text-xs font-medium',
                isToday && 'flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground',
                !isToday && isWeekendDay && 'text-primary',
                markerConfig && !isToday && markerConfig.color
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Value */}
              {dayInfo.hasEntries && isCurrentMonth && dayInfo.value > 0 && (
                <span className="mt-auto text-[10px] font-semibold text-foreground">
                  {dayInfo.value.toFixed(0)}€
                </span>
              )}

              {/* Marker badge */}
              {markerConfig && isCurrentMonth && !multiSelectMode && (
                <span className={cn(
                  'mt-auto text-[8px] font-medium uppercase',
                  markerConfig.color
                )}>
                  {dayInfo.marker?.marker_type === 'rest' && 'DES'}
                  {dayInfo.marker?.marker_type === 'vacation' && 'VAC'}
                  {dayInfo.marker?.marker_type === 'sick_leave' && 'BAJA'}
                  {dayInfo.marker?.marker_type === 'trip' && 'VIAJE'}
                </span>
              )}
              
              {/* Badges for entries */}
              {dayInfo.hasEntries && isCurrentMonth && !multiSelectMode && !markerConfig && (
                <div className="absolute right-1 top-1 flex gap-0.5">
                  {dayInfo.hasInternational && (
                    <span className="rounded bg-primary/20 px-1 text-[8px] font-medium text-primary">
                      INT
                    </span>
                  )}
                  {dayInfo.hasRest && (
                    <span className="rounded bg-success/20 px-1 text-[8px] font-medium text-success">
                      DES
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-warning/30 bg-warning/10" />
          <span className="text-muted-foreground">Trabajo</span>
        </div>
        {MARKER_TYPES.map((marker) => (
          <div key={marker.value} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded', marker.bgColor)} />
            <span className="text-muted-foreground">{marker.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
