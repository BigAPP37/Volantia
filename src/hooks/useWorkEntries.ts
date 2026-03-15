import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WorkEntry } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { format } from 'date-fns';

interface DbWorkEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  service_type: string;
  scope: string;
  full_diets_national: number;
  half_diets_national: number;
  full_diets_international: number;
  half_diets_international: number;
  overnights: number;
  night_hours: number;
  half_night_hours: number;
  extra_hours: number;
  kilometers: number;
  tips: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function dbToWorkEntry(db: DbWorkEntry): WorkEntry {
  return {
    id: db.id,
    date: db.date,
    startTime: db.start_time.slice(0, 5), // HH:mm
    endTime: db.end_time.slice(0, 5),
    breakMinutes: db.break_minutes,
    serviceType: db.service_type as WorkEntry['serviceType'],
    scope: db.scope as WorkEntry['scope'],
    fullDietsNational: db.full_diets_national,
    halfDietsNational: db.half_diets_national,
    fullDietsInternational: db.full_diets_international,
    halfDietsInternational: db.half_diets_international,
    overnights: db.overnights,
    nightHours: Number(db.night_hours),
    halfNightHours: Number(db.half_night_hours),
    extraHours: Number(db.extra_hours),
    kilometers: db.kilometers,
    tips: Number(db.tips),
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function useWorkEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localEntries, setLocalEntries] = useLocalStorage<WorkEntry[]>('volantia-entries', []);

  // Fetch entries from database or use local storage
  const fetchEntries = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        const mapped = (data as DbWorkEntry[]).map(dbToWorkEntry);
        setEntries(mapped);
      }
      setIsLoading(false);
    } else {
      setEntries(localEntries);
      setIsLoading(false);
    }
  }, [user, localEntries]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (user) {
      const { data, error } = await supabase
        .from('work_entries')
        .insert({
          user_id: user.id,
          date: entry.date,
          start_time: entry.startTime,
          end_time: entry.endTime,
          break_minutes: entry.breakMinutes,
          service_type: entry.serviceType,
          scope: entry.scope,
          full_diets_national: entry.fullDietsNational,
          half_diets_national: entry.halfDietsNational,
          full_diets_international: entry.fullDietsInternational,
          half_diets_international: entry.halfDietsInternational,
          overnights: entry.overnights,
          night_hours: entry.nightHours,
          half_night_hours: entry.halfNightHours,
          extra_hours: entry.extraHours,
          kilometers: entry.kilometers,
          tips: entry.tips,
          notes: entry.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        throw error;
      }

      const newEntry = dbToWorkEntry(data as DbWorkEntry);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    } else {
      const newEntry: WorkEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalEntries((prev) => [...prev, newEntry]);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    }
  }, [user, setLocalEntries]);

  const updateEntry = useCallback(async (id: string, updates: Partial<WorkEntry>) => {
    if (user) {
      const dbUpdates: Record<string, string | number | boolean | null> = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.breakMinutes !== undefined) dbUpdates.break_minutes = updates.breakMinutes;
      if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
      if (updates.scope !== undefined) dbUpdates.scope = updates.scope;
      if (updates.fullDietsNational !== undefined) dbUpdates.full_diets_national = updates.fullDietsNational;
      if (updates.halfDietsNational !== undefined) dbUpdates.half_diets_national = updates.halfDietsNational;
      if (updates.fullDietsInternational !== undefined) dbUpdates.full_diets_international = updates.fullDietsInternational;
      if (updates.halfDietsInternational !== undefined) dbUpdates.half_diets_international = updates.halfDietsInternational;
      if (updates.overnights !== undefined) dbUpdates.overnights = updates.overnights;
      if (updates.nightHours !== undefined) dbUpdates.night_hours = updates.nightHours;
      if (updates.halfNightHours !== undefined) dbUpdates.half_night_hours = updates.halfNightHours;
      if (updates.extraHours !== undefined) dbUpdates.extra_hours = updates.extraHours;
      if (updates.kilometers !== undefined) dbUpdates.kilometers = updates.kilometers;
      if (updates.tips !== undefined) dbUpdates.tips = updates.tips;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('work_entries')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating entry:', error);
        throw error;
      }

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );
    } else {
      setLocalEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );
    }
  }, [user, setLocalEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        throw error;
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      setLocalEntries((prev) => prev.filter((e) => e.id !== id));
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }, [user, setLocalEntries]);

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
