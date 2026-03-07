import { useState } from 'react';
import { Bookmark, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouteTemplates } from '@/hooks/useRouteTemplates';
import { useToast } from '@/hooks/use-toast';
import { RouteTemplate } from '@/types/routeTemplate';
import { WorkEntry } from '@/types';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  formData: Partial<WorkEntry>;
  onApplyTemplate: (template: RouteTemplate) => void;
}

export function TemplateSelector({ formData, onApplyTemplate }: TemplateSelectorProps) {
  const { templates, addTemplate, deleteTemplate } = useRouteTemplates();
  const { toast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: '⚠️ Nombre requerido',
        description: 'Introduce un nombre para la plantilla',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await addTemplate({
        name: templateName.trim(),
        start_time: formData.startTime || '06:00',
        end_time: formData.endTime || '14:00',
        break_minutes: formData.breakMinutes || 30,
        service_type: formData.serviceType || 'regular',
        scope: formData.scope || 'national',
        full_diets_national: formData.fullDietsNational || 0,
        half_diets_national: formData.halfDietsNational || 0,
        full_diets_international: formData.fullDietsInternational || 0,
        half_diets_international: formData.halfDietsInternational || 0,
        overnights: formData.overnights || 0,
        night_hours: formData.nightHours || 0,
        half_night_hours: formData.halfNightHours || 0,
        extra_hours: formData.extraHours || 0,
        kilometers: formData.kilometers || 0,
      });

      toast({
        title: '✅ Plantilla guardada',
        description: `"${templateName}" creada correctamente`,
      });

      setTemplateName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo guardar la plantilla',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = (template: RouteTemplate) => {
    onApplyTemplate(template);
    toast({
      title: '📋 Plantilla aplicada',
      description: `"${template.name}" cargada en el formulario`,
    });
  };

  const handleDelete = async (e: React.MouseEvent, template: RouteTemplate) => {
    e.stopPropagation();
    try {
      await deleteTemplate(template.id);
      toast({
        title: '🗑️ Plantilla eliminada',
        description: `"${template.name}" eliminada`,
      });
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    const formatTime = (t: string) => t.split(':').slice(0, 2).join(':');
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Bookmark className="h-4 w-4" />
            Plantillas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-popover border border-border shadow-lg z-50"
        >
          {templates.length > 0 ? (
            <>
              {templates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => handleApply(template)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeRange(template.start_time, template.end_time)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => handleDelete(e, template)}
                  >
                    ×
                  </Button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No hay plantillas guardadas
            </div>
          )}
          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Guardar actual como plantilla
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nombre de la plantilla</Label>
              <Input
                id="template-name"
                placeholder="Ej: Turno mañana, Ruta nacional..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <p className="font-medium text-muted-foreground">Se guardará:</p>
              <p>🕐 Horario: {formData.startTime} - {formData.endTime}</p>
              <p>⏸️ Pausa: {formData.breakMinutes} min</p>
              {((formData.fullDietsNational || 0) + (formData.fullDietsInternational || 0)) > 0 && (
                <p>🍽️ Dietas completas: {(formData.fullDietsNational || 0) + (formData.fullDietsInternational || 0)}</p>
              )}
              {((formData.halfDietsNational || 0) + (formData.halfDietsInternational || 0)) > 0 && (
                <p>🥪 Medias dietas: {(formData.halfDietsNational || 0) + (formData.halfDietsInternational || 0)}</p>
              )}
              {(formData.kilometers || 0) > 0 && <p>🛣️ Kilómetros: {formData.kilometers}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
