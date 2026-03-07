import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CustomRate } from '@/types/customRate';
import { useToast } from '@/hooks/use-toast';

interface DbCustomRate {
  id: string;
  user_id: string;
  name: string;
  rate: number;
  rate_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const dbToCustomRate = (db: DbCustomRate): CustomRate => ({
  id: db.id,
  userId: db.user_id,
  name: db.name,
  rate: Number(db.rate),
  rateType: db.rate_type as 'fixed' | 'quantity',
  isActive: db.is_active,
  displayOrder: db.display_order,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export function useCustomRates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customRates, setCustomRates] = useState<CustomRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomRates = useCallback(async () => {
    if (!user) {
      setCustomRates([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCustomRates((data || []).map(dbToCustomRate));
    } catch (error) {
      console.error('Error fetching custom rates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los conceptos personalizados',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCustomRates();
  }, [fetchCustomRates]);

  const addCustomRate = async (rate: Omit<CustomRate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('custom_rates')
        .insert({
          user_id: user.id,
          name: rate.name,
          rate: rate.rate,
          rate_type: rate.rateType,
          is_active: rate.isActive,
          display_order: rate.displayOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newRate = dbToCustomRate(data);
      setCustomRates((prev) => [...prev, newRate]);
      toast({
        title: 'Concepto añadido',
        description: `"${rate.name}" creado correctamente`,
      });
      return newRate;
    } catch (error) {
      console.error('Error adding custom rate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el concepto',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCustomRate = async (id: string, updates: Partial<CustomRate>) => {
    try {
      const dbUpdates: Partial<DbCustomRate> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.rate !== undefined) dbUpdates.rate = updates.rate;
      if (updates.rateType !== undefined) dbUpdates.rate_type = updates.rateType;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

      const { error } = await supabase
        .from('custom_rates')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setCustomRates((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      return true;
    } catch (error) {
      console.error('Error updating custom rate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el concepto',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteCustomRate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomRates((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: 'Concepto eliminado',
        description: 'Se ha eliminado correctamente',
      });
      return true;
    } catch (error) {
      console.error('Error deleting custom rate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el concepto',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleActive = async (id: string) => {
    const rate = customRates.find((r) => r.id === id);
    if (rate) {
      return updateCustomRate(id, { isActive: !rate.isActive });
    }
    return false;
  };

  return {
    customRates,
    activeRates: customRates.filter((r) => r.isActive),
    isLoading,
    addCustomRate,
    updateCustomRate,
    deleteCustomRate,
    toggleActive,
    refetch: fetchCustomRates,
  };
}
