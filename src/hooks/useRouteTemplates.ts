import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RouteTemplate, RouteTemplateInsert } from '@/types/routeTemplate';

export function useRouteTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('route_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      setTemplates(data?.map(t => ({
        id: t.id,
        user_id: t.user_id,
        name: t.name,
        start_time: t.start_time,
        end_time: t.end_time,
        break_minutes: t.break_minutes,
        service_type: t.service_type,
        scope: t.scope,
        full_diets_national: Number(t.full_diets_national),
        half_diets_national: Number(t.half_diets_national),
        full_diets_international: Number(t.full_diets_international),
        half_diets_international: Number(t.half_diets_international),
        overnights: Number(t.overnights),
        night_hours: Number(t.night_hours),
        half_night_hours: Number(t.half_night_hours),
        extra_hours: Number(t.extra_hours),
        kilometers: Number(t.kilometers),
        display_order: t.display_order,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = async (template: Omit<RouteTemplateInsert, 'user_id' | 'display_order'>) => {
    if (!user) throw new Error('No user');

    const { data, error } = await supabase
      .from('route_templates')
      .insert({
        ...template,
        user_id: user.id,
        display_order: templates.length,
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchTemplates();
    return data;
  };

  const updateTemplate = async (id: string, updates: Partial<RouteTemplateInsert>) => {
    const { error } = await supabase
      .from('route_templates')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('route_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchTemplates();
  };

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
