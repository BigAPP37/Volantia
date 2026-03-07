import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Save,
  Wand2,
  Clock,
  Utensils,
  Moon,
  Route,
  Coins,
  Sun,
  Plane,
  MapPin,
  CalendarDays,
  Trash2,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkEntries } from '@/hooks/useWorkEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useCustomRates } from '@/hooks/useCustomRates';
import { useWorkEntryExpenses } from '@/hooks/useWorkEntryExpenses';
import { useToast } from '@/hooks/use-toast';
import { WorkEntry, ServiceType, ServiceScope } from '@/types';
import { ExpenseType } from '@/types/expense';
import { supabase } from '@/integrations/supabase/client';
import { autoCalculateEntry, formatCurrency, calculateWorkHours } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { ExpenseInput } from '@/components/expenses/ExpenseInput';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { RouteTemplate } from '@/types/routeTemplate';

const serviceTypes: { value: ServiceType; label: string; icon: React.ElementType }[] = [
  { value: 'regular', label: 'Regular', icon: Clock },
  { value: 'extra', label: 'Extra', icon: Sun },
  { value: 'rest', label: 'Descanso', icon: Moon },
];

const getCurrentTime = () => format(new Date(), 'HH:mm');

const getDefaultFormData = (dateStr: string): Partial<WorkEntry> => ({
  date: dateStr,
  startTime: getCurrentTime(),
  endTime: getCurrentTime(),
  breakMinutes: 30,
  serviceType: 'regular',
  scope: 'national',
  fullDietsNational: 0,
  halfDietsNational: 0,
  fullDietsInternational: 0,
  halfDietsInternational: 0,
  overnights: 0,
  nightHours: 0,
  halfNightHours: 0,
  extraHours: 0,
  kilometers: 0,
  tips: 0,
  notes: '',
});

export default function NewEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const dateParam = searchParams.get('date');
  const initialDate = dateParam || format(new Date(), 'yyyy-MM-dd');
  const editId = searchParams.get('id');

  const { entries, addEntry, updateEntry, deleteEntry } = useWorkEntries();
  const { settings } = useUserSettings();
  const { activeRates } = useCustomRates();
  const { addMultipleExpenses } = useWorkEntryExpenses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<Partial<WorkEntry>>(() => getDefaultFormData(initialDate));
  const [customRateQuantities, setCustomRateQuantities] = useState<Record<string, number>>({});
  
  // Local expenses state (before saving to DB)
  interface LocalExpense {
    id: string;
    expense_type: ExpenseType;
    amount: number;
    description?: string;
    ticket_image_url?: string;
    is_company_paid: boolean;
  }
  const [localExpenses, setLocalExpenses] = useState<LocalExpense[]>([]);

  // When arriving with a different ?date= (and not editing), reset the form to that date
  useEffect(() => {
    if (editId) return;
    setFormData(getDefaultFormData(initialDate));
    setCustomRateQuantities({});
    setLocalExpenses([]);
  }, [editId, initialDate]);

  // Load existing entry data when editing
  useEffect(() => {
    if (editId && entries.length > 0) {
      const existingEntry = entries.find(e => e.id === editId);
      if (existingEntry) {
        setFormData({
          date: existingEntry.date,
          startTime: existingEntry.startTime,
          endTime: existingEntry.endTime,
          breakMinutes: existingEntry.breakMinutes,
          serviceType: existingEntry.serviceType,
          scope: existingEntry.scope,
          fullDietsNational: existingEntry.fullDietsNational,
          halfDietsNational: existingEntry.halfDietsNational,
          fullDietsInternational: existingEntry.fullDietsInternational,
          halfDietsInternational: existingEntry.halfDietsInternational,
          overnights: existingEntry.overnights,
          nightHours: existingEntry.nightHours,
          halfNightHours: existingEntry.halfNightHours,
          extraHours: existingEntry.extraHours,
          kilometers: existingEntry.kilometers,
          tips: existingEntry.tips,
          notes: existingEntry.notes,
        });
        // Load custom rate quantities for this entry
        loadCustomRateQuantities(editId);
        // Load expenses for this entry
        loadExpenses(editId);
      }
    }
  }, [editId, entries]);

  const loadExpenses = async (entryId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_entry_expenses')
        .select('*')
        .eq('work_entry_id', entryId);
      
      if (error) throw error;
      
      setLocalExpenses(data?.map(e => ({
        id: e.id,
        expense_type: e.expense_type as ExpenseType,
        amount: Number(e.amount),
        description: e.description || undefined,
        ticket_image_url: e.ticket_image_url || undefined,
        is_company_paid: e.is_company_paid || false,
      })) || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadCustomRateQuantities = async (entryId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_entry_custom_rates')
        .select('custom_rate_id, quantity')
        .eq('work_entry_id', entryId);
      
      if (error) throw error;
      
      const quantities: Record<string, number> = {};
      data?.forEach(item => {
        quantities[item.custom_rate_id] = Number(item.quantity);
      });
      setCustomRateQuantities(quantities);
    } catch (error) {
      console.error('Error loading custom rate quantities:', error);
    }
  };

  // Calculate if it's a weekend
  const selectedDate = formData.date ? parseISO(formData.date) : new Date();
  const isWeekendDay = isWeekend(selectedDate);
  const isInternational = formData.scope === 'international';

  // Get rates
  const overnightRate = isInternational ? settings.overnightInternational : settings.overnightNational;

  // Calculate estimated value
  const weekendMultiplier = isWeekendDay ? settings.weekendMultiplier : 1;
  // Only count user expenses (not company-paid) for the net calculation
  const userExpenses = localExpenses.filter(e => !e.is_company_paid);
  const totalExpenses = userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  // Calculate diets combining national and international
  const dietsNationalValue = ((formData.fullDietsNational || 0) * settings.fullDietNational + (formData.halfDietsNational || 0) * settings.halfDietNational) * weekendMultiplier;
  const dietsInternationalValue = ((formData.fullDietsInternational || 0) * settings.fullDietInternational + (formData.halfDietsInternational || 0) * settings.halfDietInternational) * weekendMultiplier;
  
  const breakdown = {
    diets: dietsNationalValue + dietsInternationalValue,
    overnights: (formData.overnights || 0) * overnightRate,
    nightHours: (formData.nightHours || 0) * settings.nightHourRate + (formData.halfNightHours || 0) * settings.halfNightHourRate,
    extraHours: (formData.extraHours || 0) * settings.extraHourRate,
    kilometers: (formData.kilometers || 0) * settings.kilometerRate,
    tips: formData.tips || 0,
    customRates: activeRates.reduce((sum, rate) => {
      const qty = customRateQuantities[rate.id] || 0;
      return sum + (qty * rate.rate);
    }, 0),
    expenses: -totalExpenses,
  };
  const estimatedValue = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const handleChange = (field: keyof WorkEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomRateChange = (rateId: string, value: number) => {
    setCustomRateQuantities(prev => ({ ...prev, [rateId]: value }));
  };

  const handleAutoCalculate = () => {
    const updated = autoCalculateEntry(formData, settings);
    setFormData(updated);
    toast({
      title: '✨ Calculado automáticamente',
      description: 'Se han estimado dietas y horas extra según la duración.',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const entryData = {
        date: formData.date!,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        breakMinutes: formData.breakMinutes!,
        serviceType: formData.serviceType!,
        scope: formData.scope!,
        fullDietsNational: formData.fullDietsNational!,
        halfDietsNational: formData.halfDietsNational!,
        fullDietsInternational: formData.fullDietsInternational!,
        halfDietsInternational: formData.halfDietsInternational!,
        overnights: formData.overnights!,
        nightHours: formData.nightHours!,
        halfNightHours: formData.halfNightHours!,
        extraHours: formData.extraHours!,
        kilometers: formData.kilometers!,
        tips: formData.tips!,
        notes: formData.notes,
      };

      let entryId: string;

      if (isEditMode && editId) {
        await updateEntry(editId, entryData);
        entryId = editId;
        
        // Delete existing custom rate entries and re-insert
        await supabase
          .from('work_entry_custom_rates')
          .delete()
          .eq('work_entry_id', editId);
        
        // Delete existing expenses and re-insert
        await supabase
          .from('work_entry_expenses')
          .delete()
          .eq('work_entry_id', editId);
      } else {
        const newEntry = await addEntry(entryData);
        entryId = newEntry.id;
      }

      // Save custom rate quantities
      const customRateEntries = Object.entries(customRateQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([rateId, qty]) => {
          const rate = activeRates.find(r => r.id === rateId);
          return {
            work_entry_id: entryId,
            custom_rate_id: rateId,
            quantity: qty,
            rate_snapshot: rate?.rate || 0,
          };
        });

      if (customRateEntries.length > 0) {
        const { error: customRateError } = await supabase
          .from('work_entry_custom_rates')
          .insert(customRateEntries);

        if (customRateError) {
          console.error('Error saving custom rates:', customRateError);
        }
      }

      // Save expenses
      const expensesToSave = localExpenses
        .filter(e => e.amount > 0)
        .map(e => ({
          work_entry_id: entryId,
          expense_type: e.expense_type,
          amount: e.amount,
          description: e.description || null,
          ticket_image_url: e.ticket_image_url || null,
          is_company_paid: e.is_company_paid,
        }));

      if (expensesToSave.length > 0) {
        const { error: expenseError } = await supabase
          .from('work_entry_expenses')
          .insert(expensesToSave);

        if (expenseError) {
          console.error('Error saving expenses:', expenseError);
        }
      }

      toast({
        title: isEditMode ? '✅ Servicio actualizado' : '✅ Servicio guardado',
        description: `${isEditMode ? 'Actualizado' : 'Registrado'} para el ${format(parseISO(formData.date!), "d 'de' MMMM", { locale: es })}`,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo guardar el servicio',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    
    setIsSubmitting(true);
    try {
      // Delete custom rates first (cascade should handle this but just in case)
      await supabase
        .from('work_entry_custom_rates')
        .delete()
        .eq('work_entry_id', editId);
      
      await deleteEntry(editId);
      toast({
        title: '🗑️ Servicio eliminado',
        description: 'El registro ha sido eliminado correctamente',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar el servicio',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout showNavigation={false} title={isEditMode ? "Editar Servicio" : "Nuevo Servicio"}>
      <PageTransition>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
          
          {isEditMode && (
            <Button variant="ghost" size="icon" onClick={handleDelete} className="rounded-xl text-destructive hover:bg-destructive/10">
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Estimated Value Card */}
        <GlassCard className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Estimado del día
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                {formatCurrency(estimatedValue)}
              </p>
            </div>
            <div className="flex gap-2">
              <TemplateSelector
                formData={formData}
                onApplyTemplate={(template: RouteTemplate) => {
                  // Format time from HH:MM:SS to HH:MM
                  const formatTime = (t: string) => t.split(':').slice(0, 2).join(':');
                  setFormData(prev => ({
                    ...prev,
                    startTime: formatTime(template.start_time),
                    endTime: formatTime(template.end_time),
                    breakMinutes: template.break_minutes,
                    serviceType: template.service_type as ServiceType,
                    scope: template.scope as ServiceScope,
                    fullDietsNational: template.full_diets_national,
                    halfDietsNational: template.half_diets_national,
                    fullDietsInternational: template.full_diets_international,
                    halfDietsInternational: template.half_diets_international,
                    overnights: template.overnights,
                    nightHours: template.night_hours,
                    halfNightHours: template.half_night_hours,
                    extraHours: template.extra_hours,
                    kilometers: template.kilometers,
                  }));
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAutoCalculate} className="rounded-xl">
                <Wand2 className="mr-2 h-4 w-4" />
                Auto
              </Button>
            </div>
          </div>

          {(estimatedValue !== 0 || totalExpenses > 0) && (
            <div className="border-t border-border/50 pt-3 mt-3 grid grid-cols-2 gap-2 text-xs">
              {breakdown.diets > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Dietas</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.diets)}</span>
                </div>
              )}
              {breakdown.overnights > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Pernoctas</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.overnights)}</span>
                </div>
              )}
              {breakdown.nightHours > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Nocturnidad</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.nightHours)}</span>
                </div>
              )}
              {breakdown.extraHours > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>H. Extra</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.extraHours)}</span>
                </div>
              )}
              {breakdown.kilometers > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Kms</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.kilometers)}</span>
                </div>
              )}
              {breakdown.tips > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Propinas</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.tips)}</span>
                </div>
              )}
              {breakdown.customRates > 0 && (
                <div className="flex justify-between text-muted-foreground col-span-2">
                  <span>Extras</span>
                  <span className="font-medium text-foreground">{formatCurrency(breakdown.customRates)}</span>
                </div>
              )}
              {totalExpenses > 0 && (
                <div className="flex justify-between text-destructive col-span-2">
                  <span>Gastos</span>
                  <span className="font-medium">-{formatCurrency(totalExpenses)}</span>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Time */}
        <GlassCard>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
            <Clock className="h-4 w-4 text-primary" />
            Horario
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Entrada</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="h-10 rounded-lg text-center text-sm px-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Salida</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="h-10 rounded-lg text-center text-sm px-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Jornada</Label>
              <div className="h-10 flex items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                {calculateWorkHours(formData.startTime || '06:00', formData.endTime || '14:00', 0).toFixed(1)}h
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Service Type & Scope - Responsive layout */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {serviceTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange('serviceType', value)}
                className={cn(
                  'flex-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation active:scale-95 min-h-[44px]',
                  formData.serviceType === value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleChange('scope', formData.scope === 'national' ? 'international' : 'national')}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation active:scale-95 min-h-[44px]',
              formData.scope === 'international'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
            )}
          >
            {formData.scope === 'international' ? 'INT' : 'NAC'}
          </button>
        </div>

        {/* Concepts - Compact Grid */}
        <div className="grid grid-cols-2 gap-2">
          {settings.showDiets && (
            <>
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
                <span className="text-xs text-muted-foreground flex-1">Dietas NAC</span>
                <Input
                  type="number"
                  min="0"
                  value={formData.fullDietsNational || ''}
                  onChange={(e) => handleChange('fullDietsNational', e.target.value === '' ? 0 : parseInt(e.target.value))}
                  className="w-12 h-7 rounded text-center text-xs font-medium"
                />
              </div>
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-2 py-1.5 border border-primary/20">
                <span className="text-xs text-primary flex-1">Dietas INT</span>
                <Input
                  type="number"
                  min="0"
                  value={formData.fullDietsInternational || ''}
                  onChange={(e) => handleChange('fullDietsInternational', e.target.value === '' ? 0 : parseInt(e.target.value))}
                  className="w-12 h-7 rounded text-center text-xs font-medium border-primary/30"
                />
              </div>
            </>
          )}

          {settings.showOvernights && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">Pernoctas</span>
              <Input
                type="number"
                min="0"
                value={formData.overnights || ''}
                onChange={(e) => handleChange('overnights', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}

          {settings.showNightHours && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">½ Noct.</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.halfNightHours || ''}
                onChange={(e) => handleChange('halfNightHours', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}

          {settings.showNightHours && settings.nightHourRate > 0 && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">Noct.</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.nightHours || ''}
                onChange={(e) => handleChange('nightHours', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}

          {settings.showExtraHours && settings.extraHourRate > 0 && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">H. Extra</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.extraHours || ''}
                onChange={(e) => handleChange('extraHours', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}

          {settings.showKilometers && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">Kms</span>
              <Input
                type="number"
                min="0"
                value={formData.kilometers || ''}
                onChange={(e) => handleChange('kilometers', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}

          {settings.showTips && (
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground flex-1">Propinas</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.tips || ''}
                onChange={(e) => handleChange('tips', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-12 h-7 rounded text-center text-xs font-medium"
              />
            </div>
          )}
        </div>

        {/* Custom Rates Section */}
        {activeRates.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {activeRates.map((rate) => (
              <div key={rate.id} className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-2 py-1.5">
                <span className="text-xs text-primary flex-1 truncate">{rate.name}</span>
                <Input
                  type="number"
                  min="0"
                  step={rate.rateType === 'fixed' ? 1 : 0.5}
                  value={customRateQuantities[rate.id] || ''}
                  onChange={(e) => handleCustomRateChange(rate.id, e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-12 h-7 rounded text-center text-xs font-medium border-primary/30"
                />
              </div>
            ))}
          </div>
        )}

        {/* Expenses Section */}
        <GlassCard>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
            <Receipt className="h-4 w-4 text-destructive" />
            Gastos del Servicio
          </h3>
          <ExpenseInput
            expenses={localExpenses}
            onAdd={(type, data) => {
              setLocalExpenses(prev => [...prev, {
                id: crypto.randomUUID(),
                expense_type: type,
                amount: data?.amount || 0,
                description: data?.description,
                ticket_image_url: data?.ticket_image_url,
                is_company_paid: false,
              }]);
            }}
            onUpdate={(id, updates) => {
              setLocalExpenses(prev => prev.map(e => 
                e.id === id ? { ...e, ...updates } : e
              ));
            }}
            onRemove={(id) => {
              setLocalExpenses(prev => prev.filter(e => e.id !== id));
            }}
          />
        </GlassCard>

        {/* Notes */}
        <GlassCard>
          <h3 className="mb-4 font-semibold">Notas</h3>
          <Textarea
            placeholder="Añade notas sobre este servicio..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[80px] rounded-xl"
          />
        </GlassCard>

        {/* Submit Button (mobile) */}
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl py-6 text-lg">
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Servicio' : 'Guardar Servicio')}
        </Button>
      </div>
      </PageTransition>
    </AppLayout>
  );
}
