import { WorkEntry, UserSettings, MonthlySummary } from '@/types';
import { format, parseISO, differenceInMinutes, isWeekend } from 'date-fns';

export function calculateWorkHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  
  // Handle overnight shifts
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  
  totalMinutes -= breakMinutes;
  
  return Math.max(0, totalMinutes / 60);
}

export function calculateDayValue(entry: WorkEntry, settings: UserSettings): number {
  const isInternational = entry.scope === 'international';
  const date = parseISO(entry.date);
  const isWeekendDay = isWeekend(date);
  const weekendMultiplier = isWeekendDay ? settings.weekendMultiplier : 1;

  let total = 0;

  // National Diets
  total += entry.fullDietsNational * settings.fullDietNational * weekendMultiplier;
  total += entry.halfDietsNational * settings.halfDietNational * weekendMultiplier;

  // International Diets
  total += entry.fullDietsInternational * settings.fullDietInternational * weekendMultiplier;
  total += entry.halfDietsInternational * settings.halfDietInternational * weekendMultiplier;

  // Overnights (still uses scope for now)
  const overnightRate = isInternational ? settings.overnightInternational : settings.overnightNational;
  total += entry.overnights * overnightRate;

  // Night hours
  total += entry.nightHours * settings.nightHourRate;
  total += entry.halfNightHours * settings.halfNightHourRate;

  // Extra hours
  total += entry.extraHours * settings.extraHourRate;

  // Kilometers
  total += entry.kilometers * settings.kilometerRate;

  // Tips (direct)
  total += entry.tips;

  return total;
}

export function calculateExemptValue(entry: WorkEntry, settings: UserSettings): number {
  const date = parseISO(entry.date);
  const isWeekendDay = isWeekend(date);
  const weekendMultiplier = isWeekendDay ? settings.weekendMultiplier : 1;
  const isInternational = entry.scope === 'international';

  let exempt = 0;

  // Diets are exempt from IRPF and SS
  exempt += entry.fullDietsNational * settings.fullDietNational * weekendMultiplier;
  exempt += entry.halfDietsNational * settings.halfDietNational * weekendMultiplier;
  exempt += entry.fullDietsInternational * settings.fullDietInternational * weekendMultiplier;
  exempt += entry.halfDietsInternational * settings.halfDietInternational * weekendMultiplier;

  // Overnights are exempt
  const overnightRate = isInternational ? settings.overnightInternational : settings.overnightNational;
  exempt += entry.overnights * overnightRate;

  // Kilometers are exempt
  exempt += entry.kilometers * settings.kilometerRate;

  return exempt;
}

export function calculateTaxableValue(entry: WorkEntry, settings: UserSettings): number {
  let taxable = 0;

  // Night hours are taxable
  taxable += entry.nightHours * settings.nightHourRate;
  taxable += entry.halfNightHours * settings.halfNightHourRate;

  // Extra hours are taxable
  taxable += entry.extraHours * settings.extraHourRate;

  // Tips are taxable
  taxable += entry.tips;

  return taxable;
}

export function calculateMonthlySummary(
  entries: WorkEntry[],
  month: string, // YYYY-MM
  settings: UserSettings
): MonthlySummary {
  const monthEntries = entries.filter((e) => e.date.startsWith(month));

  const summary: MonthlySummary = {
    month,
    totalWorkDays: 0,
    totalHours: 0,
    totalBreakMinutes: 0,
    totalFullDietsNational: 0,
    totalHalfDietsNational: 0,
    totalFullDietsInternational: 0,
    totalHalfDietsInternational: 0,
    totalOvernights: 0,
    totalNightHours: 0,
    totalHalfNightHours: 0,
    totalExtraHours: 0,
    totalKilometers: 0,
    totalTips: 0,
    grossEarnings: 0,
    deductions: 0,
    netEstimate: 0,
  };

  const workDays = new Set<string>();
  let totalExempt = 0;
  let totalTaxable = 0;

  monthEntries.forEach((entry) => {
    if (entry.serviceType === 'regular' || entry.serviceType === 'extra') {
      workDays.add(entry.date);
      
      const hours = calculateWorkHours(entry.startTime, entry.endTime, entry.breakMinutes);
      summary.totalHours += hours;
      summary.totalBreakMinutes += entry.breakMinutes;
    }

    summary.totalFullDietsNational += entry.fullDietsNational;
    summary.totalHalfDietsNational += entry.halfDietsNational;
    summary.totalFullDietsInternational += entry.fullDietsInternational;
    summary.totalHalfDietsInternational += entry.halfDietsInternational;
    summary.totalOvernights += entry.overnights;
    summary.totalNightHours += entry.nightHours;
    summary.totalHalfNightHours += entry.halfNightHours;
    summary.totalExtraHours += entry.extraHours;
    summary.totalKilometers += entry.kilometers;
    summary.totalTips += entry.tips;

    totalExempt += calculateExemptValue(entry, settings);
    totalTaxable += calculateTaxableValue(entry, settings);
  });

  summary.totalWorkDays = workDays.size;

  // Taxable base: salary + fixed bonuses + taxable variable concepts
  const taxableBase = settings.baseSalary + settings.fixedBonuses + totalTaxable;

  // Gross earnings = taxable + exempt
  summary.grossEarnings = taxableBase + totalExempt;

  // Deductions apply ONLY to taxable base (exempt concepts like diets, overnights, km are excluded)
  const ssRate = settings.socialSecurity + settings.mei + settings.unemployment;
  const ssDeductions = taxableBase * (ssRate / 100);
  const irpfDeductions = taxableBase * (settings.irpf / 100);
  summary.deductions = ssDeductions + irpfDeductions;
  summary.netEstimate = summary.grossEarnings - summary.deductions;

  return summary;
}

export function autoCalculateEntry(
  entry: Partial<WorkEntry>,
  settings: UserSettings
): Partial<WorkEntry> {
  if (!entry.startTime || !entry.endTime) return entry;

  const hours = calculateWorkHours(entry.startTime, entry.endTime, entry.breakMinutes || 0);
  const updates: Partial<WorkEntry> = { ...entry };

  // Auto-calculate diets based on hours (default to national)
  if (hours >= 10) {
    updates.fullDietsNational = 1;
    updates.halfDietsNational = 0;
  } else if (hours >= 5) {
    updates.fullDietsNational = 0;
    updates.halfDietsNational = 1;
  } else {
    updates.fullDietsNational = 0;
    updates.halfDietsNational = 0;
  }

  // Auto-calculate extra hours (over 8h standard)
  if (hours > 8) {
    updates.extraHours = Math.round((hours - 8) * 10) / 10;
  } else {
    updates.extraHours = 0;
  }

  // Calculate night hours (22:00 - 06:00)
  const [startH] = entry.startTime.split(':').map(Number);
  const [endH] = entry.endTime.split(':').map(Number);
  
  if (startH >= 22 || endH <= 6 || endH < startH) {
    // Simplified night hour calculation
    let nightHours = 0;
    
    if (startH >= 22) {
      nightHours += Math.min(hours, 24 - startH + Math.min(6, endH));
    } else if (endH <= 6) {
      nightHours += Math.min(hours, endH);
    } else if (endH < startH) {
      // Overnight shift
      nightHours += Math.min(hours, (24 - startH) + Math.min(6, endH));
    }
    
    updates.nightHours = Math.round(nightHours * 10) / 10;
  }

  return updates;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
