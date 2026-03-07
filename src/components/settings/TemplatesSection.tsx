import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Clock, MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouteTemplates } from '@/hooks/useRouteTemplates';
import { RouteTemplate } from '@/types/routeTemplate';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TemplatesSection() {
  const { templates, isLoading, addTemplate, updateTemplate, deleteTemplate } = useRouteTemplates();
  
  const [editingTemplate, setEditingTemplate] = useState<RouteTemplate | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state for editing/adding
  const [formData, setFormData] = useState({
    name: '',
    start_time: '06:00',
    end_time: '14:00',
    break_minutes: 30,
    service_type: 'regular',
    scope: 'national',
    full_diets_national: 0,
    half_diets_national: 0,
    full_diets_international: 0,
    half_diets_international: 0,
    overnights: 0,
    night_hours: 0,
    half_night_hours: 0,
    extra_hours: 0,
    kilometers: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '06:00',
      end_time: '14:00',
      break_minutes: 30,
      service_type: 'regular',
      scope: 'national',
      full_diets_national: 0,
      half_diets_national: 0,
      full_diets_international: 0,
      half_diets_international: 0,
      overnights: 0,
      night_hours: 0,
      half_night_hours: 0,
      extra_hours: 0,
      kilometers: 0,
    });
  };

  const openEditDialog = (template: RouteTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      start_time: template.start_time.slice(0, 5),
      end_time: template.end_time.slice(0, 5),
      break_minutes: template.break_minutes,
      service_type: template.service_type,
      scope: template.scope,
      full_diets_national: template.full_diets_national,
      half_diets_national: template.half_diets_national,
      full_diets_international: template.full_diets_international,
      half_diets_international: template.half_diets_international,
      overnights: template.overnights,
      night_hours: template.night_hours,
      half_night_hours: template.half_night_hours,
      extra_hours: template.extra_hours,
      kilometers: template.kilometers,
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await addTemplate(formData);
      }
      setEditingTemplate(null);
      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const formatTime = (t: string) => t.split(':').slice(0, 2).join(':');
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Plantillas de Ruta
            </h3>
            <p className="text-sm text-muted-foreground">
              Rutas predefinidas para entrada rápida
            </p>
          </div>
          <Button size="sm" onClick={openAddDialog} className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" />
            Añadir
          </Button>
        </div>

        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tienes plantillas guardadas.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Crea una desde el formulario de nuevo servicio.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{template.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(template.start_time, template.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {template.scope === 'national' ? 'NAC' : 'INT'}
                    </span>
                    {(template.full_diets_national + template.full_diets_international) > 0 && <span>🍽️ {template.full_diets_national + template.full_diets_international}</span>}
                    {(template.half_diets_national + template.half_diets_international) > 0 && <span>🥪 {template.half_diets_national + template.half_diets_international}</span>}
                    {template.kilometers > 0 && <span>🛣️ {template.kilometers}km</span>}
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditDialog(template)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(template.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Edit/Add Dialog */}
      <Dialog open={!!editingTemplate || isAdding} onOpenChange={(open) => {
        if (!open) {
          setEditingTemplate(null);
          setIsAdding(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <Label htmlFor="template-name">Nombre</Label>
              <Input
                id="template-name"
                placeholder="Ej: Turno mañana"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Hora inicio</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Hora fin</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Break */}
            <div>
              <Label className="text-xs">Pausa (min)</Label>
              <Input
                type="number"
                min="0"
                step="5"
                value={formData.break_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, break_minutes: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>

            {/* Service type & Scope */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo servicio</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="discrecional">Discrecional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ámbito</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">Nacional</SelectItem>
                    <SelectItem value="international">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Diets - National */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dietas NAC</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.full_diets_national}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_diets_national: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Medias NAC</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.half_diets_national}
                  onChange={(e) => setFormData(prev => ({ ...prev, half_diets_national: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Diets - International */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dietas INT</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.full_diets_international}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_diets_international: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Medias INT</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.half_diets_international}
                  onChange={(e) => setFormData(prev => ({ ...prev, half_diets_international: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Night hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Horas nocturnas</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.night_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, night_hours: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Media nocturnidad</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.half_night_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, half_night_hours: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Extra hours, overnights, km */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Horas extra</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.extra_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, extra_hours: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Pernoctas</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.overnights}
                  onChange={(e) => setFormData(prev => ({ ...prev, overnights: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Kilómetros</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.kilometers}
                  onChange={(e) => setFormData(prev => ({ ...prev, kilometers: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTemplate(null);
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              <Check className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
