import { useMemo, useState } from 'react';
import { format, subMonths, parseISO } from 'date-fns';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import {
  calculateMonthlySummary,
  calculateDayValue,
  calculateWorkHours,
  formatCurrency,
  formatHours,
} from '@/lib/calculations';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Stats() {
  const navigate = useNavigate();
  const { entries, isLoading: entriesLoading } = useWorkEntries();
  const { settings } = useUserSettings();

  const [monthOffset, setMonthOffset] = useState(0);
  const currentDate = subMonths(new Date(), monthOffset);
  const currentMonth = format(currentDate, 'yyyy-MM');

  const summary = useMemo(() => {
    return calculateMonthlySummary(entries, currentMonth, settings);
  }, [entries, currentMonth, settings]);

  const dailyData = useMemo(() => {
    const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth));
    const byDay = new Map<string, { earnings: number; hours: number }>();

    monthEntries.forEach((entry) => {
      const day = entry.date;
      const prev = byDay.get(day) || { earnings: 0, hours: 0 };
      prev.earnings += calculateDayValue(entry, settings);
      if (entry.serviceType === 'regular' || entry.serviceType === 'extra') {
        prev.hours += calculateWorkHours(entry.startTime, entry.endTime, entry.breakMinutes);
      }
      byDay.set(day, prev);
    });

    return Array.from(byDay.entries())
      .map(([date, data]) => ({
        day: format(parseISO(date), 'd'),
        date,
        earnings: Math.round(data.earnings * 100) / 100,
        hours: Math.round(data.hours * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, currentMonth, settings]);

  const breakdownData = useMemo(() => {
    const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth));
    let diets = 0, overnights = 0, nightHours = 0, extraHours = 0, kilometers = 0, tips = 0;

    monthEntries.forEach((entry) => {
      diets += entry.fullDietsNational * settings.fullDietNational
        + entry.halfDietsNational * settings.halfDietNational
        + entry.fullDietsInternational * settings.fullDietInternational
        + entry.halfDietsInternational * settings.halfDietInternational;
      overnights += entry.overnights * (entry.scope === 'international' ? settings.overnightInternational : settings.overnightNational);
      nightHours += entry.nightHours * settings.nightHourRate + entry.halfNightHours * settings.halfNightHourRate;
      extraHours += entry.extraHours * settings.extraHourRate;
      kilometers += entry.kilometers * settings.kilometerRate;
      tips += entry.tips;
    });

    return [
      { name: 'Dietas', value: Math.round(diets * 100) / 100 },
      { name: 'Pernoctas', value: Math.round(overnights * 100) / 100 },
      { name: 'Nocturnidad', value: Math.round(nightHours * 100) / 100 },
      { name: 'H. Extra', value: Math.round(extraHours * 100) / 100 },
      { name: 'Kilómetros', value: Math.round(kilometers * 100) / 100 },
      { name: 'Propinas', value: Math.round(tips * 100) / 100 },
    ].filter((d) => d.value > 0);
  }, [entries, currentMonth, settings]);

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(currentDate, i);
      const m = format(d, 'yyyy-MM');
      const s = calculateMonthlySummary(entries, m, settings);
      months.push({
        month: format(d, 'MMM', { locale: es }),
        neto: Math.round(s.netEstimate),
        bruto: Math.round(s.grossEarnings),
        dias: s.totalWorkDays,
      });
    }
    return months;
  }, [entries, currentDate, settings]);

  const avgHoursPerDay = summary.totalWorkDays > 0 ? summary.totalHours / summary.totalWorkDays : 0;
  const avgEarningsPerDay = summary.totalWorkDays > 0 ? summary.netEstimate / summary.totalWorkDays : 0;

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
          {/* Month Selector */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setMonthOffset((p) => p + 1)} className="h-8 w-8 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold capitalize">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMonthOffset((p) => Math.max(0, p - 1))} disabled={monthOffset === 0} className="h-8 w-8 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </GlassCard>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard title="Neto Estimado" value={formatCurrency(summary.netEstimate)} icon={Euro} variant="primary" />
            <SummaryCard title="Bruto Total" value={formatCurrency(summary.grossEarnings)} icon={TrendingUp} variant="success" />
          </div>

          {/* Trend Chart */}
          <GlassCard>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evolución (6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(value: number, name: string) => [`${value}€`, name === 'neto' ? 'Neto' : 'Bruto']} />
                <Area type="monotone" dataKey="neto" stroke="#3b82f6" strokeWidth={2} fill="url(#colorNeto)" />
                <Line type="monotone" dataKey="bruto" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Daily Earnings */}
          {dailyData.length > 0 && (
            <GlassCard>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
                <BarChart3 className="h-4 w-4 text-primary" />
                Ingresos variables por día
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(value: number) => [`${value}€`, 'Variable']} />
                  <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Pie Chart Breakdown */}
          {breakdownData.length > 0 && (
            <GlassCard>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
                <Euro className="h-4 w-4 text-primary" />
                Desglose variable
              </h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {breakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(value: number) => [`${value}€`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {breakdownData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}€</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Nómina Breakdown */}
          <GlassCard>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              Nómina
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Salario Base</span>
                <span className="font-medium">{formatCurrency(settings.baseSalary)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pluses Fijos</span>
                <span className="font-medium">{formatCurrency(settings.fixedBonuses)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Variables</span>
                <span className="font-medium text-emerald-500">+{formatCurrency(summary.grossEarnings - settings.baseSalary - settings.fixedBonuses)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deducciones</span>
                  <span className="font-medium text-destructive">-{formatCurrency(summary.deductions)}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Work Stats */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard title="Días Trabajados" value={summary.totalWorkDays} icon={Calendar} />
            <SummaryCard title="Horas Totales" value={formatHours(summary.totalHours)} icon={Clock} />
          </div>

          {/* Averages */}
          <GlassCard>
            <h3 className="mb-3 font-semibold text-sm">Promedios</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-2xl font-bold text-primary">{formatHours(avgHoursPerDay)}</p>
                <p className="text-xs text-muted-foreground">Media horas/día</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(avgEarningsPerDay)}</p>
                <p className="text-xs text-muted-foreground">Media €/día</p>
              </div>
            </div>
          </GlassCard>

          {/* Concepts */}
          <GlassCard>
            <h3 className="mb-3 font-semibold text-sm">Conceptos Acumulados</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-3 text-center">
                <Utensils className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                <p className="text-lg font-bold">{summary.totalFullDietsNational + summary.totalFullDietsInternational + summary.totalHalfDietsNational + summary.totalHalfDietsInternational}</p>
                <p className="text-[10px] text-muted-foreground">Dietas</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <Moon className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-lg font-bold">{summary.totalOvernights}</p>
                <p className="text-[10px] text-muted-foreground">Pernoctas</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <Route className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                <p className="text-lg font-bold">{summary.totalKilometers}</p>
                <p className="text-[10px] text-muted-foreground">Km</p>
              </div>
            </div>
          </GlassCard>

          {/* Export */}
          <Button onClick={() => navigate('/export')} className="w-full rounded-xl" variant="outline">
            <FileDown className="mr-2 h-5 w-5" />
            Exportar informe PDF
          </Button>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
