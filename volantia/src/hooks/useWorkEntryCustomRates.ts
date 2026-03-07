import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WorkEntryCustomRate {
  work_entry_id: string;
  custom_rate_id: string;
  quantity: number;
  rate_snapshot: number;
}

// Map of work_entry_id -> array of custom rates applied
export type CustomRatesByEntry = Map<string, WorkEntryCustomRate[]>;

export function useWorkEntryCustomRates(entryIds: string[]) {
  const { user } = useAuth();
  const [customRatesByEntry, setCustomRatesByEntry] = useState<CustomRatesByEntry>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomRates = useCallback(async () => {
    if (!user || entryIds.length === 0) {
      setCustomRatesByEntry(new Map());
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_entry_custom_rates')
        .select('work_entry_id, custom_rate_id, quantity, rate_snapshot')
        .in('work_entry_id', entryIds);

      if (error) throw error;

      const map = new Map<string, WorkEntryCustomRate[]>();
      (data || []).forEach((item) => {
        const existing = map.get(item.work_entry_id) || [];
        existing.push({
          work_entry_id: item.work_entry_id,
          custom_rate_id: item.custom_rate_id,
          quantity: Number(item.quantity),
          rate_snapshot: Number(item.rate_snapshot),
        });
        map.set(item.work_entry_id, existing);
      });

      setCustomRatesByEntry(map);
    } catch (error) {
      console.error('Error fetching work entry custom rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, entryIds.join(',')]);

  useEffect(() => {
    fetchCustomRates();
  }, [fetchCustomRates]);

  // Helper to calculate total custom rates value for an entry
  const getEntryCustomRatesValue = useCallback((entryId: string): number => {
    const rates = customRatesByEntry.get(entryId) || [];
    return rates.reduce((sum, r) => sum + r.quantity * r.rate_snapshot, 0);
  }, [customRatesByEntry]);

  // Get total value of all custom rates across all entries
  const getTotalCustomRatesValue = useCallback((): number => {
    let total = 0;
    customRatesByEntry.forEach((rates) => {
      rates.forEach((r) => {
        total += r.quantity * r.rate_snapshot;
      });
    });
    return total;
  }, [customRatesByEntry]);

  return {
    customRatesByEntry,
    isLoading,
    getEntryCustomRatesValue,
    getTotalCustomRatesValue,
    refetch: fetchCustomRates,
  };
}
