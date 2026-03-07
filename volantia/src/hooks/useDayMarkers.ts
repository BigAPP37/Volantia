import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DayMarker, MarkerType } from '@/types/dayMarker';
import { useToast } from '@/hooks/use-toast';

export function useDayMarkers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [markers, setMarkers] = useState<DayMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarkers = useCallback(async () => {
    if (!user) {
      setMarkers([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('day_markers')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setMarkers((data as DayMarker[]) || []);
    } catch (error) {
      console.error('Error fetching day markers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  const addMarkers = async (dates: string[], markerType: MarkerType, notes?: string) => {
    if (!user) return;

    try {
      // Upsert markers for all selected dates
      const markersToInsert = dates.map(date => ({
        user_id: user.id,
        date,
        marker_type: markerType,
        notes: notes || null,
      }));

      const { error } = await supabase
        .from('day_markers')
        .upsert(markersToInsert, { onConflict: 'user_id,date' });

      if (error) throw error;

      toast({
        title: '✅ Días marcados',
        description: `${dates.length} día(s) marcado(s) como ${markerType}`,
      });

      await fetchMarkers();
    } catch (error) {
      console.error('Error adding markers:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron guardar los marcadores',
        variant: 'destructive',
      });
    }
  };

  const removeMarker = async (date: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('day_markers')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) throw error;

      toast({
        title: '✅ Marcador eliminado',
      });

      await fetchMarkers();
    } catch (error) {
      console.error('Error removing marker:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar el marcador',
        variant: 'destructive',
      });
    }
  };

  const removeMarkers = async (dates: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('day_markers')
        .delete()
        .eq('user_id', user.id)
        .in('date', dates);

      if (error) throw error;

      toast({
        title: '✅ Marcadores eliminados',
        description: `${dates.length} marcador(es) eliminado(s)`,
      });

      await fetchMarkers();
    } catch (error) {
      console.error('Error removing markers:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron eliminar los marcadores',
        variant: 'destructive',
      });
    }
  };

  const getMarkerForDate = (date: string): DayMarker | undefined => {
    return markers.find(m => m.date === date);
  };

  return {
    markers,
    isLoading,
    addMarkers,
    removeMarker,
    removeMarkers,
    getMarkerForDate,
    refetch: fetchMarkers,
  };
}
