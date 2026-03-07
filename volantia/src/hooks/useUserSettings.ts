import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserSettings } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { defaultSettings } from '@/lib/constants';

interface DbUserSettings {
  id: string;
  user_id: string;
  base_salary: number;
  fixed_bonuses: number;
  irpf: number;
  social_security: number;
  mei: number;
  unemployment: number;
  full_diet_national: number;
  half_diet_national: number;
  overnight_national: number;
  full_diet_international: number;
  half_diet_international: number;
  overnight_international: number;
  weekend_multiplier: number;
  extra_hour_rate: number;
  night_hour_rate: number;
  half_night_hour_rate: number;
  kilometer_rate: number;
  show_diets: boolean;
  show_overnights: boolean;
  show_night_hours: boolean;
  show_extra_hours: boolean;
  show_kilometers: boolean;
  show_tips: boolean;
  company_name: string | null;
  company_cif: string | null;
  created_at: string;
  updated_at: string;
}

function dbToUserSettings(db: DbUserSettings): UserSettings {
  return {
    baseSalary: Number(db.base_salary),
    fixedBonuses: Number(db.fixed_bonuses),
    irpf: Number(db.irpf),
    socialSecurity: Number(db.social_security),
    mei: Number(db.mei),
    unemployment: Number(db.unemployment),
    fullDietNational: Number(db.full_diet_national),
    halfDietNational: Number(db.half_diet_national),
    overnightNational: Number(db.overnight_national),
    fullDietInternational: Number(db.full_diet_international),
    halfDietInternational: Number(db.half_diet_international),
    overnightInternational: Number(db.overnight_international),
    weekendMultiplier: Number(db.weekend_multiplier),
    extraHourRate: Number(db.extra_hour_rate),
    nightHourRate: Number(db.night_hour_rate),
    halfNightHourRate: Number(db.half_night_hour_rate),
    kilometerRate: Number(db.kilometer_rate),
    showDiets: db.show_diets,
    showOvernights: db.show_overnights,
    showNightHours: db.show_night_hours,
    showExtraHours: db.show_extra_hours,
    showKilometers: db.show_kilometers,
    showTips: db.show_tips,
    companyName: db.company_name || undefined,
    companyCIF: db.company_cif || undefined,
  };
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [localSettings, setLocalSettings] = useLocalStorage<UserSettings>('volantia-settings', defaultSettings);

  const fetchSettings = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        setSettings(defaultSettings);
      } else if (data) {
        setSettings(dbToUserSettings(data as DbUserSettings));
      } else {
        setSettings(defaultSettings);
      }
      setIsLoading(false);
    } else {
      setSettings(localSettings);
      setIsLoading(false);
    }
  }, [user, localSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    
    if (user) {
      const dbUpdates: Record<string, any> = {};
      if (updates.baseSalary !== undefined) dbUpdates.base_salary = updates.baseSalary;
      if (updates.fixedBonuses !== undefined) dbUpdates.fixed_bonuses = updates.fixedBonuses;
      if (updates.irpf !== undefined) dbUpdates.irpf = updates.irpf;
      if (updates.socialSecurity !== undefined) dbUpdates.social_security = updates.socialSecurity;
      if (updates.mei !== undefined) dbUpdates.mei = updates.mei;
      if (updates.unemployment !== undefined) dbUpdates.unemployment = updates.unemployment;
      if (updates.fullDietNational !== undefined) dbUpdates.full_diet_national = updates.fullDietNational;
      if (updates.halfDietNational !== undefined) dbUpdates.half_diet_national = updates.halfDietNational;
      if (updates.overnightNational !== undefined) dbUpdates.overnight_national = updates.overnightNational;
      if (updates.fullDietInternational !== undefined) dbUpdates.full_diet_international = updates.fullDietInternational;
      if (updates.halfDietInternational !== undefined) dbUpdates.half_diet_international = updates.halfDietInternational;
      if (updates.overnightInternational !== undefined) dbUpdates.overnight_international = updates.overnightInternational;
      if (updates.weekendMultiplier !== undefined) dbUpdates.weekend_multiplier = updates.weekendMultiplier;
      if (updates.extraHourRate !== undefined) dbUpdates.extra_hour_rate = updates.extraHourRate;
      if (updates.nightHourRate !== undefined) dbUpdates.night_hour_rate = updates.nightHourRate;
      if (updates.halfNightHourRate !== undefined) dbUpdates.half_night_hour_rate = updates.halfNightHourRate;
      if (updates.kilometerRate !== undefined) dbUpdates.kilometer_rate = updates.kilometerRate;
      if (updates.showDiets !== undefined) dbUpdates.show_diets = updates.showDiets;
      if (updates.showOvernights !== undefined) dbUpdates.show_overnights = updates.showOvernights;
      if (updates.showNightHours !== undefined) dbUpdates.show_night_hours = updates.showNightHours;
      if (updates.showExtraHours !== undefined) dbUpdates.show_extra_hours = updates.showExtraHours;
      if (updates.showKilometers !== undefined) dbUpdates.show_kilometers = updates.showKilometers;
      if (updates.showTips !== undefined) dbUpdates.show_tips = updates.showTips;
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
      if (updates.companyCIF !== undefined) dbUpdates.company_cif = updates.companyCIF;

      const { error } = await supabase
        .from('user_settings')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    } else {
      setLocalSettings(newSettings);
    }

    setSettings(newSettings);
  }, [user, settings, setLocalSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
  };
}
