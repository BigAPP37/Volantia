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
import { calculateMonthlySummary, calculateDayValue, formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();
  const { showOnboarding, completeOnboarding } = useOnboarding();

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

  // Entries by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      const key = entry.date;
      const prev = map.get(key) || 0;
      map.set(key, prev + calculateDayValue(entry, settings));
    });
    return map;
  }, [entries, settings]);

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
            <p className="text-sm text-muted-foreground font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-5xl font-extrabold tracking-tight tabular-nums">
                {summary.netEstimate.toFixed(0)}
                <span className="text-2xl font-semibold text-muted-foreground ml-0.5">€</span>
              </span>
              {prevSummary.netEstimate > 0 && (
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full mb-2 flex items-center gap-0.5',
                  netDiff > 10 ? 'bg-emerald-500/10 text-emerald-500' :
                  netDiff < -10 ? 'bg-red-500/10 text-red-500' :
                  'bg-muted text-muted-foreground'
                )}>
                  {netDiff > 10 && <TrendingUp className="h-3 w-3" />}
                  {netDiff < -10 && <TrendingDown className="h-3 w-3" />}
                  {Math.abs(netDiff) <= 10 && <Minus className="h-3 w-3" />}
                  {netDiff > 0 ? '+' : ''}{netDiff.toFixed(0)}€
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Neto estimado</p>
          </div>

          {/* ═══ QUICK STATS ═══ */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-card/50 rounded-xl p-3 text-center border border-border/30">
              <p className="text-xl font-bold">{summary.totalWorkDays}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Días</p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center border border-border/30">
              <p className="text-xl font-bold">{Math.round(summary.totalHours)}h</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Horas</p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center border border-border/30">
              <p className="text-xl font-bold">{summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dietas</p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center border border-border/30">
              <p className="text-xl font-bold">{summary.totalKilometers}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Km</p>
            </div>
          </div>

          {/* ═══ COMPACT CALENDAR ═══ */}
          <div className="bg-card/40 rounded-2xl p-4 border border-border/30">
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
                const hasEntry = dayValue > 0;

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
                      hasEntry && inMonth && 'bg-primary/10',
                    )}
                  >
                    <span className={cn(
                      'text-xs font-medium',
                      isToday && 'text-primary font-bold',
                      isWeekend(day) && !isToday && 'text-muted-foreground',
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasEntry && inMonth && (
                      <span className="text-[9px] font-semibold text-primary mt-0.5">
                        {dayValue.toFixed(0)}€
                      </span>
                    )}
                    {!hasEntry && inMonth && (
                      <span className="w-1 h-1 rounded-full bg-border mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ TODAY QUICK ACTION ═══ */}
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
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 transition-all active:scale-[0.98] hover:bg-primary/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">
                {entries.some(e => e.date === format(today, 'yyyy-MM-dd'))
                  ? 'Editar jornada de hoy'
                  : 'Registrar jornada de hoy'
                }
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {format(today, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Index;
