export interface CustomRate {
  id: string;
  userId: string;
  name: string;
  rate: number;
  rateType: 'fixed' | 'quantity';
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkEntryCustomRate {
  id: string;
  workEntryId: string;
  customRateId: string;
  quantity: number;
  rateSnapshot: number;
  createdAt: string;
}

export interface SelectedCustomRate {
  customRateId: string;
  quantity: number;
  rate: number;
  name: string;
  rateType: 'fixed' | 'quantity';
}
