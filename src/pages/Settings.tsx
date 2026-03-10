import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Wallet,
  Calculator,
  Eye,
  Building2,
  ScanLine,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
import { Theme, UserSettings } from '@/types';
import { cn } from '@/lib/utils';
import { PayrollScanner } from '@/components/payroll/PayrollScanner';
import { CustomRatesSection } from '@/components/settings/CustomRatesSection';
import { TemplatesSection } from '@/components/settings/TemplatesSection';
import { useOnboarding } from '@/hooks/useOnboarding';

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { settings, updateSettings, isLoading } = useUserSettings();
  const { resetOnboarding } = useOnboarding();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Sync localSettings when settings are loaded from the database
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setLocalSettings(settings);
      setIsInitialized(true);
    }
  }, [settings, isLoading, isInitialized]);

  const handleChange = (field: keyof UserSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Allow empty string while typing, convert to number on blur
  const numChange = (field: keyof UserSettings) => ({
    value: (localSettings[field] as any) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      handleChange(field, v === '' ? '' : v);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const v = e.target.value;
      handleChange(field, v === '' ? 0 : parseFloat(v) || 0);
    },
  });

  const handlePayrollDataExtracted = (data: Partial<UserSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...data }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: '✅ Ajustes guardados',
        description: 'Tu configuración se ha actualizado correctamente.',
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudieron guardar los ajustes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout showNavigation={false} title="Ajustes">
      <PageTransition>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Ajustes</h1>
            <p className="text-sm text-muted-foreground">Configura tu aplicación</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        {/* Salary */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Wallet className="h-5 w-5 text-primary" />
            Nómina Base
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseSalary">Salario Base (€)</Label>
              <Input
                id="baseSalary"
                type="number"
                min="0"
                step="10"
                {...numChange('baseSalary')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="fixedBonuses">Pluses Fijos (€)</Label>
              <Input
                id="fixedBonuses"
                type="number"
                min="0"
                step="10"
                {...numChange('fixedBonuses')}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        </GlassCard>

        {/* Deductions */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Calculator className="h-5 w-5 text-primary" />
            Deducciones (%)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="irpf">IRPF</Label>
              <Input
                id="irpf"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...numChange('irpf')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="socialSecurity">Contingencias Comunes</Label>
              <Input
                id="socialSecurity"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...numChange('socialSecurity')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="mei">MEI</Label>
              <Input
                id="mei"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...numChange('mei')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="unemployment">Desempleo</Label>
              <Input
                id="unemployment"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...numChange('unemployment')}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        </GlassCard>

        {/* National Rates */}
        <GlassCard>
          <h3 className="mb-4 font-semibold">Tarifas Nacionales (€)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Dieta completa</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('fullDietNational')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs">Media dieta</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('halfDietNational')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs">Pernocta</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('overnightNational')}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        </GlassCard>

        {/* International Rates */}
        <GlassCard>
          <h3 className="mb-4 font-semibold">Tarifas Internacionales (€)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Dieta completa</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('fullDietInternational')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs">Media dieta</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('halfDietInternational')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs">Pernocta</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('overnightInternational')}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        </GlassCard>

        {/* Other Rates */}
        <GlassCard>
          <h3 className="mb-4 font-semibold">Otras Tarifas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hora extra (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('extraHourRate')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Hora nocturna (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('nightHourRate')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Media nocturnidad (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...numChange('halfNightHourRate')}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Kilómetro (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...numChange('kilometerRate')}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label>Multiplicador fin de semana</Label>
            <Input
              type="number"
              min="1"
              max="3"
              step="0.05"
              value={localSettings.weekendMultiplier}
              onChange={(e) => handleChange('weekendMultiplier', parseFloat(e.target.value) || 1)}
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Ej: 1.25 = +25% los fines de semana
            </p>
          </div>
        </GlassCard>

        {/* Route Templates */}
        <TemplatesSection />

        {/* Custom Rates */}
        <CustomRatesSection />

        {/* Visibility Toggles */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Eye className="h-5 w-5 text-primary" />
            Mostrar conceptos
          </h3>
          <div className="space-y-4">
            {[
              { key: 'showDiets', label: 'Dietas' },
              { key: 'showOvernights', label: 'Pernoctas' },
              { key: 'showNightHours', label: 'Horas nocturnas' },
              { key: 'showExtraHours', label: 'Horas extra' },
              { key: 'showKilometers', label: 'Kilómetros' },
              { key: 'showTips', label: 'Propinas' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={localSettings[key as keyof UserSettings] as boolean}
                  onCheckedChange={(checked) => handleChange(key as keyof UserSettings, checked)}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Company Info */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Datos de empresa
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nombre de la empresa</Label>
              <Input
                id="companyName"
                value={localSettings.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Transportes ABC S.L."
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="companyCIF">CIF</Label>
              <Input
                id="companyCIF"
                value={localSettings.companyCIF || ''}
                onChange={(e) => handleChange('companyCIF', e.target.value)}
                placeholder="B12345678"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setScannerOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" />
            Escanear nómina con IA
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Extrae automáticamente los datos de tu nómina
          </p>
        </GlassCard>

        {/* Help Section */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <HelpCircle className="h-5 w-5 text-primary" />
            Ayuda
          </h3>
          <Button 
            variant="outline" 
            className="w-full rounded-xl" 
            onClick={() => {
              resetOnboarding();
              navigate('/');
            }}
          >
            Ver tutorial de bienvenida
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Revisa las funcionalidades principales de la app
          </p>
        </GlassCard>

        {/* Legal Info */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Legal
          </h3>
          <Button 
            variant="outline" 
            className="w-full rounded-xl" 
            onClick={() => navigate('/privacy')}
          >
            Política de Privacidad
          </Button>
        </GlassCard>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl py-6 text-lg">
          <Save className="mr-2 h-5 w-5" />
          {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
        </Button>
      </div>
      </PageTransition>

      {/* Payroll Scanner Modal */}
      <PayrollScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDataExtracted={handlePayrollDataExtracted}
      />
    </AppLayout>
  );
}
