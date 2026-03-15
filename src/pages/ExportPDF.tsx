import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  FileDown,
  Calendar,
  Utensils,
  Moon,
  Clock,
  Route,
  Euro,
  Check,
  Star,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useCustomRates } from '@/hooks/useCustomRates';
import { useToast } from '@/hooks/use-toast';
import { calculateWorkHours, formatCurrency } from '@/lib/calculations';
import type { WorkEntry } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ConceptOption {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

interface CustomRateOption {
  id: string;
  label: string;
  enabled: boolean;
}

export default function ExportPDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { entries } = useWorkEntries();
  const { settings } = useUserSettings();
  const { customRates } = useCustomRates();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const [concepts, setConcepts] = useState<ConceptOption[]>([
    { id: 'startTime', label: 'Hora inicio', icon: Clock, enabled: true },
    { id: 'endTime', label: 'Hora fin', icon: Clock, enabled: true },
    { id: 'workHours', label: 'Horas trabajadas', icon: Clock, enabled: true },
    { id: 'fullDiets', label: 'Dietas completas', icon: Utensils, enabled: true },
    { id: 'halfDiets', label: 'Medias dietas', icon: Utensils, enabled: true },
    { id: 'overnights', label: 'Pernoctas', icon: Moon, enabled: true },
    { id: 'nightHours', label: 'Nocturnidades', icon: Moon, enabled: true },
    { id: 'halfNightHours', label: 'Medias nocturnidades', icon: Moon, enabled: true },
    { id: 'extraHours', label: 'Horas extra', icon: Clock, enabled: true },
    { id: 'kilometers', label: 'Kilómetros', icon: Route, enabled: true },
    { id: 'tips', label: 'Propinas', icon: Euro, enabled: true },
  ]);

  // Custom rates as additional concepts
  const [customRateConcepts, setCustomRateConcepts] = useState<CustomRateOption[]>([]);

  // Initialize custom rate concepts when customRates load
  useEffect(() => {
    if (customRates.length > 0) {
      setCustomRateConcepts(
        customRates
          .filter((r) => r.isActive)
          .map((r) => ({
            id: r.id,
            label: r.name,
            enabled: true,
          }))
      );
    }
  }, [customRates]);

  // Fetch custom rates for filtered entries
  const [entryCustomRates, setEntryCustomRates] = useState<Map<string, { custom_rate_id: string; quantity: number; rate_snapshot: number }[]>>(new Map());

  const filteredEntries = useMemo(() => {
    if (!dateFrom || !dateTo) return [];
    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, {
        start: startOfDay(dateFrom),
        end: endOfDay(dateTo),
      });
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, dateFrom, dateTo]);

  // Fetch custom rates for filtered entries
  useEffect(() => {
    const fetchEntryCustomRates = async () => {
      if (!user || filteredEntries.length === 0) {
        setEntryCustomRates(new Map());
        return;
      }

      const entryIds = filteredEntries.map((e) => e.id);
      const { data, error } = await supabase
        .from('work_entry_custom_rates')
        .select('work_entry_id, custom_rate_id, quantity, rate_snapshot')
        .in('work_entry_id', entryIds);

      if (error) {
        console.error('Error fetching entry custom rates:', error);
        return;
      }

      const map = new Map<string, { custom_rate_id: string; quantity: number; rate_snapshot: number }[]>();
      (data || []).forEach((item) => {
        const existing = map.get(item.work_entry_id) || [];
        existing.push({
          custom_rate_id: item.custom_rate_id,
          quantity: Number(item.quantity),
          rate_snapshot: Number(item.rate_snapshot),
        });
        map.set(item.work_entry_id, existing);
      });

      setEntryCustomRates(map);
    };

    fetchEntryCustomRates();
  }, [user, filteredEntries]);

  const toggleConcept = (id: string) => {
    setConcepts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const toggleCustomRateConcept = (id: string) => {
    setCustomRateConcepts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // Helper to get custom rate value for an entry
  const getEntryCustomRateValue = (entryId: string, customRateId: string): number => {
    const rates = entryCustomRates.get(entryId) || [];
    const rate = rates.find((r) => r.custom_rate_id === customRateId);
    return rate ? rate.quantity * rate.rate_snapshot : 0;
  };

  // Helper to get custom rate quantity for an entry
  const getEntryCustomRateQuantity = (entryId: string, customRateId: string): number => {
    const rates = entryCustomRates.get(entryId) || [];
    const rate = rates.find((r) => r.custom_rate_id === customRateId);
    return rate?.quantity || 0;
  };

  // Get total custom rates value for an entry
  const getEntryTotalCustomRatesValue = (entryId: string): number => {
    const rates = entryCustomRates.get(entryId) || [];
    const enabledIds = customRateConcepts.filter((c) => c.enabled).map((c) => c.id);
    return rates
      .filter((r) => enabledIds.includes(r.custom_rate_id))
      .reduce((sum, r) => sum + r.quantity * r.rate_snapshot, 0);
  };

  // Calculate day value only for enabled concepts
  const calculateFilteredDayValue = (entry: WorkEntry, enabledIds: Set<string>): number => {
    const isInternational = entry.scope === 'international';
    const date = parseISO(entry.date);
    const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
    const weekendMultiplier = isWeekendDay ? settings.weekendMultiplier : 1;

    let total = 0;

    if (enabledIds.has('fullDiets')) {
      total += entry.fullDietsNational * settings.fullDietNational * weekendMultiplier;
      total += entry.fullDietsInternational * settings.fullDietInternational * weekendMultiplier;
    }
    if (enabledIds.has('halfDiets')) {
      total += entry.halfDietsNational * settings.halfDietNational * weekendMultiplier;
      total += entry.halfDietsInternational * settings.halfDietInternational * weekendMultiplier;
    }
    if (enabledIds.has('overnights')) {
      const overnightRate = isInternational ? settings.overnightInternational : settings.overnightNational;
      total += entry.overnights * overnightRate;
    }
    if (enabledIds.has('nightHours')) {
      total += entry.nightHours * settings.nightHourRate;
    }
    if (enabledIds.has('halfNightHours')) {
      total += entry.halfNightHours * settings.halfNightHourRate;
    }
    if (enabledIds.has('extraHours')) {
      total += entry.extraHours * settings.extraHourRate;
    }
    if (enabledIds.has('kilometers')) {
      total += entry.kilometers * settings.kilometerRate;
    }
    if (enabledIds.has('tips')) {
      total += entry.tips;
    }

    return total;
  };

  const generatePDF = () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: '❌ Error',
        description: 'Selecciona las fechas de inicio y fin',
        variant: 'destructive',
      });
      return;
    }

    if (filteredEntries.length === 0) {
      toast({
        title: '⚠️ Sin datos',
        description: 'No hay entradas en el rango de fechas seleccionado',
        variant: 'destructive',
      });
      return;
    }

    const enabledConcepts = concepts.filter((c) => c.enabled);
    const enabledIds = new Set(enabledConcepts.map((c) => c.id));
    const enabledCustomRates = customRateConcepts.filter((c) => c.enabled);

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Informe de Trabajo', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Período: ${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`,
      105,
      30,
      { align: 'center' }
    );

    // Calculate totals first for the summary
    let totalHours = 0;
    let totalFullDietsNational = 0;
    let totalFullDietsInternational = 0;
    let totalHalfDietsNational = 0;
    let totalHalfDietsInternational = 0;
    let totalOvernightsNational = 0;
    let totalOvernightsInternational = 0;
    let totalNightHours = 0;
    let totalHalfNightHours = 0;
    let totalExtraHours = 0;
    let totalKilometers = 0;
    let totalTips = 0;
    let grandTotal = 0;
    const customRateTotals: Map<string, { qty: number; value: number; name: string }> = new Map();
    enabledCustomRates.forEach((cr) => customRateTotals.set(cr.id, { qty: 0, value: 0, name: cr.label }));

    filteredEntries.forEach((entry) => {
      totalHours += calculateWorkHours(entry.startTime, entry.endTime, entry.breakMinutes);
      
      totalFullDietsNational += entry.fullDietsNational;
      totalHalfDietsNational += entry.halfDietsNational;
      totalFullDietsInternational += entry.fullDietsInternational;
      totalHalfDietsInternational += entry.halfDietsInternational;
      
      const isInternational = entry.scope === 'international';
      if (isInternational) {
        totalOvernightsInternational += entry.overnights;
      } else {
        totalOvernightsNational += entry.overnights;
      }
      
      totalNightHours += entry.nightHours;
      totalHalfNightHours += entry.halfNightHours;
      totalExtraHours += entry.extraHours;
      totalKilometers += entry.kilometers;
      totalTips += entry.tips;
      grandTotal += calculateFilteredDayValue(entry, enabledIds);
      grandTotal += getEntryTotalCustomRatesValue(entry.id);
      
      // Accumulate custom rate quantities and values
      enabledCustomRates.forEach((cr) => {
        const qty = getEntryCustomRateQuantity(entry.id, cr.id);
        const value = getEntryCustomRateValue(entry.id, cr.id);
        const current = customRateTotals.get(cr.id)!;
        customRateTotals.set(cr.id, { 
          qty: current.qty + qty, 
          value: current.value + value,
          name: cr.label 
        });
      });
    });

    // Build table headers
    const headers = ['Fecha'];
    if (enabledConcepts.find((c) => c.id === 'startTime')) headers.push('Inicio');
    if (enabledConcepts.find((c) => c.id === 'endTime')) headers.push('Fin');
    if (enabledConcepts.find((c) => c.id === 'workHours')) headers.push('Horas');
    if (enabledConcepts.find((c) => c.id === 'fullDiets')) headers.push('D.Comp.');
    if (enabledConcepts.find((c) => c.id === 'halfDiets')) headers.push('½ Diet.');
    if (enabledConcepts.find((c) => c.id === 'overnights')) headers.push('Pern.');
    if (enabledConcepts.find((c) => c.id === 'nightHours')) headers.push('Noct.');
    if (enabledConcepts.find((c) => c.id === 'halfNightHours')) headers.push('½ Noct.');
    if (enabledConcepts.find((c) => c.id === 'extraHours')) headers.push('H.Extra');
    if (enabledConcepts.find((c) => c.id === 'kilometers')) headers.push('Km');
    if (enabledConcepts.find((c) => c.id === 'tips')) headers.push('Prop.');
    // Add custom rate headers
    enabledCustomRates.forEach((cr) => {
      const shortName = cr.label.length > 10 ? cr.label.substring(0, 10) : cr.label;
      headers.push(shortName);
    });
    headers.push('Total');

    // Day of week abbreviations
    const dayAbbr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Special day label helper
    const getSpecialDayLabel = (serviceType: string): string | null => {
      switch (serviceType) {
        case 'rest':      return 'FESTIVO';
        case 'sick':      return 'BAJA';
        case 'vacation':  return 'VACACIONES';
        default:          return null;
      }
    };

    // Track which row indices are 'extra' or special for coloring
    const extraRowIndices = new Set<number>();
    const specialRowIndices = new Set<number>();

    // Build table data
    const tableData = filteredEntries.map((entry, rowIndex) => {
      const entryDate = parseISO(entry.date);
      const dayName = dayAbbr[entryDate.getDay()];
      const row: (string | number)[] = [`${dayName} ${format(entryDate, 'dd/MM')}`];

      const specialLabel = getSpecialDayLabel(entry.serviceType);

      if (specialLabel) {
        // Special day: fill all columns with the label (merged visually)
        specialRowIndices.add(rowIndex);
        const colCount = headers.length - 1; // all except Fecha
        for (let i = 0; i < colCount; i++) {
          row.push(i === 0 ? specialLabel : '');
        }
        return row;
      }

      if (entry.serviceType === 'extra') {
        extraRowIndices.add(rowIndex);
      }

      const hours = calculateWorkHours(entry.startTime, entry.endTime, entry.breakMinutes);
      const dayValue = calculateFilteredDayValue(entry, enabledIds);
      const customRatesValue = getEntryTotalCustomRatesValue(entry.id);
      const totalValue = dayValue + customRatesValue;

      if (enabledConcepts.find((c) => c.id === 'startTime')) row.push(entry.startTime.slice(0, 5));
      if (enabledConcepts.find((c) => c.id === 'endTime')) row.push(entry.endTime.slice(0, 5));
      if (enabledConcepts.find((c) => c.id === 'workHours')) row.push(`${hours.toFixed(1)}`);
      if (enabledConcepts.find((c) => c.id === 'fullDiets')) {
        const totalDiets = entry.fullDietsNational + entry.fullDietsInternational;
        row.push(totalDiets || '-');
      }
      if (enabledConcepts.find((c) => c.id === 'halfDiets')) {
        const totalHalfDiets = entry.halfDietsNational + entry.halfDietsInternational;
        row.push(totalHalfDiets || '-');
      }
      if (enabledConcepts.find((c) => c.id === 'overnights')) row.push(entry.overnights || '-');
      if (enabledConcepts.find((c) => c.id === 'nightHours')) row.push(entry.nightHours ? `${entry.nightHours}` : '-');
      if (enabledConcepts.find((c) => c.id === 'halfNightHours')) row.push(entry.halfNightHours ? `${entry.halfNightHours}` : '-');
      if (enabledConcepts.find((c) => c.id === 'extraHours')) row.push(entry.extraHours ? `${entry.extraHours}` : '-');
      if (enabledConcepts.find((c) => c.id === 'kilometers')) row.push(entry.kilometers || '-');
      if (enabledConcepts.find((c) => c.id === 'tips')) row.push(entry.tips ? formatCurrency(entry.tips) : '-');
      enabledCustomRates.forEach((cr) => {
        const qty = getEntryCustomRateQuantity(entry.id, cr.id);
        row.push(qty > 0 ? qty : '-');
      });
      row.push(formatCurrency(totalValue));

      return row;
    });

    // Generate main table
    autoTable(doc, {
      startY: 40,
      head: [headers],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [230, 236, 245],
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 22 },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const rowIdx = data.row.index;

        // Special days: grey background + italic text
        if (specialRowIndices.has(rowIdx)) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.textColor = [100, 100, 100];
          data.cell.styles.fontStyle = 'italic';
          data.cell.styles.halign = data.column.index === 1 ? 'left' : 'center';
        }

        // Extra days: orange background + bold
        if (extraRowIndices.has(rowIdx)) {
          data.cell.styles.fillColor = [255, 237, 213]; // orange-100
          data.cell.styles.textColor = [154, 52, 18];   // orange-800
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Get final Y position after main table
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Summary section - Categories breakdown
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Resumen por Categorías', 14, finalY);

    const summaryData: (string | number)[][] = [];
    
    // Standard concepts
    if (enabledConcepts.find((c) => c.id === 'workHours')) {
      summaryData.push(['Horas trabajadas', `${totalHours.toFixed(1)} h`, '-']);
    }
    // Full diets - separate national and international
    if (enabledConcepts.find((c) => c.id === 'fullDiets')) {
      if (totalFullDietsNational > 0) {
        const dietValue = totalFullDietsNational * settings.fullDietNational;
        summaryData.push(['Dietas completas (NAC)', `${totalFullDietsNational} uds`, formatCurrency(dietValue)]);
      }
      if (totalFullDietsInternational > 0) {
        const dietValue = totalFullDietsInternational * settings.fullDietInternational;
        summaryData.push(['Dietas completas (INT)', `${totalFullDietsInternational} uds`, formatCurrency(dietValue)]);
      }
    }
    // Half diets - separate national and international
    if (enabledConcepts.find((c) => c.id === 'halfDiets')) {
      if (totalHalfDietsNational > 0) {
        const halfDietValue = totalHalfDietsNational * settings.halfDietNational;
        summaryData.push(['Medias dietas (NAC)', `${totalHalfDietsNational} uds`, formatCurrency(halfDietValue)]);
      }
      if (totalHalfDietsInternational > 0) {
        const halfDietValue = totalHalfDietsInternational * settings.halfDietInternational;
        summaryData.push(['Medias dietas (INT)', `${totalHalfDietsInternational} uds`, formatCurrency(halfDietValue)]);
      }
    }
    // Overnights - separate national and international
    if (enabledConcepts.find((c) => c.id === 'overnights')) {
      if (totalOvernightsNational > 0) {
        const overnightValue = totalOvernightsNational * settings.overnightNational;
        summaryData.push(['Pernoctas (NAC)', `${totalOvernightsNational} uds`, formatCurrency(overnightValue)]);
      }
      if (totalOvernightsInternational > 0) {
        const overnightValue = totalOvernightsInternational * settings.overnightInternational;
        summaryData.push(['Pernoctas (INT)', `${totalOvernightsInternational} uds`, formatCurrency(overnightValue)]);
      }
    }
    if (enabledConcepts.find((c) => c.id === 'nightHours') && totalNightHours > 0) {
      const nightValue = totalNightHours * settings.nightHourRate;
      summaryData.push(['Nocturnidades', `${totalNightHours} h`, formatCurrency(nightValue)]);
    }
    if (enabledConcepts.find((c) => c.id === 'halfNightHours') && totalHalfNightHours > 0) {
      const halfNightValue = totalHalfNightHours * settings.halfNightHourRate;
      summaryData.push(['Medias nocturnidades', `${totalHalfNightHours} h`, formatCurrency(halfNightValue)]);
    }
    if (enabledConcepts.find((c) => c.id === 'extraHours') && totalExtraHours > 0) {
      const extraValue = totalExtraHours * settings.extraHourRate;
      summaryData.push(['Horas extra', `${totalExtraHours} h`, formatCurrency(extraValue)]);
    }
    if (enabledConcepts.find((c) => c.id === 'kilometers') && totalKilometers > 0) {
      const kmValue = totalKilometers * settings.kilometerRate;
      summaryData.push(['Kilómetros', `${totalKilometers} km`, formatCurrency(kmValue)]);
    }
    if (enabledConcepts.find((c) => c.id === 'tips') && totalTips > 0) {
      summaryData.push(['Propinas', '-', formatCurrency(totalTips)]);
    }

    // Custom rates summary
    customRateTotals.forEach((data) => {
      if (data.qty > 0) {
        summaryData.push([data.name, `${data.qty} uds`, formatCurrency(data.value)]);
      }
    });

    // Total row
    summaryData.push(['TOTAL PERÍODO', `${filteredEntries.length} días`, formatCurrency(grandTotal)]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Concepto', 'Cantidad', 'Importe']],
      body: summaryData,
      theme: 'plain',
      headStyles: {
        fillColor: [229, 231, 235],
        textColor: 33,
        fontStyle: 'bold',
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' },
      },
      didParseCell: (data) => {
        // Style the totals row
        if (data.row.index === summaryData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [59, 130, 246];
          data.cell.styles.textColor = [255, 255, 255];
        }
      },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Volantia`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save
    const fileName = `informe_${format(dateFrom, 'yyyyMMdd')}_${format(dateTo, 'yyyyMMdd')}.pdf`;
    doc.save(fileName);

    toast({
      title: '✅ PDF generado',
      description: `El archivo ${fileName} se ha descargado correctamente`,
    });
  };

  return (
    <AppLayout showNavigation={false} title="Exportar PDF">
      <PageTransition>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Exportar Informe</h1>
            <p className="text-sm text-muted-foreground">Genera un PDF para tu empresa</p>
          </div>
        </div>

        {/* Date Range */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Rango de fechas
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'mt-1 w-full justify-start rounded-xl text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="pointer-events-auto p-3"
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'mt-1 w-full justify-start rounded-xl text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarUI
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="pointer-events-auto p-3"
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            {filteredEntries.length} entradas encontradas
          </p>
        </GlassCard>

        {/* Concepts Selection */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Check className="h-5 w-5 text-primary" />
            Conceptos a incluir
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {concepts.map((concept) => {
              const Icon = concept.icon;
              return (
                <div
                  key={concept.id}
                  onClick={() => toggleConcept(concept.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                    concept.enabled
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/30 opacity-60'
                  )}
                >
                  <Checkbox
                    checked={concept.enabled}
                    onCheckedChange={() => toggleConcept(concept.id)}
                  />
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{concept.label}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Custom Rates Selection */}
        {customRateConcepts.length > 0 && (
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Star className="h-5 w-5 text-primary" />
              Extras personalizados
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {customRateConcepts.map((concept) => (
                <div
                  key={concept.id}
                  onClick={() => toggleCustomRateConcept(concept.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                    concept.enabled
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/30 opacity-60'
                  )}
                >
                  <Checkbox
                    checked={concept.enabled}
                    onCheckedChange={() => toggleCustomRateConcept(concept.id)}
                  />
                  <Star className="h-4 w-4" />
                  <span className="text-sm">{concept.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Generate Button */}
        <Button
          onClick={generatePDF}
          className="w-full rounded-xl py-6 text-lg"
          disabled={filteredEntries.length === 0}
        >
          <FileDown className="mr-2 h-5 w-5" />
          Generar PDF
        </Button>
      </div>
      </PageTransition>
    </AppLayout>
  );
}
