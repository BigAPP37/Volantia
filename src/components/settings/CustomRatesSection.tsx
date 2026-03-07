import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCustomRates } from '@/hooks/useCustomRates';
import { cn } from '@/lib/utils';

export function CustomRatesSection() {
  const { customRates, isLoading, addCustomRate, updateCustomRate, deleteCustomRate, toggleActive } = useCustomRates();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState({ name: '', rate: '', rateType: 'fixed' as 'fixed' | 'quantity' });
  const [editRate, setEditRate] = useState({ name: '', rate: '', rateType: 'fixed' as 'fixed' | 'quantity' });

  const handleAdd = async () => {
    if (!newRate.name.trim() || !newRate.rate) return;
    
    await addCustomRate({
      name: newRate.name.trim(),
      rate: parseFloat(newRate.rate),
      rateType: newRate.rateType,
      isActive: true,
      displayOrder: customRates.length,
    });
    
    setNewRate({ name: '', rate: '', rateType: 'fixed' });
    setIsAdding(false);
  };

  const handleEdit = async (id: string) => {
    if (!editRate.name.trim() || !editRate.rate) return;
    
    await updateCustomRate(id, {
      name: editRate.name.trim(),
      rate: parseFloat(editRate.rate),
      rateType: editRate.rateType,
    });
    
    setEditingId(null);
  };

  const startEdit = (rate: typeof customRates[0]) => {
    setEditingId(rate.id);
    setEditRate({
      name: rate.name,
      rate: rate.rate.toString(),
      rateType: rate.rateType,
    });
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
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Conceptos Personalizados</h3>
          <p className="text-sm text-muted-foreground">
            Crea extras como Plus frío, Días extra, etc.
          </p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" />
            Añadir
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Add new rate form */}
        {isAdding && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nombre</Label>
                <Input
                  placeholder="Ej: Plus frío"
                  value={newRate.name}
                  onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Tarifa (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newRate.rate}
                  onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <Label className="mb-2 block text-xs">Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={newRate.rateType === 'fixed' ? 'default' : 'outline'}
                  onClick={() => setNewRate({ ...newRate, rateType: 'fixed' })}
                  className="flex-1 rounded-lg text-xs"
                >
                  Fijo (Sí/No)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={newRate.rateType === 'quantity' ? 'default' : 'outline'}
                  onClick={() => setNewRate({ ...newRate, rateType: 'quantity' })}
                  className="flex-1 rounded-lg text-xs"
                >
                  Por cantidad
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="flex-1 rounded-lg">
                <Check className="mr-1 h-4 w-4" />
                Guardar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewRate({ name: '', rate: '', rateType: 'fixed' });
                }}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* List of custom rates */}
        {customRates.length === 0 && !isAdding ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tienes conceptos personalizados.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crea uno para añadirlo a tus servicios.
            </p>
          </div>
        ) : (
          customRates.map((rate) => (
            <div
              key={rate.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                rate.isActive
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-muted bg-muted/30 opacity-60'
              )}
            >
              {editingId === rate.id ? (
                // Edit mode
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editRate.name}
                      onChange={(e) => setEditRate({ ...editRate, name: e.target.value })}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editRate.rate}
                      onChange={(e) => setEditRate({ ...editRate, rate: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={editRate.rateType === 'fixed' ? 'default' : 'outline'}
                      onClick={() => setEditRate({ ...editRate, rateType: 'fixed' })}
                      className="h-7 flex-1 rounded-lg text-xs"
                    >
                      Fijo
                    </Button>
                    <Button
                      size="sm"
                      variant={editRate.rateType === 'quantity' ? 'default' : 'outline'}
                      onClick={() => setEditRate({ ...editRate, rateType: 'quantity' })}
                      className="h-7 flex-1 rounded-lg text-xs"
                    >
                      Cantidad
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(rate.id)} className="h-7 flex-1 rounded-lg text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-7 rounded-lg"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="flex-1">
                    <p className="font-medium">{rate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {rate.rate.toFixed(2)}€ {rate.rateType === 'quantity' ? '× cantidad' : '(fijo)'}
                    </p>
                  </div>

                  <Switch
                    checked={rate.isActive}
                    onCheckedChange={() => toggleActive(rate.id)}
                  />

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(rate)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCustomRate(rate.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
