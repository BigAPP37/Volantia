import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { LogIn } from 'lucide-react';
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
import { calculateMonthlySummary } from '@/lib/calculations';
import { MarkerType } from '@/types/dayMarker';

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();
  const { markers, addMarkers, removeMarkers } = useDayMarkers();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Fetch custom rates for all entries
  const entryIds = useMemo(() => entries.map((e) => e.id), [entries]);
  const { getEntryCustomRatesValue, getTotalCustomRatesValue } = useWorkEntryCustomRates(entryIds);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Filter entries for current month and get custom rates total for that month
  const { summary, totalCustomRates } = useMemo(() => {
    const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth));
    const baseSummary = calculateMonthlySummary(entries, currentMonth, settings);
    
    // Calculate custom rates for the month
    let customRatesTotal = 0;
    monthEntries.forEach((entry) => {
      customRatesTotal += getEntryCustomRatesValue(entry.id);
    });
    
    // Add custom rates to gross earnings and recalculate net
    baseSummary.grossEarnings += customRatesTotal;
    const totalDeductionRate = settings.irpf + settings.socialSecurity + settings.mei + settings.unemployment;
    baseSummary.deductions = baseSummary.grossEarnings * (totalDeductionRate / 100);
    baseSummary.netEstimate = baseSummary.grossEarnings - baseSummary.deductions;
    
    return { summary: baseSummary, totalCustomRates: customRatesTotal };
  }, [entries, currentMonth, settings, getEntryCustomRatesValue]);

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
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
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

  // Show onboarding for new users
  if (showOnboarding && user) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <AppLayout title="Volantia">
      <PageTransition>
      <div className="space-y-4">
        {/* Auth Banner (if not logged in) */}
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
                <Button className="rounded-xl">
                  <LogIn className="mr-2 h-4 w-4" />
                  Acceder
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* Summary Cards Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Neto Estimado */}
          <GlassCard className="p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Neto Estimado (Mes)
            </p>
            <p className="mt-1 text-xl font-bold text-primary">
              {summary.netEstimate.toFixed(0)} <span className="text-sm">€</span>
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Var: {(summary.grossEarnings - settings.baseSalary - settings.fixedBonuses).toFixed(0)}
            </p>
          </GlassCard>

          {/* Dietas / Noches */}
          <GlassCard className="p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Dietas / Noches
            </p>
            <p className="mt-1 text-xl font-bold">
              {summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}{' '}
              <span className="text-muted-foreground">/</span>{' '}
              {summary.totalOvernights}
            </p>
          </GlassCard>

          {/* Kms Totales */}
          <GlassCard className="p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              KMs Totales
            </p>
            <p className="mt-1 text-xl font-bold">{summary.totalKilometers}</p>
          </GlassCard>
        </div>

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

        {/* Day Detail (hidden in multi-select mode) */}
        {!multiSelectMode && (
          <DayDetail date={selectedDate} entries={selectedDateEntries} />
        )}
      </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Index;
