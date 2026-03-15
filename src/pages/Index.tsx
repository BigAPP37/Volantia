import { useState, useMemo, useCallback } from 'react';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { LogIn, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Plus, Clock, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useAuth } from '@/hooks/useAuth';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useWorkEntryCustomRates } from '@/hooks/useWorkEntryCustomRates';
import { calculateMonthlySummary, calculateDayValue, formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Custom rates per entry (Día extra, Dieta finde, ½ Noctu, etc.)
  const entryIds = useMemo(() => entries.map(e => e.id), [entries]);
  const { getEntryCustomRatesValue } = useWorkEntryCustomRates(entryIds);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStr = format(currentMonth, 'yyyy-MM');

  // Summary
  const summary = useMemo(() => {
    return calculateMonthlySummary(entries, monthStr, settings);
  }, [entries, monthStr, settings]);

  // Previous month comparison
  const prevSummary = useMemo(() => {
    const prev = format(subMonths(currentMonth, 1), 'yyyy-MM');
    return calculateMonthlySummary(entries, prev, settings);
  }, [entries, currentMonth, settings]);

  const netDiff = summary.netEstimate - prevSummary.netEstimate;

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Entries by date — includes standard rates + custom rates (Día extra, Dieta finde, ½ Noctu…)
  const entriesByDate = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      const key = entry.date;
      const prev = map.get(key) || 0;
      const standardValue = calculateDayValue(entry, settings);
      const customValue = getEntryCustomRatesValue(entry.id);
      map.set(key, prev + standardValue + customValue);
    });
    return map;
  }, [entries, settings, getEntryCustomRatesValue]);

  // Service type by date (for calendar colors)
  const serviceTypeByDate = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach(entry => {
      map.set(entry.date, entry.serviceType);
    });
    return map;
  }, [entries]);

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEntries = entries.filter(e => e.date === dateStr);
    
    try { localStorage.setItem('volantia-selected-date', dateStr); } catch {}

    if (dayEntries.length > 0) {
      navigate(`/new-entry?id=${dayEntries[0].id}&date=${dateStr}`);
    } else {
      navigate(`/new-entry?date=${dateStr}`);
    }
  };

  if (authLoading || entriesLoading) {
    return (
      <AppLayout title="Volantia">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (showOnboarding && user) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  const today = new Date();

  return (
    <AppLayout title="Volantia">
      <PageTransition>
        <div className="space-y-5">
          {/* Auth Banner */}
          {!user && (
            <div className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
              <p className="text-sm text-muted-foreground">Modo invitado</p>
              <Link to="/auth">
                <Button size="sm" className="rounded-xl h-8 text-xs">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Acceder
                </Button>
              </Link>
            </div>
          )}

          {/* ═══ HERO: The only number that matters ═══ */}
          <div className="pt-2 pb-1">
            <p className="text-sm text-slate-500 font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-5xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {summary.netEstimate.toFixed(0)}
                <span className="text-2xl font-semibold text-slate-500 ml-0.5">€</span>
              </span>
              {prevSummary.netEstimate > 0 && (
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full mb-2 flex items-center gap-0.5',
                  netDiff > 10 ? 'bg-emerald-500/10 text-emerald-400' :
                  netDiff < -10 ? 'bg-red-500/10 text-red-400' :
                  'bg-white/5 text-slate-500'
                )}>
                  {netDiff > 10 && <TrendingUp className="h-3 w-3" />}
                  {netDiff < -10 && <TrendingDown className="h-3 w-3" />}
                  {Math.abs(netDiff) <= 10 && <Minus className="h-3 w-3" />}
                  {netDiff > 0 ? '+' : ''}{netDiff.toFixed(0)}€
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">Neto estimado</p>
          </div>

          {/* ═══ QUICK STATS ═══ */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl p-3 text-center border border-white/[0.06]" style={{ background: 'rgba(13,22,45,0.7)' }}>
              <p className="text-xl font-bold text-white">{summary.totalWorkDays}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Días</p>
            </div>
            <div className="rounded-xl p-3 text-center border border-white/[0.06]" style={{ background: 'rgba(13,22,45,0.7)' }}>
              <p className="text-xl font-bold text-white">{Math.round(summary.totalHours)}h</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Horas</p>
            </div>
            <div className="rounded-xl p-3 text-center border border-white/[0.06]" style={{ background: 'rgba(13,22,45,0.7)' }}>
              <p className="text-xl font-bold text-white">{summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Dietas</p>
            </div>
            <div className="rounded-xl p-3 text-center border border-white/[0.06]" style={{ background: 'rgba(13,22,45,0.7)' }}>
              <p className="text-xl font-bold text-white">{summary.totalKilometers}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Km</p>
            </div>
          </div>

          {/* ═══ COMPACT CALENDAR ═══ */}
          <div className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: 'rgba(13,22,45,0.72)' }}>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cn(
                  'text-center text-[10px] font-medium py-1',
                  i >= 5 ? 'text-primary/60' : 'text-muted-foreground'
                )}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const inMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayValue = entriesByDate.get(dateStr) || 0;
                const hasEntry = entries.some(e => e.date === dateStr);
                const sType = serviceTypeByDate.get(dateStr);

                // Color by service type
                const entryBg = hasEntry && inMonth ? (
                  sType === 'extra' ? 'bg-amber-500/15' :
                  sType === 'rest' ? 'bg-emerald-500/15' :
                  sType === 'sick' ? 'bg-red-500/15' :
                  'bg-primary/10'
                ) : '';

                const valueColor = (
                  sType === 'extra' ? 'text-amber-400' :
                  sType === 'rest' ? 'text-emerald-400' :
                  sType === 'sick' ? 'text-red-400' :
                  'text-blue-400'
                );

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={!inMonth}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg py-2 min-h-[44px] transition-all',
                      !inMonth && 'opacity-20',
                      inMonth && 'active:scale-90',
                      isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                      entryBg,
                    )}
                  >
                    <span className={cn(
                      'text-xs font-medium',
                      isToday && 'text-primary font-bold',
                      isWeekend(day) && !isToday && !hasEntry && 'text-muted-foreground',
                      hasEntry && inMonth && valueColor,
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasEntry && inMonth && dayValue > 0 && (
                      <span className={cn('text-[9px] font-semibold mt-0.5', valueColor)}>
                        {dayValue.toFixed(0)}€
                      </span>
                    )}
                    {hasEntry && inMonth && dayValue === 0 && (
                      <span className={cn('text-[9px] font-medium mt-0.5', valueColor)}>
                        0€
                      </span>
                    )}
                    {!hasEntry && inMonth && (
                      <span className="w-1 h-1 rounded-full bg-border mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-3 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/30" />
                <span className="text-[10px] text-slate-500">Regular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30" />
                <span className="text-[10px] text-slate-500">Extra</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
                <span className="text-[10px] text-slate-500">Descanso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500/30" />
                <span className="text-[10px] text-slate-500">Baja</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const todayStr = format(today, 'yyyy-MM-dd');
              const todayEntries = entries.filter(e => e.date === todayStr);
              if (todayEntries.length > 0) {
                navigate(`/new-entry?id=${todayEntries[0].id}&date=${todayStr}`);
              } else {
                navigate(`/new-entry?date=${todayStr}`);
              }
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]"
            style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.12)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Plus className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-sm text-white">
                {entries.some(e => e.date === format(today, 'yyyy-MM-dd'))
                  ? 'Editar jornada de hoy'
                  : 'Registrar jornada de hoy'
                }
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {format(today, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>

        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Index;
