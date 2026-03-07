import { useState, useMemo, useCallback } from 'react';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { LogIn, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Calendar } from '@/components/dashboard/Calendar';
import { DayDetail } from '@/components/dashboard/DayDetail';
import { MultiSelectToolbar } from '@/components/dashboard/MultiSelectToolbar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useAuth } from '@/hooks/useAuth';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useDayMarkers } from '@/hooks/useDayMarkers';
import { useWorkEntryCustomRates } from '@/hooks/useWorkEntryCustomRates';
import { useOnboarding } from '@/hooks/useOnboarding';
import { calculateMonthlySummary, formatCurrency } from '@/lib/calculations';
import { MarkerType } from '@/types/dayMarker';

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();
  const { markers, addMarkers, removeMarkers } = useDayMarkers();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const entryIds = useMemo(() => entries.map((e) => e.id), [entries]);
  const { getEntryCustomRatesValue } = useWorkEntryCustomRates(entryIds);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Current month summary
  const summary = useMemo(() => {
    const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth));
    const baseSummary = calculateMonthlySummary(entries, currentMonth, settings);
    let customRatesTotal = 0;
    monthEntries.forEach((entry) => {
      customRatesTotal += getEntryCustomRatesValue(entry.id);
    });
    baseSummary.grossEarnings += customRatesTotal;
    const totalDeductionRate = settings.irpf + settings.socialSecurity + settings.mei + settings.unemployment;
    baseSummary.deductions = baseSummary.grossEarnings * (totalDeductionRate / 100);
    baseSummary.netEstimate = baseSummary.grossEarnings - baseSummary.deductions;
    return baseSummary;
  }, [entries, currentMonth, settings, getEntryCustomRatesValue]);

  // Previous month for comparison
  const prevSummary = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = subMonths(new Date(year, month - 1), 1);
    const prevMonth = format(prevDate, 'yyyy-MM');
    return calculateMonthlySummary(entries, prevMonth, settings);
  }, [entries, currentMonth, settings]);

  const netDiff = summary.netEstimate - prevSummary.netEstimate;
  const netTrend = netDiff > 10 ? 'up' : netDiff < -10 ? 'down' : 'neutral';

  const selectedDateEntries = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return entries.filter((e) => e.date === dateStr);
  }, [entries, selectedDate]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  const handleToggleMultiSelect = useCallback(() => {
    setMultiSelectMode((prev) => !prev);
    setSelectedDates([]);
  }, []);

  const handleToggleDateSelection = useCallback((date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  }, []);

  const handleApplyMarker = useCallback(async (type: MarkerType) => {
    if (selectedDates.length === 0) return;
    await addMarkers(selectedDates, type);
    setSelectedDates([]);
    setMultiSelectMode(false);
  }, [selectedDates, addMarkers]);

  const handleClearMarkers = useCallback(async () => {
    if (selectedDates.length === 0) return;
    await removeMarkers(selectedDates);
    setSelectedDates([]);
    setMultiSelectMode(false);
  }, [selectedDates, removeMarkers]);

  const handleCancelMultiSelect = useCallback(() => {
    setMultiSelectMode(false);
    setSelectedDates([]);
  }, []);

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

  return (
    <AppLayout title="Volantia">
      <PageTransition>
        <div className="space-y-4">
          {/* Auth Banner */}
          {!user && (
            <GlassCard className="border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo Invitado</p>
                  <p className="text-sm text-muted-foreground">
                    Regístrate para sincronizar tus datos
                  </p>
                </div>
                <Link to="/auth">
                  <Button className="rounded-xl" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Acceder
                  </Button>
                </Link>
              </div>
            </GlassCard>
          )}

          {/* HERO CARD — The main story */}
          <GlassCard className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {format(new Date(currentMonth + '-01'), 'MMMM yyyy', { locale: es })}
              </p>

              {/* Net estimate - THE number */}
              <div className="mt-2 flex items-end gap-3">
                <p className="text-4xl font-extrabold tracking-tight text-foreground">
                  {summary.netEstimate.toFixed(0)}
                  <span className="text-xl font-semibold text-muted-foreground ml-1">€</span>
                </p>
                {prevSummary.netEstimate > 0 && (
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mb-1 ${
                    netTrend === 'up' ? 'bg-emerald-500/10 text-emerald-500' :
                    netTrend === 'down' ? 'bg-red-500/10 text-red-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {netTrend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {netTrend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {netTrend === 'neutral' && <Minus className="h-3 w-3" />}
                    {netDiff > 0 ? '+' : ''}{netDiff.toFixed(0)}€
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Neto estimado</p>

              {/* Quick stats row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-background/50 p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">{summary.totalWorkDays}</p>
                  <p className="text-[10px] text-muted-foreground">Días</p>
                </div>
                <div className="rounded-xl bg-background/50 p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Dietas</p>
                </div>
                <div className="rounded-xl bg-background/50 p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">{summary.totalKilometers}</p>
                  <p className="text-[10px] text-muted-foreground">Km</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Calendar */}
          <Calendar
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={handleMonthChange}
            settings={settings}
            markers={markers}
            multiSelectMode={multiSelectMode}
            selectedDates={selectedDates}
            onToggleMultiSelect={handleToggleMultiSelect}
            onToggleDateSelection={handleToggleDateSelection}
            getEntryCustomRatesValue={getEntryCustomRatesValue}
          />

          {/* Multi-select toolbar */}
          {multiSelectMode && (
            <MultiSelectToolbar
              selectedDates={selectedDates}
              onApplyMarker={handleApplyMarker}
              onClearMarkers={handleClearMarkers}
              onCancel={handleCancelMultiSelect}
            />
          )}

          {/* Day Detail */}
          {!multiSelectMode && (
            <DayDetail date={selectedDate} entries={selectedDateEntries} />
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Index;
