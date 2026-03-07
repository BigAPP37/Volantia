import { UserSettings } from '@/types';

export const defaultSettings: UserSettings = {
  // Salary
  baseSalary: 1500,
  fixedBonuses: 200,
  
  // Deductions (percentages)
  irpf: 12,
  socialSecurity: 4.7, // Contingencias Comunes
  mei: 0.13,
  unemployment: 1.55,
  
  // Rates - National
  fullDietNational: 35,
  halfDietNational: 17.50,
  overnightNational: 40,
  
  // Rates - International
  fullDietInternational: 50,
  halfDietInternational: 25,
  overnightInternational: 60,
  
  // Weekend multiplier
  weekendMultiplier: 1.25,
  
  // Other rates
  extraHourRate: 15,
  nightHourRate: 3,
  halfNightHourRate: 1.5,
  kilometerRate: 0.19,
  
  // Toggle visibility (all visible by default)
  showDiets: true,
  showOvernights: true,
  showNightHours: true,
  showExtraHours: true,
  showKilometers: true,
  showTips: true,
};
