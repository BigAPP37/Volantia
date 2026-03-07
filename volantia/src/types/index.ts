// Work Entry Types
export type ServiceType = 'regular' | 'extra' | 'rest' | 'sick';
export type ServiceScope = 'national' | 'international';

export interface WorkEntry {
  id: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  serviceType: ServiceType;
  scope: ServiceScope;
  
  // Variable concepts - National
  fullDietsNational: number;
  halfDietsNational: number;
  // Variable concepts - International
  fullDietsInternational: number;
  halfDietsInternational: number;
  overnights: number;
  nightHours: number;
  halfNightHours: number;
  extraHours: number;
  kilometers: number;
  tips: number;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// User Settings Types
export interface UserSettings {
  // Salary
  baseSalary: number;
  fixedBonuses: number;
  
  // Deductions (percentages)
  irpf: number;
  socialSecurity: number; // Contingencias Comunes
  mei: number;
  unemployment: number;
  
  // Rates - National
  fullDietNational: number;
  halfDietNational: number;
  overnightNational: number;
  
  // Rates - International
  fullDietInternational: number;
  halfDietInternational: number;
  overnightInternational: number;
  
  // Rates - Weekend (optional multiplier)
  weekendMultiplier: number;
  
  // Other rates
  extraHourRate: number;
  nightHourRate: number;
  halfNightHourRate: number;
  kilometerRate: number;
  
  // Toggle visibility
  showDiets: boolean;
  showOvernights: boolean;
  showNightHours: boolean;
  showExtraHours: boolean;
  showKilometers: boolean;
  showTips: boolean;
  
  // Company info (from OCR)
  companyName?: string;
  companyCIF?: string;
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

// Monthly Summary
export interface MonthlySummary {
  month: string; // YYYY-MM
  totalWorkDays: number;
  totalHours: number;
  totalBreakMinutes: number;
  
  // Accumulated concepts - National
  totalFullDietsNational: number;
  totalHalfDietsNational: number;
  // Accumulated concepts - International
  totalFullDietsInternational: number;
  totalHalfDietsInternational: number;
  totalOvernights: number;
  totalNightHours: number;
  totalHalfNightHours: number;
  totalExtraHours: number;
  totalKilometers: number;
  totalTips: number;
  
  // Calculated values
  grossEarnings: number;
  deductions: number;
  netEstimate: number;
}

// Calendar Day
export interface CalendarDay {
  date: string;
  entries: WorkEntry[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// App State
export interface AppState {
  isAuthenticated: boolean;
  isGuestMode: boolean;
  theme: Theme;
  isOnline: boolean;
  isSyncing: boolean;
}
