import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Euro,
  Route,
  Utensils,
  Moon,
  Calendar,
  FileDown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { calculateMonthlySummary, formatCurrency, formatHours } from '@/lib/calculations';

export default function Stats() {
  const navigate = useNavigate();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();

  const currentMonth = format(new Date(), 'yyyy-MM');
  const summary = useMemo(() => {
    return calculateMonthlySummary(entries, currentMonth, settings);
  }, [entries, currentMonth, settings]);

  // Calculate averages
  const avgHoursPerDay = summary.totalWorkDays > 0 
    ? summary.totalHours / summary.totalWorkDays 
    : 0;
  
  const avgEarningsPerDay = summary.totalWorkDays > 0 
    ? summary.netEstimate / summary.totalWorkDays 
    : 0;

  if (entriesLoading) {
    return (
      <AppLayout title="Estadísticas">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Estadísticas">
      <PageTransition>
      <div className="space-y-4">
        {/* Month Header */}
        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold capitalize">
              {format(new Date(), 'MMMM yyyy', { locale: es })}
            </h2>
          </div>
        </GlassCard>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Neto Estimado"
            value={formatCurrency(summary.netEstimate)}
            icon={Euro}
            variant="primary"
          />
          <SummaryCard
            title="Bruto Total"
            value={formatCurrency(summary.grossEarnings)}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Deductions */}
        <GlassCard>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Desglose
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Salario Base</span>
              <span className="font-medium">{formatCurrency(settings.baseSalary)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pluses Fijos</span>
              <span className="font-medium">{formatCurrency(settings.fixedBonuses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conceptos Variables</span>
              <span className="font-medium text-success">
                +{formatCurrency(summary.grossEarnings - settings.baseSalary - settings.fixedBonuses)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deducciones</span>
                <span className="font-medium text-destructive">
                  -{formatCurrency(summary.deductions)}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Work Stats */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Días Trabajados"
            value={summary.totalWorkDays}
            icon={Calendar}
          />
          <SummaryCard
            title="Horas Totales"
            value={formatHours(summary.totalHours)}
            icon={Clock}
          />
        </div>

        {/* Averages */}
        <GlassCard>
          <h3 className="mb-3 font-semibold">Promedios</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {formatHours(avgHoursPerDay)}
              </p>
              <p className="text-xs text-muted-foreground">Media horas/día</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-success">
                {formatCurrency(avgEarningsPerDay)}
              </p>
              <p className="text-xs text-muted-foreground">Media €/día</p>
            </div>
          </div>
        </GlassCard>

        {/* Concepts Summary */}
        <GlassCard>
          <h3 className="mb-3 font-semibold">Conceptos Acumulados</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted p-3 text-center">
              <Utensils className="mx-auto mb-1 h-5 w-5 text-warning" />
              <p className="text-lg font-bold">
                {summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}
              </p>
              <p className="text-xs text-muted-foreground">Dietas</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <Moon className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-lg font-bold">{summary.totalOvernights}</p>
              <p className="text-xs text-muted-foreground">Pernoctas</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <Route className="mx-auto mb-1 h-5 w-5 text-success" />
              <p className="text-lg font-bold">{summary.totalKilometers}</p>
              <p className="text-xs text-muted-foreground">Km</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3 text-center">
              <Clock className="mx-auto mb-1 h-5 w-5 text-destructive" />
              <p className="text-lg font-bold">{summary.totalExtraHours}h</p>
              <p className="text-xs text-muted-foreground">Horas extra</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <Euro className="mx-auto mb-1 h-5 w-5 text-success" />
              <p className="text-lg font-bold">{formatCurrency(summary.totalTips)}</p>
              <p className="text-xs text-muted-foreground">Propinas</p>
            </div>
          </div>
        </GlassCard>

        {/* Export Button */}
        <Button
          onClick={() => navigate('/export')}
          className="w-full rounded-xl"
          variant="outline"
        >
          <FileDown className="mr-2 h-5 w-5" />
          Exportar informe PDF
        </Button>
      </div>
      </PageTransition>
    </AppLayout>
  );
}
