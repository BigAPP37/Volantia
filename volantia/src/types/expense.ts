export interface WorkEntryExpense {
  id: string;
  work_entry_id: string;
  expense_type: 'fuel' | 'toll' | 'parking' | 'other';
  amount: number;
  description?: string;
  ticket_image_url?: string;
  is_company_paid: boolean;
  created_at: string;
}

export const EXPENSE_TYPES = [
  { value: 'fuel', label: 'Gasoil', icon: 'Fuel' },
  { value: 'toll', label: 'Peaje', icon: 'Receipt' },
  { value: 'parking', label: 'Parking', icon: 'ParkingCircle' },
  { value: 'other', label: 'Otro', icon: 'MoreHorizontal' },
] as const;

export type ExpenseType = typeof EXPENSE_TYPES[number]['value'];
